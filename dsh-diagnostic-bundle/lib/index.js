/**
 * dsh-diagnostic-bundle host entry（模块化版）。
 *
 * 组装各职责模块（config/runner/topic/redactor/analyzer/manifest/collector），
 * 通过 webServer HTTP 路由向客户端提供 RPC（模式同 dshmarket）。
 * 生命周期：agent/error 与 session/event 事件 → 错误上下文与默认主题。
 *
 * 兼容性保留：
 *  - webServer 必须用 ctx.inject(['webServer']) 延迟挂载（Bug#1 修复）
 *  - RPC method 兼容 dxb: 前缀（Bug#2 修复）
 */
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sendJson, readJsonBody, sameOrigin } from './http.js';
import { resolveConfig } from './config.js';
import { runHelper, HELPER } from './runner.js';
import { sanitizeTopic, appendKeywords, resolveTopic, defaultTopic, osTag } from './topic.js';
import { REL_OK, parseKeywords, normalizePatches, buildRules, runRedact } from './redactor.js';
import { analyze, llmKeyOf } from './analyzer.js';
import { buildManifest, buildReadme, ITEM_PREFIX, hitsFor } from './manifest.js';
import { createRun, startCollect, elevateRun, statusOf } from './collector.js';

export const name = 'dsh-diagnostic-bundle';

const PKG_ROOT = path.dirname(fileURLToPath(import.meta.url));
const RPC_PATH = '/dsh-diagnostic-bundle/rpc';
const HEALTH_PATH = '/dsh-diagnostic-bundle/health';
let PKG_VERSION = null;
try {
    PKG_VERSION = JSON.parse(readFileSync(path.join(PKG_ROOT, '..', 'package.json'), 'utf8')).version || null;
} catch (e) { PKG_VERSION = null; }

