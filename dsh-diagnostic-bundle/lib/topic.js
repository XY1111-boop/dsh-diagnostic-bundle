/**
 * topic.js — 诊断主题解析（配置驱动）。
 * 优先级：会话标题 → 首条用户消息 → 手动输入 → 错误关键词（括号追加）。
 */
import { resolveConfig } from './config.js';

/** 清洗：去非法字符 \/:*?"<>| 与空白，限长，空用「未命名」。 */
export function sanitizeTopic(raw, cfg = resolveConfig({})) {
    const maxLen = cfg.topic.maxLen;
    const s = String(raw == null ? '' : raw).replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLen);
    return s || cfg.topic.fallback;
}

/** 关键词追加：错误文本或主题命中关键词库 → 括号包裹标签追加（已含标签则跳过，防重复）。 */
export function appendKeywords(topic, text, cfg = resolveConfig({})) {
    const got = [];
    const table = cfg.topic.keywordTable || [];
    const matches = (source) => {
        const out = [];
        for (let i = 0; i < table.length; i++) {
            const entry = table[i];
            const re = entry.match instanceof RegExp ? entry.match : new RegExp(String(entry.match), 'i');
            if (re.test(String(source || ''))) out.push(entry.label);
        }
        return out;
    };
    const cur = String(topic || '');
    // 归一化空白后查重：清洗会删除主题中的空格，标签须以无空格形态比对
    const curNorm = cur.replace(/\s+/g, '');
    const hasLabel = (l) => curNorm.indexOf(String(l).replace(/\s+/g, '')) >= 0;
    matches(text).forEach((l) => { if (got.indexOf(l) < 0 && !hasLabel(l)) got.push(l); });
    matches(cur).forEach((l) => { if (got.indexOf(l) < 0 && !hasLabel(l)) got.push(l); });
    if (!got.length) return cur;
    return cur + '(' + got.join('/') + ')';
}

/** 组装最终主题：默认主题 + 手动覆盖 + 关键词追加 + 清洗。
 * 清洗只作用于 base（用户输入），关键词标签受控、追加在清洗之后，保留可读空格。 */
export function resolveTopic(defaultTopicRaw, userTopic, errText, cfg = resolveConfig({})) {
    const base = userTopic != null && userTopic !== '' ? userTopic : defaultTopicRaw;
    return appendKeywords(sanitizeTopic(base, cfg), errText, cfg);
}

/** 从会话标题 / 首条用户消息推导默认主题。 */
export function defaultTopic(ctx, sessionId, firstUserText, cfg = resolveConfig({})) {
    let t = '';
    try {
        const sessions = ctx.get('sessions');
        const s = sessions && sessions.get(sessionId);
        const st = s && ctx.get('sessionTitle') && ctx.get('sessionTitle').get(s);
        if (st && st.title) t = String(st.title);
    } catch (e) {}
    if (!t) t = firstUserText || '';
    return String(t).slice(0, cfg.topic.titleMaxLen);
}

/** 文件名中的系统标识。 */
export function osTag(envData) {
    const osInfo = (envData && ((envData.data && envData.data.os) || envData.os)) || {};
    const p = osInfo.platform;
    if (p === 'win32') {
        const v = String(osInfo.version || '');
        const m = v.match(/^10\.0\.(\d+)/);
        const build = m ? parseInt(m[1], 10) : 0;
        if (build >= 22000) return 'Win11';
        if (m) return 'Win10';
        return 'Windows';
    }
    if (p === 'darwin') return 'macOS';
    return 'Linux';
}
