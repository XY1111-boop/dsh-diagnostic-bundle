/**
 * analyzer.js — 智能诊断摘要（AI 问题总结）。
 *
 * 可插拔设计：`provider: 'rules'`（默认，离线规则引擎）| `'llm'`（预留，
 * 宿主暴露模型服务时实现同一接口无缝切换）。产出写入 ai-summary.txt，
 * 同时给出结构化 issues 供 UI 预览与 manifest 记录。
 */
import { resolveConfig } from './config.js';
import { runHelper } from './runner.js';

/** 截断日志文本到最近 N 行。 */
function tailLines(text, n) {
    const lines = String(text || '').split('\n');
    return lines.slice(-n).join('\n');
}

/**
 * 规则引擎：扫描错误消息 / 主题 / 日志尾部 / 环境系统摘要，命中信号表症状。
 * @returns {{issues:Array<{id,label,evidence,advice}>, text:string}}
 */
export function analyzeByRules(inputs, cfg = resolveConfig({})) {
    const signals = cfg.aiSummary.signals || [];
    const issues = [];
    const haystack = [
        String(inputs.error || ''),
        String(inputs.topic || ''),
        tailLines(inputs.logTail, cfg.aiSummary.logTailLines),
        String(inputs.envSummary || ''),
        String(inputs.sysSummary || ''),
    ].join('\n');

    for (let i = 0; i < signals.length; i++) {
        const sig = signals[i];
        if (issues.length >= cfg.aiSummary.maxIssues) break;
        const re = sig.pattern instanceof RegExp ? sig.pattern : new RegExp(String(sig.pattern), 'i');
        const m = re.exec(haystack);
        if (!m) continue;
        // 证据：命中处前后各 60 字符
        const at = Math.max(0, m.index - 60);
        const evidence = haystack.slice(at, Math.min(haystack.length, m.index + m[0].length + 60)).replace(/\s+/g, ' ').slice(0, 160);
        issues.push({ id: sig.id, label: sig.label, evidence, advice: sig.advice });
    }

    const text = buildSummaryText(inputs, issues, 'rules');
    return { issues, text, provider: 'rules' };
}

function buildSummaryText(inputs, issues, provider) {
    const L = [];
    L.push('AI 诊断摘要（自动生成）');
    L.push('========================');
    L.push('');
    L.push('生成时间：' + (inputs.generatedAt || ''));
    L.push('诊断主题：' + (inputs.topic || '未命名'));
    L.push('生成方式：' + (provider && String(provider).indexOf('llm:') === 0 ? '大语言模型深度分析（' + String(provider).slice(4) + '）' : '内置智能规则引擎（离线）'));
    L.push('');
    if (inputs.error) {
        L.push('触发报错：' + String(inputs.error).slice(0, 500));
        L.push('');
    }
    if (!issues.length) {
        L.push('未在错误信息与日志尾部中发现已知症状模式。');
        L.push('建议：结合下方原始日志与系统数据人工排查；如需更深入分析，可补充个人总结并联系技术支持。');
    } else {
        L.push('识别到以下疑似问题（按出现顺序）：');
        L.push('');
        issues.forEach((it, i) => {
            L.push((i + 1) + '. ' + it.label);
            L.push('   证据：' + it.evidence);
            L.push('   建议：' + it.advice);
        });
        L.push('');
        L.push('以上结论由内置规则引擎根据症状关键词自动生成，仅作排查起点，不替代人工诊断。');
    }
    return L.join('\n');
}

/* ---------------------------- LLM provider ---------------------------- */

/** 选择生效的 LLM provider：auto 取第一个已启用且有密钥的；显式 id 精确匹配。 */
export function pickProvider(cfg) {
    const list = (cfg.aiSummary && cfg.aiSummary.providers) || [];
    const want = (cfg.aiSummary && cfg.aiSummary.provider) || 'auto';
    const candidates = want === 'auto' || want === 'rules' ? list : list.filter((p) => p.id === want);
    for (let i = 0; i < candidates.length; i++) {
        const p = candidates[i];
        if (!p || p.enabled === false) continue;
        const key = llmKeyOf(p, cfg);
        if (key) return { id: p.id, name: p.name, baseUrl: p.baseUrl, model: p.model, apiKey: key };
    }
    return null;
}

