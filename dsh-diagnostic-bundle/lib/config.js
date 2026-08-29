/**
 * config.js — 集中配置中心（工业级：零硬编码）。
 *
 * 合并优先级：默认值 < profile config（cordis patch 的 config 字段）< 环境变量（DSH_DXB_*）。
 * 所有此前散落的魔数（超时、上限、关键词库、路径、文件名模板等）统一收口于此，
 * 任一模块不得再出现字面量魔法值，只允许引用本模块导出的配置。
 */

const ENV_PREFIX = 'DSH_DXB_';

function envNumber(name, fallback) {
    const raw = process.env[ENV_PREFIX + name];
    if (raw === undefined || raw === '') return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
}

function envString(name, fallback) {
    const raw = process.env[ENV_PREFIX + name];
    return raw !== undefined && raw !== '' ? raw : fallback;
}

function envBool(name, fallback) {
    const raw = process.env[ENV_PREFIX + name];
    if (raw === undefined || raw === '') return fallback;
    return /^(1|true|yes|on)$/i.test(raw);
}

/** 默认配置：与产品规格书逐条对应。 */
function defaults() {
    return {
        supportEmail: 'support@example.com',

        /* 主题解析 */
        topic: {
            maxLen: 20,
            fallback: '未命名',
            titleMaxLen: 40,
            // 关键词库：可增删；match 支持字符串/正则；命中后以括号追加 label
            keywordTable: [
                { match: /CUDA\s+out\s+of\s+memory|显存不足|out\s+of\s+memory|OOM/i, label: 'CUDA OOM' },
                { match: /超时|timeout|timed\s+out/i, label: '超时' },
                { match: /connection\s+refused|连接失败|拒绝连接/i, label: '连接失败' },
                { match: /进程被杀死|killed|SIGKILL|exit\s+code\s+137/i, label: '进程被杀' },
            ],
        },

        /* 采集 */
        collect: {
            perItemTimeoutMs: 15000,
            overallTimeoutMs: 70000,   // helper collect 整体上限（60s 规格 + 余量）
            initTimeoutMs: 20000,
            elevatedTimeoutMs: 35000,
            processTopN: 50,
            passwordWindowSec: 30,
            dshHome: envString('DSH_HOME', process.env.DSH_HOME || '/home/li/.dsh'),
            logsDir: null,             // null = <dshHome>/logs
            logMaxBytes: 10 * 1024 * 1024,
            logMaxLines: 50000,
            configMaxBytes: 2 * 1024 * 1024,
            configInclude: ['settings.yaml', 'settings.yaml.bak', 'settings.json', 'settings.yml', 'config.yaml', 'config.yml', 'config.json'],
            configExclude: [/credential/i, /secret/i, /\.env/i, /dxb-llm/i],
            // 系统命令表（白名单）：由 helper 执行；requiresElevation=true 的失败项进入提权流程
            systemCommands: [
                { id: 'processes', label: '进程列表', cmd: 'ps', args: ['-eo', 'pid,comm,%cpu,%mem', '--sort=-%cpu'], env: { LC_ALL: 'C' } },
                { id: 'ports', label: '监听端口', cmd: 'ss', args: ['-tlnp'], env: { LC_ALL: 'C' }, fallback: { cmd: 'netstat', args: ['-ano'] } },
                { id: 'memory', label: '内存', cmd: 'free', args: ['-m'], env: { LC_ALL: 'C' }, fallback: { cmd: 'vm_stat', args: [] } },
                { id: 'gpu', label: '显存', cmd: 'nvidia-smi', args: ['--query-gpu=utilization.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'] },
                { id: 'disk', label: '磁盘', cmd: 'df', args: ['-h'], env: { LC_ALL: 'C' } },
                { id: 'self', label: '自身进程', cmd: 'ps', args: ['-p', '__PPID__', '-o', 'pid,comm,%cpu,%mem,etime'], env: { LC_ALL: 'C' } },
            ],
        },

        /* 脱敏 */
        redaction: {
            maxKeywords: 50,
            keywordMaxLen: 64,
            maxPatchBytes: 2 * 1024 * 1024,
            builtin: { keyNames: true, skPrefix: true, email: true, ipv4: true },
            keyNamePattern: null, // null = worker 内置默认
        },

        /* 打包 */
        pack: {
            filenameTemplate: 'DSH-{time}-{os}-{topic}-{serial}.zip',
            serialDigits: 6,
            serialMaxAttempts: 100,
            stagingPrefix: envString('STAGING_PREFIX', '/tmp/dsh-dx-bundle-'),
            desktop: {
                useXdg: true,     // Linux: xdg-user-dir DESKTOP 优先
                fallbackDownload: true,
            },
        },

        /* UI */
        ui: {
            pageSize: 2000,
            pollIntervalMs: 400,
            minPackDelayMs: 400,
            modalWidth: 880,
            modalHeight: 640,
            modalMinWidth: 720,
            modalMinHeight: 520,
        },

        /* 智能摘要（AI 问题总结 + LLM 深度分析与修复建议） */
        aiSummary: {
            enabled: envBool('AI_SUMMARY', true),
            provider: envString('AI_PROVIDER', 'auto'), // 'auto' | 'rules' | <providerId>
            maxErrorChars: 500,
            logTailLines: 120,
            maxIssues: 8,
            llmTimeoutMs: envNumber('LLM_TIMEOUT', 45000),
            maxInputChars: envNumber('LLM_MAX_INPUT', 6000),
            maxOutputTokens: envNumber('LLM_MAX_TOKENS', 1500),
            // 可插拔 LLM providers：OpenAI 兼容 chat/completions 端点。
            // apiKey 来源优先级：profile config < 环境变量 DSH_DXB_LLM_<ID大写>_KEY。
            // 密钥绝不落盘、不进 zip、不进 manifest（manifest 仅记录 id/model）。
            providers: [
                { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', apiKey: '', enabled: true },
                { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '', enabled: true },
            ],
            // 症状信号表：pattern 命中（错误消息/日志/系统数据）→ 症状与建议
            signals: [
                { id: 'cuda_oom', label: '显存不足 (CUDA OOM)', pattern: /CUDA\s+out\s+of\s+memory|out\s+of\s+memory|显存不足|OOM/i, advice: '显存溢出：关闭其他占用显存的应用，调小 batch size / 上下文长度，或更换更大显存的设备后重试。', fixes: [] },
                { id: 'timeout', label: '请求/推理超时', pattern: /timed\s+out|ETIMEDOUT|timeout(?!\w)(?!\s*[:=]\s*\d)|超时(?![\w\u4e00-\u9fa5])|request\s+timeout/i, advice: '请求或推理超时：检查网络与 API 端点连通性，增大超时配置，或降低单次请求负载。', fixes: [{ title: '检查网络连通性', command: 'curl -sS -m 8 -o /dev/null -w "%{http_code} %{time_total}s\n" https://api.deepseek.com/v1/models', needRoot: false }, { title: '查看代理与环境变量', command: 'env | grep -iE "proxy|http_proxy|https_proxy" || true', needRoot: false }] },
                { id: 'conn_refused', label: '连接被拒绝', pattern: /connection\s+refused|ECONNREFUSED|连接失败|拒绝连接/i, advice: '目标服务未监听或不可达：确认服务端口、防火墙与代理设置，服务端是否已启动。', fixes: [{ title: '查看监听端口', command: 'ss -tlnp | head -30', needRoot: false }, { title: '查看进程状态', command: 'ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head -15', needRoot: false }] },
                { id: 'killed', label: '进程被杀死', pattern: /killed|SIGKILL|进程被杀死|exit\s+code\s+137/i, advice: '进程被系统/用户终止（常见于 OOM Killer 或手动 kill）：检查系统内存余量与 dmesg。', fixes: [{ title: '检查系统日志（OOM Killer）', command: 'dmesg 2>/dev/null | tail -30 || journalctl -k -n 30 2>/dev/null || true', needRoot: false }, { title: '查看内存占用', command: 'free -m && ps aux --sort=-%mem | head -10', needRoot: false }] },
                { id: 'disk_full', label: '磁盘空间不足', pattern: /no\s+space\s+left|ENOSPC|磁盘满/i, advice: '磁盘已满：清理缓存与旧日志，扩大存储分区后重试。', fixes: [{ title: '查看磁盘占用', command: 'df -h', needRoot: false }, { title: '查看本目录占用大户', command: 'du -sh ~/.dsh/* 2>/dev/null | sort -rh | head -10', needRoot: false }, { title: '清理 7 天前的轮转日志（低风险）', command: 'find ~/.dsh/logs -name "*.log.*" -mtime +7 -delete 2>/dev/null; echo done', needRoot: false }] },
                { id: 'oom', label: '内存不足', pattern: /out\s+of\s+memory|内存不足|ENOMEM|heap\s+out/i, advice: '内存不足：关闭其他进程释放内存，或降低并发/上下文占用。', fixes: [{ title: '查看内存与占用进程', command: 'free -m && ps aux --sort=-%mem | head -10', needRoot: false }, { title: '查看交换分区', command: 'swapon --show 2>/dev/null || cat /proc/swaps', needRoot: false }] },
                { id: 'port_busy', label: '端口被占用', pattern: /address\s+already\s+in\s+use|EADDRINUSE|端口被占用/i, advice: '端口被占用：查找占用进程并停止，或改用其他端口。', fixes: [{ title: '查看监听端口与占用进程', command: 'ss -tlnp | head -30', needRoot: false }, { title: '查看本机 3080 端口占用', command: 'ss -tlnp | grep 3080 || echo 3080 空闲', needRoot: false }] },
                { id: 'gpu_missing', label: 'GPU 驱动/设备异常', pattern: /NVIDIA-SMI\s+has\s+failed|Failed\s+to\s+initialize\s+NVML|nvidia-smi:\s+command\s+not\s+found|driver\s+not\s+loaded|No\s+devices\s+were\s+found/i, advice: 'GPU 或驱动异常：检查 nvidia-smi 输出、驱动版本与 CUDA 兼容性。', fixes: [{ title: '查看 GPU 状态', command: 'nvidia-smi || echo "nvidia-smi 不可用"', needRoot: false }, { title: '查看显卡设备', command: 'lspci 2>/dev/null | grep -iE "vga|3d|display" || echo 无 lspci', needRoot: false }] },
                { id: 'auth_failed', label: '认证/权限失败', pattern: /401|403|unauthorized|forbidden|权限不足|authentication/i, advice: '认证或权限失败：检查 API Key、访问令牌与账户权限配置。', fixes: [{ title: '校验 API Key 是否已配置', command: 'test -n "$DSH_DXB_LLM_DEEPSEEK_KEY" && echo env-key-ok || echo env-key-missing; ls -la ~/.dsh/dxb-llm-providers.json 2>/dev/null || echo no-ui-key-file', needRoot: false }] },
                { id: 'model_not_found', label: '模型不存在/不可用', pattern: /model\s+not\s+found|unknown\s+model|模型不存在|invalid\s+model/i, advice: '模型名不存在或不可用：核对模型 ID 与当前供应商支持的模型列表。', fixes: [{ title: '列出 DeepSeek 可用模型', command: 'curl -sS -m 10 https://api.deepseek.com/v1/models -H "Authorization: Bearer ${DSH_DXB_LLM_DEEPSEEK_KEY:-none}" | head -c 800; echo', needRoot: false }] },
            ],
        },

        /* 个人总结 */
        userSummary: {
            maxChars: 20000,
            filename: 'summary.txt',
        },

        aiSummaryFilename: 'ai-summary.txt',
    };
}

function deepMerge(base, over) {
    if (over === null || over === undefined || typeof over !== 'object') return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (const k of Object.keys(over)) {
        const v = over[k];
        if (v === null || v === undefined) continue;
        if (Array.isArray(v)) { out[k] = v.slice(); continue; }
        if (typeof v === 'object' && typeof out[k] === 'object' && out[k] !== null && !Array.isArray(out[k])) {
            out[k] = deepMerge(out[k], v);
            continue;
        }
        out[k] = v;
    }
    return out;
}

/** 读取 profile config 与 DSH_DXB_* 环境变量，产出最终配置。 */
export function resolveConfig(profileConfig) {
    let cfg = defaults();
    if (profileConfig && typeof profileConfig === 'object') cfg = deepMerge(cfg, profileConfig);
    if (cfg.collect.dshHome) {
        cfg.collect.dshHome = String(cfg.collect.dshHome).replace(/^~/, process.env.HOME || '/home/li');
    }
    if (!cfg.collect.logsDir) cfg.collect.logsDir = cfg.collect.dshHome + '/logs';
    cfg._resolved = true;
    return cfg;
}
