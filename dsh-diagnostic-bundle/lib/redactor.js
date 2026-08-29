/**
 * redactor.js — 脱敏编排（配置驱动）。
 * 职责：checks/keywords/masks/patches 参数校验、脱敏规则构建、调用 helper redact。
 */
import { runHelper, WORKER } from './runner.js';

/** 包内相对路径白名单（防路径穿越）。 */
export const REL_OK = /^(environment\.json|system\.json|plugins\.json|logs\/[^\/\\]+|config\/[^\/\\]+|ai-summary\.txt|summary\.txt)$/;

export function checkRel(rel) {
    if (!REL_OK.test(String(rel || ''))) throw new Error('invalid rel: ' + rel);
}

/** 敏感词解析：逗号/空格/换行分隔，去重，限量限长（配置化）。 */
export function parseKeywords(raw, cfg) {
    const out = [];
    const max = cfg.redaction.maxKeywords;
    const maxLen = cfg.redaction.keywordMaxLen;
    String(raw || '').split(/[,，\s]+/).forEach((w) => {
        w = String(w || '').trim();
        if (w && w.length <= maxLen && out.indexOf(w) < 0 && out.length < max) out.push(w);
    });
    return out;
}

/** 补丁校验：行区间合法、内容限长（配置化）。 */
export function normalizePatches(rawPatches, cfg) {
    const patches = {};
    const maxBytes = cfg.redaction.maxPatchBytes;
    for (const rel in rawPatches) {
        if (!Object.prototype.hasOwnProperty.call(rawPatches, rel)) continue;
        checkRel(rel);
        const list = [];
        const arr = rawPatches[rel];
        if (Array.isArray(arr)) {
            for (let i = 0; i < arr.length; i++) {
                const p = arr[i];
                if (!p || !p.newText) continue;
                const s = parseInt(p.startLine, 10);
                const e = parseInt(p.endLine, 10);
                if (!s || !e || s < 1 || e < s) continue;
                if (String(p.newText).length > maxBytes) continue;
                list.push({ startLine: s, endLine: e, newText: String(p.newText) });
            }
        }
        if (list.length) patches[rel] = list;
    }
    return patches;
}

/** 构建脱敏规则清单（写入 manifest.redactionRules）。 */
export function buildRules(keywords, masks, cfg) {
    const rules = [];
    const b = cfg.redaction.builtin;
    if (b.keyNames) rules.push('内置规则：字段名匹配（*_KEY/TOKEN/SECRET/PASSWORD/Authorization 等）');
    if (b.email && masks.email !== false) rules.push('内置规则：邮箱地址');
    if (b.ipv4 && masks.ipv4 !== false) rules.push('内置规则：IPv4 地址');
    if (b.skPrefix) rules.push('内置规则：sk- 开头密钥串');
    (keywords || []).forEach((k) => { rules.push('自定义关键词：' + k); });
    return rules;
}

/**
 * 执行脱敏（Worker 线程，helper 起 worker_threads）。
 * @returns {{files:Array, totalHits:number, counts:object}}
 */
export async function runRedact(run, checks, keywords, masks, patches, cfg) {
    const payload = {
        originals: run.staging + '/originals',
        finalRoot: run.staging + '/final',
        checks,
        keywords,
        masks,
        patches,
    };
    const r = await runHelper(['redact', JSON.stringify(payload), WORKER], { capMs: cfg.collect.overallTimeoutMs });
    return { files: r.files || [], totalHits: r.totalHits || 0, counts: r.counts || {} };
}
