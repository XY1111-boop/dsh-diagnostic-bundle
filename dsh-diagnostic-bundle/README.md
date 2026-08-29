# dsh-diagnostic-bundle · 智能报错诊断包生成器

DeepSeek Harness 插件：非技术用户一键把环境、日志、配置与系统状态收集成
**脱敏后的诊断压缩包**并保存到桌面，发给技术支持即可定位问题。

- 会话头部「一键报错」按钮（自动附带最近的报错上下文）+ 输入栏「诊断包」入口
- 阻塞式模态框四步状态机：收集 → 检查/编辑 → 脱敏预览 → 成功页
- 四类采集：环境信息 / 运行日志 / 配置文件 / 系统状态（进程、端口、内存、显存、磁盘）
- 需要管理员权限的采集项走原生提权（Linux pkexec / macOS osascript / Windows UAC），
  密码仅经 stdin 传给 `sudo -S`，零落盘、零日志；取消/超时自动跳过并记入清单
- 脱敏在 Worker 线程执行：字段名匹配 + 邮箱/IPv4/sk- 密钥 + 自定义敏感词，
  支持逐文件手动编辑（行级补丁，未加载的行也可替换）与整类排除
- 打包为 `DSH-时间-系统-主题-流水号.zip`（纯 JS ZIP 写入，无第三方依赖），
  含 `manifest.json`（脱敏规则与命中统计）与中文 `README.txt`

## 安装

```bash
dsh plugin --profile <name> add dsh-diagnostic-bundle
```

重启 dsh web 后，在会话头部出现「一键报错」按钮。

## 可选配置

在 profile 的 `cordis.patch.yml` 追加 config（例如配置支持邮箱）：

```yaml
- insert:
    - id: dsh-diagnostic-bundle
      name: 'dsh-diagnostic-bundle'
      config:
        supportEmail: support@your-company.com
```

## AI 深度分析与修复建议（可插拔 LLM）

诊断包内置规则引擎（离线，零成本）；配置任意 OpenAI 兼容 API 后，
AI 会基于脱敏后的诊断信息生成【问题分析 / 修复步骤 / 预防建议】，
写入 `ai-summary.txt` 与成功页预览。LLM 不可用、超时或未配置时**自动回退
规则引擎**，绝不阻塞打包。

支持任意数量的 provider（默认内置 DeepSeek 与 OpenAI，可增删改）：

```yaml
      config:
        aiSummary:
          provider: 'auto'          # 'auto' | 'rules' | 某个 provider 的 id
          providers:
            - id: deepseek
              name: DeepSeek
              baseUrl: 'https://api.deepseek.com/v1'
              model: 'deepseek-chat'
              apiKey: ''            # 推荐留空，用环境变量
              enabled: true
            - id: openai
              name: OpenAI
              baseUrl: 'https://api.openai.com/v1'
              model: 'gpt-4o-mini'
              apiKey: ''
              enabled: true
            # 任意兼容 /chat/completions 的自建端点：
            # - id: myproxy  name: 内部网关  baseUrl: 'https://gw.example.com/v1'
            #   model: 'qwen-max'  apiKey: ''  enabled: true
```

密钥来源优先级：**环境变量 > profile config**。环境变量名按 provider id 大写：
`DSH_DXB_LLM_DEEPSEEK_KEY`、`DSH_DXB_LLM_OPENAI_KEY`、`DSH_DXB_LLM_MYPROXY_KEY`。

密钥安全边界：

- 密钥**只经子进程 stdin / 进程环境传递，绝不落盘、绝不写日志**；
- manifest 与 README 只记录 provider 的 `id:model`，不含密钥；
- 发送给 LLM 的文本**先经脱敏**（IPv4 / 邮箱 / sk- 密钥串 / 自定义关键词），
  诊断包内容不随请求外发；
- 其他可调项：`aiSummary.llmTimeoutMs`（默认 45000）、`maxInputChars`、
  `maxOutputTokens`、`logTailLines`；均可用 `DSH_DXB_LLM_*` 环境变量覆盖。

## 包结构

- `lib/index.js` — Host 插件（采集编排、主题解析、清单/说明生成、打包），
  RPC 走 `POST /dsh-diagnostic-bundle/rpc`（同源校验 + 体积上限）
- `lib/client.js` — 浏览器插件（ModuleLoader 格式），注册三个插槽
- `lib/assets/helper.js` — 采集/打包辅助子进程（真实 Node）
- `lib/assets/redactor-worker.js` — 脱敏 Worker（worker_threads）

## 隐私与边界

- 默认不收集 `.env` 类文件与凭据文件；勾选排除 = 整项不进包
- 单项采集 15s 超时、整体 60s；单项失败只标记跳过，不阻塞打包
- 日志超过 10MB / 5 万行自动截断并注明；临时目录仅当前用户可读，取消即删除
- 桌面不可写自动回退下载目录并提示；文件名冲突自动递增六位流水号

## 开发

```bash
# 本地打包验证
npm pack
# 安装到 profile（需重启 dsh web 生效）
dsh plugin --profile web add ./dsh-diagnostic-bundle-1.0.0.tgz
```

## License

MIT

## 1.3.0：独立 AI 服务密钥管理 + 可执行修复