export function apply(ctx, config) {
    const cfg = resolveConfig(config || {});
    cfg.version = cfg.version || PKG_VERSION || '1.1.1';

    const runs = new Map();
    let serialCounter = 0;
    const lastError = new Map();
    const errorRings = new Map(); // sessionId -> [{time,sessionId,message}] 最近 20 条
    const globalErrors = [];      // 全局最近 20 条（跨会话，兜底）
    const ringPush = (map, key, item) => {
        const arr = map.get(key) || [];
        arr.push(item);
        if (arr.length > 20) arr.splice(0, arr.length - 20);
        map.set(key, arr);
    };
    const firstUser = new Map();

    /* ------------------------- 事件监听（错误上下文） ------------------------- */
    const offErr = ctx.on('agent/error', (payload) => {
        try {
            const agent = payload && payload.agent;
            const sessionId = (agent && agent.session && agent.session.id) || (agent && agent.id) || '';
            if (!sessionId) return;
            const err = payload.error;
            let msg = '未知错误';
            if (err instanceof Error) msg = err.message || String(err);
            else if (typeof err === 'string') msg = err;
            else if (err !== null && err !== undefined) msg = String(err);
            const rec = { time: new Date().toISOString(), sessionId, message: msg.slice(0, 2000) };
            lastError.set(sessionId, { message: msg.slice(0, 2000), page: 'conversation', occurredAt: rec.time });
            ringPush(errorRings, sessionId, rec);
            ringPush(globalErrors, 'g', rec);
        } catch (e) {}
    });
    const offSe = ctx.on('session/event', (session, event) => {
        try {
            if (!session || !session.id) return;
            if (event && event.type === 'user/message') {
                const d = event.data;
                if (d && typeof d.content === 'string' && !firstUser.has(session.id)) {
                    firstUser.set(session.id, d.content);
                }
            }
        } catch (e) {}
    });

    const lastErrorFor = (sessionId) => lastError.get(sessionId) || null;

    /** 插件适配分析：采集数据 + 宿主错误匹配 → 每个插件的详细问题原因。 */
    function analyzePlugins(pl, rings, globalErrs) {
        if (!pl || !Array.isArray(pl.plugins)) return pl;
        const allErrs = (rings || []).concat(globalErrs || []);
        for (const p of pl.plugins) {
            const runtimeErrors = [];
            const probs = Array.isArray(p.problems) ? p.problems.slice() : [];
            const short = p.name.indexOf('/') > 0 ? p.name.split('/')[1] : p.name;
            // 1) 运行时错误匹配：错误消息含插件全名，或含短名且语义上指向插件
            for (const e of allErrs) {
                const msg = String((e && e.message) || '');
                if (!msg) continue;
                const hit = msg.indexOf(p.name) >= 0 ||
                    (msg.indexOf(short) >= 0 && /plugin|module|package|加载|插件|apply|require/i.test(msg));
                if (hit) {
                    runtimeErrors.push({ time: (e && e.time) || null, message: msg.slice(0, 500) });
                    if (runtimeErrors.length >= 3) break;
                }
            }
            if (runtimeErrors.length) {
                probs.push({ type: 'runtime_error', detail: '宿主记录到 ' + runtimeErrors.length + ' 条与该插件相关的运行时错误，最近一条：「' + runtimeErrors[0].message + '」' });
            }
            // 2) 版本兼容性（声明 ^x.y.z / ~x.y.z vs 实际安装）
            if (p.declaredVersion && p.installedVersion && !/builtin/i.test(String(p.installedVersion))) {
                const dm = String(p.declaredVersion).match(/(\d+)\.(\d+)\.(\d+)/);
                const im = String(p.installedVersion).match(/^(\d+)\.(\d+)\.(\d+)/);
                if (dm && im) {
                    if (dm[1] !== im[1]) {
                        probs.push({ type: 'version_mismatch', detail: '主版本不一致：声明 ' + dm[1] + '.x，实际安装 ' + im[1] + '.x，可能存在不兼容 API 变更，建议按声明版本重装' });
                    } else if (/^~/.test(String(p.declaredVersion)) && dm[2] !== im[2]) {
                        probs.push({ type: 'version_mismatch', detail: '次版本不一致：声明 ~' + dm[1] + '.' + dm[2] + '，实际安装 ' + im[1] + '.' + im[2] + '，~ 限定次版本应保持一致' });
                    }
                }
            }
            // 3) 汇总
            p.status = probs.length ? 'problem' : 'ok';
            p.problems = probs;
            p.runtimeErrors = runtimeErrors;
        }
        const total = pl.plugins.length;
        const problemCount = pl.plugins.filter((x) => (x.problems || []).length).length;
        pl.summary = {
            total,
            ok: total - problemCount,
            problems: problemCount,
            details: pl.plugins.filter((x) => (x.problems || []).length)
                .map((x) => x.name + '：' + x.problems.map((z) => z.detail).join('；')).slice(0, 20),
        };
        return pl;
    }

    /** 会话活动时间线：readSurface → 摘要（≤50 条，每条文本 ≤80 字；10s 超时降级）。 */
    async function buildTimeline(ctx2, sessionId, cfg2) {
        const sq = ctx2.get('sessionQuery');
        if (!sq || typeof sq.readSurface !== 'function') return { available: false, reason: 'no sessionQuery' };
        const timer = setTimeout(() => {}, 0);
        try {
            const snap = await Promise.race([
                Promise.resolve().then(() => sq.readSurface(sessionId)),
                new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000)),
            ]);
            if (!snap || !Array.isArray(snap.events)) return { available: false, reason: 'no surface' };
            const events = [];
            for (const ev of snap.events.slice(-50)) {
                const d = (ev && ev.data) || {};
                const item = { t: (ev && ev.t) || null, type: ev && ev.type };
                if (ev.type === 'user/message') {
                    item.text = String(d.content || d.text || '').slice(0, 80);
                } else if (ev.type === 'assistant/message') {
                    item.text = String(d.content || d.text || '').slice(0, 80);
                    if (d.model) item.model = String(d.model).slice(0, 60);
                } else if (ev.type === 'tool/result') {
                    item.name = String(d.name || d.tool || '').slice(0, 60);
                    item.ok = d.ok === undefined ? null : !!d.ok;
                } else {
                    item.text = String(d.content || d.text || '').slice(0, 80);
                }
                if (item.text || item.name) events.push(item);
            }
            return { available: true, count: events.length, sessionId, events };
        } catch (e) {
            return { available: false, reason: String((e && e.message) || 'error').slice(0, 120) };
        } finally {
            clearTimeout(timer);
        }
    }
    const defaultTopicFor = (sessionId) =>
        defaultTopic(ctx, sessionId, firstUser.get(sessionId) || '', cfg);

    /* ------------------------------ RPC handlers ------------------------------ */
    const handlers = {
        async collect(args) {
            const sessionId = (args && args.sessionId) || '';
            serialCounter += 1;
            const netUrls = effectiveProviders(cfg).map((p) => p.baseUrl).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
            const runId = await startCollect(sessionId, serialCounter, {
                runs,
                defaultTopic: defaultTopicFor,
                lastError: lastErrorFor,
                netUrls,
            }, cfg);
            return { runId };
        },

        status(args) {
            const run = runs.get(String(args && args.runId || ''));
            if (!run) throw new Error('run not found');
            return statusOf(run);
        },

        async elevate(args) {
            const run = runs.get(String(args && args.runId || ''));
            if (!run) throw new Error('run not found');
            return await elevateRun(run, args, cfg);
        },

        async read(args) {
            const run = runs.get(String(args && args.runId || ''));
            if (!run) throw new Error('run not found');
            const rel = String(args && args.rel || '');
            if (!REL_OK.test(rel)) throw new Error('invalid rel');
            const from = Math.max(1, parseInt(args.from, 10) || 1);
            const count = Math.min(cfg.ui.pageSize, Math.max(1, parseInt(args.count, 10) || 100));
            const r = await runHelper(['read', run.staging, rel, String(from), String(count)], { capMs: 15000 });
            return { total: r.total || 0, lines: r.lines || [], from };
        },

        async preview(args) {
            const run = runs.get(String(args && args.runId || ''));
            if (!run) throw new Error('run not found');
            const checks = Object.assign({ environment: true, logs: true, config: true, system: true }, args.checks || {});
            const keywords = parseKeywords(args.keywords, cfg);
            const masks = Object.assign({ email: true, ipv4: true }, args.masks || {});
            const patches = normalizePatches(args.patches || {}, cfg);
            const userSummary = String((args && args.userSummary) || '').slice(0, cfg.userSummary.maxChars);
            run.checks = checks;
            run.keywords = keywords;
            run.masks = masks;
            run.patches = patches;
            run.userSummary = userSummary;
            run.errCtx = run.errCtx || lastErrorFor(run.sessionId);
            run.topic = resolveTopic(run.topicDefault || '', args.topic, (run.errCtx && run.errCtx.message) || '', cfg);

            // 1.3.2：浏览器错误（客户端 window.onerror/unhandledrejection 环形队列）
            const be = Array.isArray(args.browserErrors) ? args.browserErrors.slice(-20) : [];
            run.browserErrors = be.map((b) => ({
                time: String((b && b.time) || ''),
                type: String((b && b.type) || 'error').slice(0, 20),
                message: String((b && b.message) || '').slice(0, 500),
            })).filter((b) => b.message);

            // 1.3.2：errors.json（宿主端 agent/error 环形队列 + 浏览器错误）
            try {
                const ring = (errorRings.get(run.sessionId) || []).slice(-20);
                const all = globalErrors.slice(-20);
                const hostRecs = (ring.length ? ring : all).map((e) => ({
                    time: e.time, sessionId: e.sessionId, message: String(e.message || '').slice(0, 2000),
                }));
                await fs.writeFile(path.join(run.staging, 'originals', 'errors.json'),
                    JSON.stringify({ host: hostRecs, browser: run.browserErrors }, null, 2), { mode: 0o600 });
            } catch (e) {}

            // 1.3.2：session-timeline.json（会话活动时间线，readSurface 超时降级不阻塞）
            try {
                const timeline = await buildTimeline(ctx, run.sessionId, cfg);
                await fs.writeFile(path.join(run.staging, 'originals', 'session-timeline.json'),
                    JSON.stringify(timeline, null, 2), { mode: 0o600 });
            } catch (e) {}

            // 1.3.3：插件适配分析（采集数据 + 宿主错误匹配 → 详细问题原因），写 originals/plugins.json
            try {
                const plRaw = await fs.readFile(path.join(run.staging, 'originals', 'plugins.json'), 'utf8');
                const pl = analyzePlugins(JSON.parse(plRaw), errorRings.get(run.sessionId) || [], globalErrors);
                run.plugins = pl;
                await fs.writeFile(path.join(run.staging, 'originals', 'plugins.json'), JSON.stringify(pl, null, 2), { mode: 0o600 });
            } catch (e) {}

            // 1) Worker 线程脱敏（最终内容 = 过滤规则(编辑补丁(原始文件))）
            const red = await runRedact(run, checks, keywords, masks, patches, cfg);
            run.preview = red;
            run.redactionRules = buildRules(keywords, masks, cfg);

            // 2) AI 问题总结（规则引擎 + 可插拔 LLM 深度分析）
            const ai = await analyze({
                error: run.errCtx ? run.errCtx.message : '',
                topic: run.topic,
                logTail: await tailLog(run),
                envSummary: summarizeEnv(run),
                sysSummary: summarizeSys(run),
                userSummary: run.userSummary,
                generatedAt: new Date().toISOString(),
            }, cfg, { useLLM: !(args && args.useLLM === false) });
            run.aiSummary = { text: ai.text, provider: ai.provider, llm: ai.llm || null };
            run.aiIssues = ai.issues || [];
            // 可执行修复：信号命中 → 内置命令表（人工审核；执行需 UI 二次确认）
            run.fixes = [];
            run.cmdAllowlist = [];
            for (const issue of run.aiIssues) {
                const sig = (cfg.aiSummary.signals || []).find((s2) => s2.id === issue.id);
                if (sig && Array.isArray(sig.fixes)) {
                    for (const fx of sig.fixes) {
                        const fix = Object.assign({}, fx, { id: sig.id + '-' + run.fixes.length, signal: issue.label });
                        run.fixes.push(fix);
                        run.cmdAllowlist.push(fix.command);
                    }
                }
            }

            // 3) 落盘 ai-summary.txt 与 summary.txt（个人总结，可选）
            if (run.aiSummary.text) {
                await fs.writeFile(path.join(run.staging, 'final', cfg.aiSummaryFilename), run.aiSummary.text, { mode: 0o600 });
            }
            if (run.userSummary) {
                await fs.writeFile(path.join(run.staging, 'final', cfg.userSummary.filename), run.userSummary, { mode: 0o600 });
            }

            return {
                totalHits: red.totalHits,
                counts: red.counts,
                files: red.files,
                topic: run.topic,
                aiSummary: { text: ai.text, provider: ai.provider, issues: ai.issues, llm: ai.llm || null },
                fixes: (run.fixes || []).map((f) => ({ id: f.id, title: f.title, command: f.command, needRoot: !!f.needRoot, signal: f.signal })),
            };
        },

        async pack(args) {
            const run = runs.get(String(args && args.runId || ''));
            if (!run) throw new Error('run not found');
            if (!run.preview) throw new Error('preview first');

            // 打包完成时刻（本地时区）
            const t = await runHelper(['time'], { capMs: 10000 });
            const now = t.local ? t : (t.now || {});

            // 文件名模板（配置驱动）+ 流水号冲突递增
            const os = osTag(run.items && run.items.env);
            const serialDigits = cfg.pack.serialDigits;
            const attempts = cfg.pack.serialMaxAttempts;
            let filename = '';
            let serial = 1;
            let zipPath = '';
            for (let i = 0; i < attempts; i++) {
                serial = i + 1;
                const sn = String(serial).padStart(serialDigits, '0');
                filename = cfg.pack.filenameTemplate
                    .replace('{time}', now.local || '')
                    .replace('{os}', os)
                    .replace('{topic}', run.topic || cfg.topic.fallback)
                    .replace('{serial}', sn);
                zipPath = path.join(run.desktop.dir, filename);
                const exists = await runHelper(['exists', zipPath], { capMs: 10000 });
                if (!exists.exists) break;
            }

            // manifest + README（注入 createdAt）
            const man = buildManifest(run, serial, cfg);
            man.createdAt = now.iso || null;
            man.timezone = now.timezone || null;
            const readme = buildReadme(run, man, run.desktop.dir, cfg);
            await fs.writeFile(path.join(run.staging, 'final', 'manifest.json'), JSON.stringify(man, null, 2), { mode: 0o600 });
            await fs.writeFile(path.join(run.staging, 'final', 'README.txt'), readme, { mode: 0o600 });

            const p = await runHelper(['pack', run.staging, zipPath], { capMs: cfg.collect.overallTimeoutMs });
            run.phase = 'done';
            run.result = {
                filename,
                zipPath,
                dir: run.desktop.dir,
                fallbackUsed: !!run.desktop.fallbackUsed,
                bytes: p.bytes || 0,
                entries: p.entries || [],
                createdAt: now.iso || null,
                totalHits: run.preview.totalHits,
                counts: run.preview.counts,
                topic: run.topic,
                manifest: man,
            };
            return run.result;
        },

        async cleanup(args) {
            const run = runs.get(String(args && args.runId || ''));
            if (run) {
                try { await runHelper(['cleanup', run.staging], { capMs: 10000 }); } catch (e) {}
                runs.delete(run.id);
            }
            return { ok: true };
        },

        context() {
            return {
                supportEmail: cfg.supportEmail,
                expert: false,
                llmProviders: effectiveProviders(cfg).map((p) => ({
                    id: p.id,
                    name: p.name,
                    baseUrl: p.baseUrl,
                    model: p.model,
                    enabled: p.enabled !== false,
                    hasKey: !!llmKeyOf(p, cfg),
                })),
                llmEnabled: cfg.aiSummary.enabled !== false,
            };
        },

        /** UI 添加/编辑 provider（密钥独立存储，与 Harness 自身 API 配置分开）。 */
        llmProviderSave(args) {
            const p = (args && args.provider) || {};
            const id = String(p.id || '').trim() || ('p' + Date.now().toString(36));
            const name = String(p.name || '').trim().slice(0, 40) || id;
            const baseUrl = String(p.baseUrl || '').trim().slice(0, 200);
            if (!/^https?:\/\//i.test(baseUrl)) throw new Error('baseUrl 必须是 http(s) 地址');
            const model = String(p.model || '').trim().slice(0, 80);
            if (!model) throw new Error('缺少 model');
            const apiKey = String(p.apiKey || '').trim();
            const entry = { id, name, baseUrl, model, apiKey, enabled: p.enabled !== false };
            const ui = readLlmStore() || [];
            const i = ui.findIndex((x) => x.id === id);
            if (i >= 0) ui[i] = entry;
            else ui.push(entry);
            writeLlmStore(ui);
            return { saved: id, hasKey: !!apiKey };
        },

        llmProviderDelete(args) {
            const id = String(args && args.id || '');
            const ui = readLlmStore();
            if (!ui) return { deleted: id };
            writeLlmStore(ui.filter((x) => x.id !== id));
            return { deleted: id };
        },

        /** 执行内置修复命令（命令来自 signals.fixes 人工审核表；UI 已二次确认）。 */
        async runFix(args) {
            const run = runs.get(String(args && args.runId || ''));
            if (!run) throw new Error('run not found');
            const fixId = String(args && args.fixId || '');
            const fixes = run.fixes || [];
            const fix = fixes.find((f) => String(f.id) === fixId);
            if (!fix || !fix.command) throw new Error('fix not found');
            if (!run.cmdAllowlist || run.cmdAllowlist.indexOf(fix.command) < 0) throw new Error('fix command not allowed');
            const r = await runHelper(['runfix', fix.command, '30000'], { capMs: 40000 });
            return { ok: !!r.ok, exitCode: r.exitCode != null ? r.exitCode : 0, output: r.output || (r.error || '') };
        },

        async openFolder(args) {
            const dir = String((args && args.dir) || '');
            if (!dir) throw new Error('dir required');
            // 尝试用文件管理器打开（幂等失败可忽略）
            try {
                const { spawn } = await import('node:child_process');
                const child = spawn(process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open', [dir], { detached: true, stdio: 'ignore' });
                child.unref();
            } catch (e) {}
            return { ok: true };
        },

        async debug(args) {
            // 调试/专家工具：完整跑一遍 collect→preview→pack→cleanup
            const sessionId = String((args && args.sessionId) || '');
            serialCounter += 1;
            const netUrls = effectiveProviders(cfg).map((p) => p.baseUrl).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
            const runId = await startCollect(sessionId, serialCounter, { runs, defaultTopic: defaultTopicFor, lastError: lastErrorFor, netUrls }, cfg);
            const run = runs.get(runId);
            // 等待采集完成
            for (let i = 0; i < 200; i++) {
                if (run.phase !== 'collecting') break;
                await new Promise((r) => setTimeout(r, 250));
            }
            if (run.phase === 'failed') throw new Error('collect failed: ' + run.error);
            // 权限不足项按「跳过」处理
            if (run.needsElevation) await elevateRun(run, { action: 'skip' }, cfg);
            const st = statusOf(run);
            const pre = await handlers.preview({ runId, checks: { environment: true, logs: true, config: true, system: true }, keywords: '', masks: {}, patches: {}, topic: '', userSummary: '' });
            const res = await handlers.pack({ runId });
            await handlers.cleanup({ runId });
            return { status: st, preview: { totalHits: pre.totalHits, counts: pre.counts, aiIssues: pre.aiSummary.issues }, result: res };
        },
    };

    /* ------------------------------ 路由挂载 ------------------------------ */
    async function handleRpc(request, response) {
        if (request.method === 'GET') {
            sendJson(response, 200, { ok: true, plugin: 'dsh-diagnostic-bundle', version: cfg.version });
            return;
        }
        if (request.method !== 'POST') {
            sendJson(response, 405, { ok: false, error: 'method not allowed' });
            return;
        }
        let body = null;
        try { body = await readJsonBody(request, 1 * 1024 * 1024); } catch (e) {}
        if (!body || typeof body.method !== 'string') {
            sendJson(response, 400, { ok: false, error: 'bad request' });
            return;
        }
        // 兼容带 dxb: 前缀的调用（Bug#2）
        const method = body.method.indexOf('dxb:') === 0 ? body.method.slice(4) : body.method;
        const fn = handlers[method];
        if (!fn) {
            sendJson(response, 404, { ok: false, error: 'unknown method: ' + method });
            return;
        }
        try {
            const data = await fn(body.args || {});
            sendJson(response, 200, { ok: true, data });
        } catch (e) {
            sendJson(response, 200, { ok: false, error: String((e && e.message) || e) });
        }
    }

    let routesMounted = false;
    let offInject = null;
    let routeDisposers = [];
    offInject = ctx.inject(['webServer'], (host) => {
        if (routesMounted) return null;
        const ws = ctx.get('webServer');
        if (!ws || typeof ws.register !== 'function') return null;
        routesMounted = true;
        const d1 = ws.register({ kind: 'exact', path: RPC_PATH, handler: handleRpc });
        const d2 = ws.register({ kind: 'exact', path: HEALTH_PATH, handler: handleRpc });
        routeDisposers = [d1, d2].filter(Boolean);
        return () => { routeDisposers.forEach((d) => { try { d(); } catch (e) {} }); };
    });

    return () => {
        try { if (offInject) offInject(); } catch (e) {}
        try { routeDisposers.forEach((d) => { d(); }); } catch (e) {}
        try { offErr(); } catch (e) {}
        try { offSe(); } catch (e) {}
        runs.forEach((run) => {
            try { runHelper(['cleanup', run.staging], { capMs: 10000 }).catch(() => {}); } catch (e) {}
        });
        runs.clear();
    };
}

/* ------------------------------ 分析输入构造 ------------------------------ */

/** 读采集日志尾部（最近 N 行）供分析引擎使用。 */
async function tailLog(run, cfg) {
    const cfg2 = cfg || resolveConfig({});
    const items = run.items || {};
    const files = (items.logs && items.logs.files) || [];
    if (!files.length) return '';
    try {
        const first = files[0];
        const r = await runHelper(['tail', run.staging, String(first.rel), String(cfg2.aiSummary.logTailLines)], { capMs: 15000 });
        return String(r.text || '');
    } catch (e) {
        return '';
    }
}

/** 环境数据摘要（供分析引擎匹配症状）。 */
/** LLM Provider 独立存储：~/.dsh/dxb-llm-providers.json（0600，仅当前用户）。
 * 与 Harness 自身的 API 配置（.credentials.yaml 等）完全分离；此文件被
 * configExclude(/dxb-llm/i) 排除，永不进入诊断包。 */
const LLM_STORE_PATH = path.join(os.homedir(), '.dsh', 'dxb-llm-providers.json');

function readLlmStore() {
    try {
        const raw = readFileSync(LLM_STORE_PATH, 'utf8');
        const j = JSON.parse(raw);
        if (j && Array.isArray(j.providers)) return j.providers;
    } catch (e) {}
    return null;
}

function writeLlmStore(providers) {
    writeFileSync(LLM_STORE_PATH, JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), providers }, null, 2), { mode: 0o600 });
}