/** 密钥解析：profile config < 环境变量 DSH_DXB_LLM_<ID大写>_KEY。返回明文供本进程内存使用。 */
export function llmKeyOf(p, cfg) {
    const envKey = 'DSH_DXB_LLM_' + String(p.id).toUpperCase() + '_KEY';
    if (typeof process !== 'undefined' && process.env && process.env[envKey]) return String(process.env[envKey]);
    return String((p && p.apiKey) || '').trim();
}

/** 构建发送给 LLM 的上下文（限长；发送前 helper 会再次掩码）。 */
export function buildLlmContext(inputs, issues, cfg) {
    const parts = [];
    parts.push('【报错信息】' + String(inputs.error || '(无，用户主动反馈)').slice(0, cfg.aiSummary.maxErrorChars));
    parts.push('【诊断主题】' + String(inputs.topic || '未命名'));
    const tail = String(inputs.logTail || '');
    parts.push('【日志尾部（最近 ' + cfg.aiSummary.logTailLines + ' 行）】' + tail.slice(-cfg.aiSummary.maxInputChars));
    parts.push('【环境摘要】' + String(inputs.envSummary || '(无)'));
    parts.push('【系统摘要】' + String(inputs.sysSummary || '(无)'));
    if (issues && issues.length) {
        parts.push('【规则引擎初步识别】' + issues.map((i) => i.label + '（证据：' + i.evidence + '）').join('；'));
    }
    if (inputs.userSummary) parts.push('【用户补充描述】' + String(inputs.userSummary).slice(0, 2000));
    let joined = parts.join('\n\n');
    const cap = cfg.aiSummary.maxInputChars * 3;
    if (joined.length > cap) joined = joined.slice(0, cap) + '\n……（上下文过长已截断）';
    return joined;
}

const LLM_SYSTEM_PROMPT = '你是 DeepSeek Harness（AI 开发环境）的技术支持工程师。用户遇到了报错并生成了诊断包。请基于提供的诊断信息（报错、日志尾部、环境与系统摘要）输出：\n1. 【问题分析】可能的根因（基于证据，不确定处明确说明）；\n2. 【修复步骤】按顺序可执行的操作（含具体命令或配置改动）；\n3. 【预防建议】如何避免再次发生。\n要求：使用简洁中文，分节输出，每步尽量可执行；不要编造日志中不存在的证据。';

/** 调用 LLM（经 helper 进程，密钥仅内存，发送前脱敏）。失败返回 null（回退规则引擎）。 */
export async function runLLM(inputs, issues, cfg, provider) {
    const ai = cfg.aiSummary;
    const messages = [
        { role: 'system', content: LLM_SYSTEM_PROMPT },
        { role: 'user', content: buildLlmContext(inputs, issues, cfg) },
    ];
    const payload = { messages, temperature: 0.3, max_tokens: ai.maxOutputTokens };
    try {
        const r = await runHelper(['llm', JSON.stringify(payload), provider.baseUrl, provider.model, String(ai.llmTimeoutMs)], {
            capMs: ai.llmTimeoutMs + 8000,
            stdinData: provider.apiKey,
        });
        return { text: String(r.text || ''), model: r.model || provider.model, usage: r.usage || null };
    } catch (e) {
        return null;
    }
}

/** 对外统一接口：rules 引擎先行（快、离线），useLLM 时追加 LLM 深度分析。 */
export async function analyze(inputs, cfg, opts) {
    const enabled = cfg.aiSummary.enabled;
    if (!enabled) return { issues: [], text: '', provider: 'disabled' };
    const issues = analyzeByRules(inputs, cfg).issues;
    const provider = pickProvider(cfg);
    const useLlm = !!(opts && opts.useLLM) && !!provider;
    if (!useLlm) {
        const t = buildSummaryText(inputs, issues, 'rules');
        return { issues, text: t, provider: 'rules' };
    }
    const llm = await runLLM(inputs, issues, cfg, provider);
    if (!llm || !llm.text) {
        // LLM 失败：回退规则引擎，绝不让单点失败阻塞打包
        const t = buildSummaryText(inputs, issues, 'rules') + '\n\n==== AI 深度分析（' + provider.name + '）不可用，已回退内置规则引擎 ====\n';
        return { issues, text: t, provider: 'rules' };
    }
    const t = buildSummaryText(inputs, issues, 'llm:' + provider.id) +
        '\n\n==== AI 深度分析与修复建议（' + provider.name + ' · ' + (llm.model || provider.model) + '）====\n' +
        llm.text;
    return { issues, text: t, provider: provider.id + ':' + (llm.model || provider.model), llm: { id: provider.id, name: provider.name, model: llm.model || provider.model } };
}
