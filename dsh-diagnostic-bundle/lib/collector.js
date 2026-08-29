/**
 * collector.js — 采集运行状态机（配置驱动）。
 * IDLE → COLLECTING → READY(REVIEW) / FAILED；权限不足项进入提权流程。
 */
import { runHelper } from './runner.js';
import { resolveConfig } from './config.js';

export function rand() {
    return Math.random().toString(36).slice(2, 10);
}

export function createRun(sessionId, serialCounter, cfg = resolveConfig({})) {
    return {
        id: 'run' + serialCounter,
        sessionId: String(sessionId || ''),
        staging: cfg.pack.stagingPrefix + rand(),
        phase: 'collecting',
        items: null,
        needsElevation: false,
        elevationState: 'none',
        error: null,
        desktop: null,
        topicDefault: '',
        errCtx: null,
        topic: '',
        checks: null,
        keywords: null,
        masks: null,
        patches: null,
        preview: null,
        userSummary: '',
        aiSummary: null,
        aiIssues: [],
        result: null,
    };
}

/** 启动采集：init（建目录/桌面解析）→ 异步 collect → 权限不足则 needsElevation。 */
export async function startCollect(sessionId, serialCounter, hooks, cfg = resolveConfig({})) {
    const run = createRun(sessionId, serialCounter, cfg);
    hooks.runs.set(run.id, run);
    const init = await runHelper(['init', run.staging], { capMs: cfg.collect.initTimeoutMs });
    run.desktop = init.desktop || { dir: '/tmp', fallbackUsed: true };
    run.topicDefault = hooks.defaultTopic(run.sessionId);
    run.errCtx = hooks.lastError(run.sessionId);
    (async () => {
        try {
            const netUrls = (hooks.netUrls || []).filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u)).slice(0, 6);
            const r = await runHelper(['collect', run.staging, JSON.stringify({ elevated: [], netUrls })], { capMs: cfg.collect.overallTimeoutMs });
            run.items = { env: r.env, logs: r.logs, config: r.config, system: r.system, plugins: r.plugins || { status: 'missing' } };
            if (r.system && r.system.permissionFailed && r.system.permissionFailed.length) {
                run.needsElevation = true;
                run.elevationState = 'pending';
            } else {
                run.phase = 'ready';
            }
        } catch (e) {
            run.error = String((e && e.message) || e);
            run.phase = 'failed';
        }
    })();
    return run.id;
}

/** 提权：带密码重跑权限不足的系统项；action=skip/timeout 则标记该项未收集。 */
export async function elevateRun(run, args, cfg = resolveConfig({})) {
    if (args && args.action) {
        run.needsElevation = false;
        run.elevationState = 'done';
        run.items = run.items || { env: { status: 'skipped' }, logs: { status: 'skipped', files: [] }, config: { status: 'skipped', files: [] }, system: { status: 'failed', reason: 'canceled', permissionFailed: [] } };
        run.items.system = Object.assign({}, run.items.system, { status: 'failed', reason: args.action === 'timeout' ? 'timeout' : 'canceled' });
        run.phase = 'ready';
        return statusOf(run);
    }
    run.elevationState = 'elevating';
    try {
        const failed = (run.items && run.items.system && run.items.system.permissionFailed) || [];
        const netUrls = (hooks.netUrls || []).filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u)).slice(0, 6);
        const r = await runHelper(['collect', run.staging, JSON.stringify({ elevated: failed, netUrls })], {
            capMs: cfg.collect.elevatedTimeoutMs,
            stdinData: String(args && args.password ? args.password : ''),
        });
        run.items = { env: r.env, logs: r.logs, config: r.config, system: r.system, plugins: r.plugins || { status: 'missing' } };
        run.needsElevation = false;
        run.elevationState = 'done';
        run.phase = 'ready';
    } catch (e) {
        run.elevationState = 'pending';
        throw e;
    }
    return statusOf(run);
}

/** 状态快照（客户端轮询用）。 */
export function statusOf(run) {
    let items = null;
    if (run.items) {
        items = {
            env: { status: run.items.env.status },
            logs: { status: run.items.logs.status, files: run.items.logs.files || [] },
            config: { status: run.items.config.status, files: run.items.config.files || [] },
            system: {
                status: run.items.system.status,
                reason: run.items.system.reason || null,
                permissionFailed: run.items.system.permissionFailed || [],
                plugins: (run.items.system.data && run.items.system.data.plugins) || null,
                pluginsNew: (run.items.plugins && run.items.plugins.status) || null,
                groups: (() => {
                    const g = {};
                    const d = run.items.system.data || {};
                    for (const k in d) g[k] = true;
                    return g;
                })(),
            },
        };
    }
    return {
        id: run.id,
        phase: run.phase,
        needsElevation: !!run.needsElevation,
        elevationState: run.elevationState || 'none',
        items,
        error: run.error || null,
        topicDefault: run.topicDefault || '',
        errCtx: run.errCtx || null,
    };
}