/** 合并生效 providers：内置默认 < profile config < UI 存储（按 id 覆盖）。 */
function effectiveProviders(cfg) {
    const base = ((cfg.aiSummary && cfg.aiSummary.providers) || []).slice();
    const ui = readLlmStore();
    if (!ui) return base;
    const out = base.slice();
    for (const p of ui) {
        const i = out.findIndex((x) => x.id === p.id);
        if (i >= 0) out[i] = Object.assign({}, out[i], p);
        else out.push(p);
    }
    return out;
}

function summarizeEnv(run) {
    const d = run.items && run.items.env && run.items.env.data;
    if (!d) return '';
    try {
        const os = d.os || {};
        const rt = d.runtimes || {};
        const gpu = Array.isArray(d.gpu) ? d.gpu.map((g) => String(g.name || g)).join(', ') : '';
        return [os.name, os.version, os.kernel, rt.node, rt.python, d.harness && d.harness.version, gpu, d.memoryTotalMB ? 'memoryTotalMB=' + d.memoryTotalMB : ''].filter(Boolean).join(' ');
    } catch (e) {
        return '';
    }
}

/** 系统数据摘要（GPU/内存/磁盘行，供分析引擎匹配症状）。 */
function summarizeSys(run) {
    const d = run.items && run.items.system && run.items.system.data;
    if (!d) return '';
    const parts = [];
    try {
        if (d.gpu && Array.isArray(d.gpu)) parts.push('gpu:' + d.gpu.map((g) => JSON.stringify(g)).join('|'));
        if (d.memory && d.memory.mem) parts.push('mem:' + JSON.stringify(d.memory.mem));
        if (d.disk && Array.isArray(d.disk)) {
            d.disk.forEach((row) => { if (row) parts.push('disk:' + JSON.stringify(row)); });
        }
        if (d.ports && Array.isArray(d.ports) && d.ports.length) parts.push('ports:' + d.ports.length);
        if (d.plugins) {
            if (Array.isArray(d.plugins.bundles)) parts.push('bundles:' + d.plugins.bundles.join(','));
            if (d.plugins.dependencies && typeof d.plugins.dependencies === 'object') {
                const ks = Object.keys(d.plugins.dependencies).slice(0, 30);
                parts.push('deps:' + ks.map((k) => k + '@' + d.plugins.dependencies[k]).join(' '));
            }
        }
    } catch (e) {}
    return parts.join(' ');
}