### 独立 API Key（与 Harness 自身配置完全分离）
- 诊断包模态框「检查与编辑」页 → **AI 服务设置**：可添加 DeepSeek 或任意 OpenAI 兼容服务（名称 / Base URL / 模型 / API Key / 启用开关），编辑与删除。
- 密钥仅保存在 `~/.dsh/dxb-llm-providers.json`（0600，仅当前用户可读），**与 Harness 自身的 API 配置（`.credentials.yaml` 等）完全分离**；该文件已被 `configExclude` 排除，**永远不会进入诊断包**。
- 生效优先级：内置默认 < profile config（`aiSummary.providers`） < UI 存储（按 id 覆盖）。
- 密钥也可通过环境变量 `DSH_DXB_LLM_<ID大写>_KEY` 提供（优先级最高，UI 留空时回退）。

### 可执行修复（基于内置人工审核命令表）
- AI 诊断命中已知信号（超时 / 连接被拒绝 / 进程被杀 / 磁盘满 / 内存不足 / 端口占用 / GPU 异常 / 认证失败 / 模型不存在）时，预览页出现 **🔧 可执行修复建议**。
- 每条建议 = 人工审核过的只读诊断/低风险命令（如 `ss -tlnp`、`df -h`、`dmesg | tail -30`），UI 展示完整命令，**二次确认后才执行**；执行结果（退出码 + 输出）就地回显。
- LLM 只提供文本建议，绝不自动执行命令。
- 修复命令不经过 shell 拼接（`execFile('/bin/sh', ['-c', cmd])`，命令来自内置表并限长 500，非白名单命令一律拒绝）。

### 插件不适配诊断
- `system.json` 新增 `plugins` 组：Harness profile 的 bundles 与 dependencies 摘要，随环境上下文发送给 AI，用于判断「插件不适配」类问题。

## 1.3.2：诊断信息增强（辅助开发/排查）

新增 6 项自动采集内容，随包提交（不受四类勾选影响，始终包含）：

| 文件 | 内容 |
|---|---|
| `errors.json` | 宿主端最近错误记录（agent/error 每会话 20 条环形队列，全局兜底 20 条）+ 浏览器页面报错（`window.onerror` / `unhandledrejection`，各 20 条） |
| `session-timeline.json` | 本会话活动时间线摘要（最近 50 条：用户消息 / AI 回复 / 工具调用；经 `sessionQuery.readSurface` 读取，10s 超时自动降级不阻塞） |
| `network.json` | 模型服务端点连通性探测（HTTP 状态码、DNS / 连接 / TLS 耗时，`curl -m 6` 主动探测，URL 来自已配置的 LLM providers，最多 6 个）+ 代理环境变量键名（值只保留 host:port，凭证一律 `***`） |
| `config/config-summary.json` | `settings.yaml` 的脱敏摘要：YAML 扁平化为 `key.path: value`，敏感键（apiKey/token/secret/password/credential/proxy 等）值一律 `***`，最多 300 条，不含原始内容 |
| `system.json` → `limits` | 资源边界：`/proc/self/limits`（Max open files / processes / locked memory / address space）、进程 fd 数、cgroup 路径与 memory.max、`df -i` inode 余量 |
| `system.json` → `net` | 与 network.json 同源的出站探测结果与代理摘要 |

- manifest.json 新增 `items.errors / timeline / network`（included + 命中数）。
- README.txt 新增第 8–11 项说明。
- 浏览器端错误捕获生命周期由 `ctx.effect` 管理，插件卸载即移除监听。

## 1.3.3 — 插件适配问题报错（第五类采集项）

新增与「环境 / 日志 / 配置 / 系统」并列的第五类采集项 **插件适配**，包内为 `plugins.json`。

- **采集**（helper `collectPlugins`）：读取 profile `package.json` 的 `dsh.profile.bundles` + `dependencies`，对每个插件检查：
  - 是否宿主内置（`@deepseek-ai/*` 且未声明依赖）；
  - 模块是否安装（`node_modules/<name>/package.json` 缺失 → `module_missing`，注明「依赖未安装或安装失败」）；
  - 入口是否可加载（`main` / `exports['.']` / `index.js`，缺失 → 警告）；
  - 自身依赖是否齐全（顶层缺失且 `require.resolve` 失败 → `depsMissing` 列表）；
  - package.json 是否损坏（`package_json_broken`）。
- **分析**（宿主 `analyzePlugins`）：结合宿主记录的 `agent/error` 错误环（按会话 + 全局兜底），匹配插件名与 `plugin/module/加载/apply` 等关键词，将运行时错误写入 `runtime_error` 详情（最近最多 3 条，含原文）；版本声明与已装版本不一致时给出 `version_mismatch` 提示（主版本不同 → 建议重装，次版本不同 → 提示升级）。
- 每个插件输出 `status: ok | problem` + 逐条 `problems[{type, detail}]`；末尾 `summary{total, ok, problems, details}` 供开发者快速定位。
- 第五类受 Review 页勾选控制（取消勾选 → plugins.json 不进包，Tab 灰化「已排除」）；脱敏规则同样作用于 plugins.json（README、路径、报错中的密钥信息会被替换）。
- manifest.json 新增 `items.plugins{included, problems, redactedHits}`；README.txt 新增第 12 项说明。
