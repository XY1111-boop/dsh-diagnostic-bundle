/**
 * manifest.js — manifest.json 与 README.txt 构建（配置驱动）。
 */
import { resolveConfig } from './config.js';

/** 各内容项在最终目录中的相对路径前缀。 */
export const ITEM_PREFIX = {
    environment: 'environment.json',
    logs: 'logs/',
    config: 'config/',
    system: 'system.json',
    summary: 'summary.txt',
    aiSummary: 'ai-summary.txt',
    errors: 'errors.json',
    timeline: 'session-timeline.json',
    network: 'network.json',
    plugins: 'plugins.json',
};

/** 统计某一前缀下文件的脱敏命中总数。 */
export function hitsFor(preview, prefix) {
    let total = 0;
    ((preview && preview.files) || []).forEach((f) => {
        if (String(f.rel).indexOf(prefix) === 0) total += f.hits || 0;
    });
    return total;
}

/**
 * 构建 manifest.json。
 * @param {object} run 运行状态（items/checks/topic/errCtx/preview/aiIssues/userSummary）
 * @param {number} serial 流水号
 */
export function buildManifest(run, serial, cfg = resolveConfig({})) {
    const items = run.items || {};
    const logsFiles = (items.logs && items.logs.files) || [];
    const truncated = logsFiles.some((f) => f.truncated) ? 'last ' + cfg.collect.logMaxLines + ' lines' : null;
    const sysReason = null;
    const checks = run.checks || {};
    const reasonFor = (k) => {
        if (checks[k] === false) {
            const it = items[k];
            return (it && (it.reason || (it.status === 'failed' ? 'not collected' : 'excluded'))) || 'excluded';
        }
        return null;
    };
    return {
        schemaVersion: 2,
        generator: 'dsh-diagnostic-bundle v' + (cfg.version || '1.1.0'),
        createdAt: null,
        topic: run.topic || '',
        error: run.errCtx ? { message: String(run.errCtx.message || '').slice(0, cfg.aiSummary.maxErrorChars), page: run.errCtx.page || 'conversation', occurredAt: run.errCtx.occurredAt || null } : null,
        items: {
            environment: { included: checks.environment !== false, redactedHits: hitsFor(run.preview, ITEM_PREFIX.environment) },
            logs: { included: checks.logs !== false, truncated, redactedHits: hitsFor(run.preview, ITEM_PREFIX.logs) },
            config: { included: checks.config !== false, redactedHits: hitsFor(run.preview, ITEM_PREFIX.config) },
            system: { included: checks.system !== false, reason: reasonFor('system'), redactedHits: hitsFor(run.preview, ITEM_PREFIX.system) },
            summary: { included: !!(run.userSummary && run.userSummary.trim()), redactedHits: hitsFor(run.preview, ITEM_PREFIX.summary) },
            aiSummary: { included: !!(run.aiSummary && run.aiSummary.text), issues: (run.aiIssues || []).length, provider: (run.aiSummary && run.aiSummary.provider) || 'rules', redactedHits: hitsFor(run.preview, ITEM_PREFIX.aiSummary) },
            errors: { included: true, count: (run.browserErrors ? run.browserErrors.length : 0) + (run.errCtx ? 1 : 0), redactedHits: hitsFor(run.preview, ITEM_PREFIX.errors) },
            timeline: { included: true, redactedHits: hitsFor(run.preview, ITEM_PREFIX.timeline) },
            network: { included: true, redactedHits: hitsFor(run.preview, ITEM_PREFIX.network) },
            plugins: { included: checks.plugins !== false, problems: ((run.plugins && run.plugins.summary && run.plugins.summary.problems) || 0), redactedHits: hitsFor(run.preview, ITEM_PREFIX.plugins) },
        },
        redactionRules: run.redactionRules || [],
        serialNo: String(serial).padStart(cfg.pack.serialDigits, '0'),
        supportEmail: cfg.supportEmail,
    };
}

/** 构建 README.txt（中文说明）。 */
export function buildReadme(run, man, desktopDir, cfg = resolveConfig({})) {
    const L = [];
    L.push('DeepSeek Harness 诊断包说明');
    L.push('==============================');
    L.push('');
    L.push('生成时间：' + (man.createdAt || ''));
    L.push('诊断主题：' + (run.topic || '未命名'));
    L.push('');
    L.push('本压缩包包含以下内容（已按你的选择进行脱敏）：');
    L.push('');
    L.push('1. manifest.json —— 生成清单：包含哪些项目、脱敏命中次数、脱敏规则。');
    L.push('2. ai-summary.txt —— AI 诊断摘要：自动识别的问题症状与排查建议。');
    L.push('3. summary.txt —— 个人总结（可选）：用户填写的问题描述与补充信息。');
    L.push('4. environment.json —— 操作系统、运行时版本、Harness 版本、GPU 与内存信息。');
    L.push('5. logs/ —— 运行日志（超过 ' + cfg.collect.logMaxLines + ' 行或 ' + Math.round(cfg.collect.logMaxBytes / 1024 / 1024) + 'MB 时只保留最近部分，文件头有截断说明）。');
    L.push('6. config/ —— 当前生效的配置文件（默认不包含 .env 类文件）。');
    L.push('7. system.json —— 进程列表（前 ' + cfg.collect.processTopN + '）、监听端口、内存、显存、磁盘、资源限制与自身进程信息。');
    L.push('8. errors.json —— 宿主端最近错误记录与浏览器页面报错（各最多 20 条，已脱敏）。');
    L.push('9. session-timeline.json —— 本会话活动时间线摘要（最近 50 条：用户消息/回复/工具调用，已脱敏）。');
    L.push('10. network.json —— 模型服务端点连通性探测结果（HTTP 状态码、DNS/连接/TLS 耗时）与代理环境变量键名。');
    L.push('11. config/config-summary.json —— settings.yaml 的脱敏摘要（键名路径 + 脱敏后的值，不含原始内容）。');
    L.push('12. plugins.json —— 插件适配分析：每个已装插件与声明的对照、入口/依赖完整性、宿主错误匹配结果与详细问题原因（开发者排查插件不适配）。');
    L.push('');
    L.push('脱敏情况：');
    const names = { environment: '环境信息', logs: '运行日志', config: '配置文件', system: '系统状态', summary: '个人总结', aiSummary: 'AI 诊断摘要', errors: '错误记录', timeline: '会话时间线', network: '网络探测', plugins: '插件适配' };
    ['environment', 'logs', 'config', 'system', 'summary', 'aiSummary', 'errors', 'timeline', 'network', 'plugins'].forEach((k) => {
        const it = man.items[k];
        if (!it) return;
        if (it.included) {
            let extra = '';
            if (k === 'logs' && it.truncated) extra = '（已截断）';
            if (k === 'system' && it.reason) extra = '（部分数据缺失）';
            if (k === 'aiSummary') extra = '（识别出 ' + (it.issues || 0) + ' 个疑似问题）';
            L.push('  - ' + names[k] + '：已包含' + extra + '，脱敏命中 ' + (it.redactedHits || 0) + ' 处');
        } else {
            L.push('  - ' + names[k] + '：未包含' + (it.reason ? '（' + it.reason + '）' : ''));
        }
    });
    L.push('');
    L.push('脱敏规则：');
    (man.redactionRules || []).forEach((r) => { L.push('  - ' + r); });
    L.push('');
    L.push('请将该压缩包作为附件，通过邮件发送至技术支持团队：' + (man.supportEmail || cfg.supportEmail));
    L.push('');
    L.push('保存位置：' + desktopDir);
    L.push('');
    return L.join('\n');
}
