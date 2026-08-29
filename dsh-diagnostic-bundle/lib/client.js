/* dsh-diagnostic-bundle client (bundled). Generated from client-logic.js. */
(function () {
  'use strict';
  window.__ModuleLoader__.load({
    id: 'dsh-diagnostic-bundle',
    factory: function (require) {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
      var _react = require('react');
      var React = _interopRequireDefault(_react).default || _react;
      function b64ToUtf8(b64) { var bin = atob(b64); var bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder("utf-8").decode(bytes); };
      var C = {
  trigger: '一键报错',
  inputBtn: '诊断包',
  title: '生成诊断包',
  subtitle: '自动收集环境、日志、配置与系统状态，脱敏后打包到桌面',
  errHint: '检测到本会话最近有报错，将自动附带',
  collecting: '正在收集诊断信息',
  collectingDesc: '预计 10~60 秒，请勿关闭窗口',
  steps: { env: '环境信息', logs: '运行日志', config: '配置文件', system: '系统状态', plugins: '插件适配' },
  stWait: '等待中',
  stRun: '收集中',
  stDone: '完成',
  stSkip: '已跳过',
  stFail: '失败',
  stPerm: '需要权限',
  elevateTitle: '需要管理员权限',
  elevateDesc: '收集「系统状态」中的端口与进程详情需要管理员权限。请输入系统密码，密码仅用于本次命令，不会保存、不会写入任何日志。',
  elevateLabel: '系统密码',
  elevateSubmit: '继续',
  elevateSkip: '跳过此项目',
  elevateBusy: '正在提权执行…',
  elevateCountdown: '密码窗将在 {s} 秒后自动跳过',
  elevateWrong: '提权失败，可重试或跳过',
  reviewTitle: '检查与编辑',
  reviewHint: '取消勾选 = 该项不进压缩包；编辑内容将在脱敏前应用',
  topicLabel: '诊断主题',
  topicPh: '例如：推理报错、CUDA OOM 崩溃',
  checksLabel: '包含项目',
  keywordLabel: '敏感词（逗号 / 空格 / 换行分隔）',
  keywordPh: 'API_KEY, SECRET, PASSWORD',
  maskEmail: '自动隐藏邮箱地址',
  maskIpv4: '自动隐藏 IPv4 地址',
  tabs: ['环境', '日志', '配置', '系统', '插件'],
  excluded: '已排除',
  unsaved: '●',
  prev: '上一页',
  next: '下一页',
  jumpPh: '跳转到行',
  jumpBtn: '跳转',
  pageInfo: '第 {from}–{to} 行 / 共 {total} 行',
  fileSel: '文件',
  previewTitle: '脱敏效果预览',
  previewTotal: '共命中 {n} 处敏感内容',
  previewPerFile: '{rel}：{n} 处',
  previewExpand: '查看替换前后对照',
  previewCollapse: '收起对照',
  previewBack: '返回编辑',
  packBtn: '生成并下载',
  packing: '正在打包…',
  packingDesc: '正在生成压缩包并保存到桌面，请稍候',
  successTitle: '诊断包已生成！',
  successDesc: '文件已保存到桌面：{name}',
  successFallback: '桌面不可写，已保存到下载目录：{name}',
  copy: '复制完整路径',
  copied: '已复制',
  open: '打开所在文件夹',
  mail: '请将该压缩包作为附件，通过邮件发送至技术支持团队 {email}',
  mailBtn: '打开邮件客户端',
  expert: '专家模式',
  expertOff: '普通模式',
  manifestLabel: 'manifest.json 清单',
  terminalCmd: '终端查看命令：unzip -l {path}',
  failedTitle: '打包失败',
  failedReason: '原因：{reason}',
  retry: '重试',
  close: '关闭',
  confirmTitle: '确认放弃？',
  confirmDesc: '已收集的内容将被删除。',
  confirmKeep: '继续',
  confirmAbort: '放弃并关闭',
  cancelBtn: '取消',
  busy: '处理中…',
  supportPlaceholder: 'support@example.com',
  previewBtn: '预览/编辑',
  summaryLabel: '个人总结（可选，随包发送）',
  summaryPh: '补充问题描述、复现步骤、已尝试的排查方式……',
  aiTitle: 'AI 诊断摘要',
  aiIssues: '识别到 {n} 个疑似问题',
  aiNone: '未识别到已知症状模式',
  aiExpand: '展开全文',
  aiCollapse: '收起全文',
  aiFooter: '由内置智能规则引擎自动生成（离线），仅作排查起点',
  llmLabel: '启用 AI 深度分析（DeepSeek / OpenAI）',
  llmHint: '诊断信息经脱敏后发送给已配置的 AI 服务，生成问题分析与修复建议',
  llmNoKey: '未配置 API Key：设置环境变量 DSH_DXB_LLM_<ID>_KEY 或 profile config 的 aiSummary.providers',
  previewingLLM: '正在扫描敏感信息并调用 AI 深度分析（最多约 45 秒）…',
  aiSettingsBtn: 'AI 服务设置', aiSettingsHide: '收起 AI 服务设置',
  aiSettingsShort: '独立于 Harness 自身的 API 配置，密钥仅保存在本机',
  aiSettingsTitle: 'AI 服务', aiSettingsDesc: '可添加 DeepSeek 或任意 OpenAI 兼容服务；密钥与 Harness 自身 API 配置完全分离，仅保存在本机 ~/.dsh/dxb-llm-providers.json，不会进入诊断包',
  aiAdd: '添加服务', aiEdit: '编辑', aiDelete: '删除', aiSave: '保存', aiCancelEdit: '取消',
  aiFieldName: '名称', aiFieldBase: 'Base URL', aiFieldModel: '模型', aiFieldKey: 'API Key（留空则用环境变量）',
  aiEnabled: '启用', aiDisabled: '停用', aiSaved: '✅ 已保存',
  fixesTitle: '可执行修复建议', fixesDesc: '以下命令来自内置人工审核命令表（只读诊断与低风险清理），执行前请确认；LLM 仅提供文本建议，不会自动执行。',
  fixRun: '执行修复', fixRunOk: '确认执行', fixCancel: '取消',
  fixNeedRoot: '需管理员权限', fixConfirm: '即将在您的电脑上执行以下命令：',
  fixResultOk: '✅ 执行完成（退出码 {code}）', fixResultFail: '❌ 执行失败（退出码 {code}）',
};
      var css = b64ToUtf8("LmR4Yi1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7ei1pbmRleDoyMTQ3NDgzMDAwO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtiYWNrZ3JvdW5kOnJnYmEoMTAsMTQsMjQsLjYyKTtiYWNrZHJvcC1maWx0ZXI6Ymx1cigycHgpO3BvaW50ZXItZXZlbnRzOmF1dG87Zm9udC1mYW1pbHk6c3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sIlNlZ29lIFVJIiwiUGluZ0ZhbmcgU0MiLCJNaWNyb3NvZnQgWWFIZWkiLHNhbnMtc2VyaWY7Y29sb3I6IzFjMjQzMH0KLmR4Yi1tb2RhbHtiYWNrZ3JvdW5kOiNmZmY7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6MCAxOHB4IDYwcHggcmdiYSgwLDAsMCwuMzUpO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47b3ZlcmZsb3c6aGlkZGVuO3dpZHRoOjg4MHB4O21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNDhweCk7aGVpZ2h0OjY0MHB4O21heC1oZWlnaHQ6Y2FsYygxMDB2aCAtIDQ4cHgpO21pbi13aWR0aDo3MjBweDttaW4taGVpZ2h0OjUyMHB4fQouZHhiLWhlYWR7cGFkZGluZzoxNnB4IDIwcHggMTBweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZThlY2YyO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDoxMHB4O2ZsZXgtc2hyaW5rOjB9Ci5keGItaGVhZCBoMnttYXJnaW46MDtmb250LXNpemU6MTdweDtmb250LXdlaWdodDo2MDA7bGluZS1oZWlnaHQ6MS4zfQouZHhiLWhlYWQgcHttYXJnaW46NHB4IDAgMDtmb250LXNpemU6MTIuNXB4O2NvbG9yOiM2Yjc2ODY7bGluZS1oZWlnaHQ6MS41fQouZHhiLWNsb3Nle21hcmdpbi1sZWZ0OmF1dG87Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtiYWNrZ3JvdW5kOiNmMWY0Zjg7Y29sb3I6IzRhNTU2ODtib3JkZXItcmFkaXVzOjhweDt3aWR0aDozMnB4O2hlaWdodDozMnB4O2ZvbnQtc2l6ZToxNXB4O2N1cnNvcjpwb2ludGVyO2ZsZXgtc2hyaW5rOjB9Ci5keGItY2xvc2U6aG92ZXJ7YmFja2dyb3VuZDojZTRlOWYwfQouZHhiLWJvZHl7ZmxleDoxO292ZXJmbG93OmF1dG87cGFkZGluZzoxOHB4IDIwcHh9Ci5keGItZm9vdHtwYWRkaW5nOjEycHggMjBweDtib3JkZXItdG9wOjFweCBzb2xpZCAjZThlY2YyO2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7Z2FwOjEwcHg7ZmxleC1zaHJpbms6MDthbGlnbi1pdGVtczpjZW50ZXJ9Ci5keGItYnRue2JvcmRlci1yYWRpdXM6OHB4O2JvcmRlcjoxcHggc29saWQgI2Q2ZGNlNTtiYWNrZ3JvdW5kOiNmZmY7Y29sb3I6IzI0MzAzZjtwYWRkaW5nOjhweCAxNnB4O2ZvbnQtc2l6ZToxMy41cHg7Y3Vyc29yOnBvaW50ZXJ9Ci5keGItYnRuOmhvdmVye2JhY2tncm91bmQ6I2Y1ZjdmYX0KLmR4Yi1idG46ZGlzYWJsZWR7b3BhY2l0eTouNTU7Y3Vyc29yOm5vdC1hbGxvd2VkfQouZHhiLWJ0bi1wcmltYXJ5e2JvcmRlcjoxcHggc29saWQgIzI1NjNlYjtiYWNrZ3JvdW5kOiMyNTYzZWI7Y29sb3I6I2ZmZn0KLmR4Yi1idG4tcHJpbWFyeTpob3ZlcntiYWNrZ3JvdW5kOiMxZDRlZDh9Ci5keGItYnRuLWRhbmdlcntib3JkZXI6MXB4IHNvbGlkICNkYzI2MjY7Y29sb3I6I2RjMjYyNn0KLmR4Yi1idG4tZGFuZ2VyOmhvdmVye2JhY2tncm91bmQ6I2ZlZjJmMn0KLmR4Yi1zcGlue3dpZHRoOjM4cHg7aGVpZ2h0OjM4cHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjRweCBzb2xpZCAjZGJlNGYwO2JvcmRlci10b3AtY29sb3I6IzI1NjNlYjthbmltYXRpb246ZHhic3BpbiAuOHMgbGluZWFyIGluZmluaXRlO21hcmdpbjowIGF1dG8gMTRweH0KQGtleWZyYW1lcyBkeGJzcGlue3Rve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19Ci5keGItY2VudGVye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7dGV4dC1hbGlnbjpjZW50ZXI7aGVpZ2h0OjEwMCU7cGFkZGluZzoyMHB4fQouZHhiLXN0ZXBze2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjEwcHg7bWFyZ2luLXRvcDoxOHB4O21heC13aWR0aDo1MjBweDt3aWR0aDoxMDAlfQouZHhiLXN0ZXB7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjEwcHggMTRweDtib3JkZXI6MXB4IHNvbGlkICNlNmViZjI7Ym9yZGVyLXJhZGl1czoxMHB4O2JhY2tncm91bmQ6I2ZhZmJmZH0KLmR4Yi1zdGVwLWljb3t3aWR0aDoyMnB4O2hlaWdodDoyMnB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6I2VlZjFmNjtjb2xvcjojNjQ3NDhiO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LXNpemU6MTJweDtmbGV4LXNocmluazowfQouZHhiLXN0ZXAtb2t7YmFja2dyb3VuZDojZGNmY2U3O2NvbG9yOiMxNTgwM2R9Ci5keGItc3RlcC1ydW57YmFja2dyb3VuZDojZGJlYWZlO2NvbG9yOiMxZDRlZDh9Ci5keGItc3RlcC1za2lwe2JhY2tncm91bmQ6I2ZlZjNjNztjb2xvcjojYjQ1MzA5fQouZHhiLXN0ZXAtZmFpbHtiYWNrZ3JvdW5kOiNmZWUyZTI7Y29sb3I6I2I5MWMxY30KLmR4Yi1zdGVwLW5hbWV7Zm9udC1zaXplOjEzLjVweDtmb250LXdlaWdodDo1MDB9Ci5keGItc3RlcC1ub3Rle21hcmdpbi1sZWZ0OmF1dG87Zm9udC1zaXplOjEycHg7Y29sb3I6IzhhOTRhNn0KLmR4Yi1zdGF0dXN7Zm9udC1zaXplOjEzcHg7Y29sb3I6IzViNjU3NTttYXJnaW4tdG9wOjEycHh9Ci5keGItZXJye2NvbG9yOiNiOTFjMWM7Zm9udC1zaXplOjEzcHg7YmFja2dyb3VuZDojZmVmMmYyO2JvcmRlcjoxcHggc29saWQgI2ZlY2FjYTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjhweCAxMnB4O21hcmdpbi10b3A6MTBweDttYXgtd2lkdGg6NTIwcHg7dGV4dC1hbGlnbjpsZWZ0fQouZHhiLWZvcm0gbGFiZWx7ZGlzcGxheTpibG9jaztmb250LXNpemU6MTIuNXB4O2NvbG9yOiMzZjRhNWE7Zm9udC13ZWlnaHQ6NTAwO21hcmdpbjoxMnB4IDAgNXB4fQouZHhiLWlucHV0e3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlcjoxcHggc29saWQgI2Q2ZGNlNTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjhweCAxMHB4O2ZvbnQtc2l6ZToxMy41cHg7YmFja2dyb3VuZDojZmZmO2NvbG9yOiMxYzI0MzB9Ci5keGItaW5wdXQ6Zm9jdXN7b3V0bGluZToycHggc29saWQgI2JmZGJmZTtib3JkZXItY29sb3I6IzI1NjNlYn0KLmR4Yi1yb3d7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcH0KLmR4Yi1jaGVja3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC1zaXplOjEzLjVweDtwYWRkaW5nOjdweCAxMnB4O2JvcmRlcjoxcHggc29saWQgI2UwZTVlZDtib3JkZXItcmFkaXVzOjlweDtiYWNrZ3JvdW5kOiNmZmY7Y3Vyc29yOnBvaW50ZXI7dXNlci1zZWxlY3Q6bm9uZX0KLmR4Yi1jaGVjayBpbnB1dHttYXJnaW46MDthY2NlbnQtY29sb3I6IzI1NjNlYn0KLmR4Yi1jaGVjay1vZmZ7b3BhY2l0eTouNTU7YmFja2dyb3VuZDojZjRmNmY5fQouZHhiLXRhYnN7ZGlzcGxheTpmbGV4O2dhcDo0cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2U2ZWJmMjttYXJnaW4tYm90dG9tOjEycHg7ZmxleC1zaHJpbms6MH0KLmR4Yi10YWJ7Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtiYWNrZ3JvdW5kOm5vbmU7cGFkZGluZzo4cHggMTRweDtmb250LXNpemU6MTMuNXB4O2N1cnNvcjpwb2ludGVyO2JvcmRlci1yYWRpdXM6OHB4IDhweCAwIDA7Y29sb3I6IzViNjU3NTtwb3NpdGlvbjpyZWxhdGl2ZX0KLmR4Yi10YWItb257Ym9yZGVyLWNvbG9yOiNlNmViZjI7Ym9yZGVyLWJvdHRvbS1jb2xvcjojZmZmO2JhY2tncm91bmQ6I2ZmZjtjb2xvcjojMWMyNDMwO2ZvbnQtd2VpZ2h0OjYwMH0KLmR4Yi10YWItZXhjbHVkZWR7Y29sb3I6I2I0NTMwOX0KLmR4Yi1kb3R7cG9zaXRpb246YWJzb2x1dGU7dG9wOjZweDtyaWdodDo3cHg7Y29sb3I6I2RjMjYyNjtmb250LXNpemU6MTFweH0KLmR4Yi1maWxlYmFye2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2ZsZXgtd3JhcDp3cmFwO21hcmdpbi1ib3R0b206MTBweH0KLmR4Yi1maWxlY2hpcHtib3JkZXI6MXB4IHNvbGlkICNlMGU1ZWQ7Ym9yZGVyLXJhZGl1czoxNHB4O3BhZGRpbmc6M3B4IDEwcHg7Zm9udC1zaXplOjEycHg7YmFja2dyb3VuZDojZmZmO2N1cnNvcjpwb2ludGVyfQouZHhiLWZpbGVjaGlwLW9ue2JhY2tncm91bmQ6IzI1NjNlYjtib3JkZXItY29sb3I6IzI1NjNlYjtjb2xvcjojZmZmfQouZHhiLXBhZ2Vye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttYXJnaW4tYm90dG9tOjhweDtmb250LXNpemU6MTIuNXB4O2NvbG9yOiM1YjY1NzU7ZmxleC13cmFwOndyYXB9Ci5keGItcGFnZXIgaW5wdXR7d2lkdGg6OTBweH0KLmR4Yi1lZGl0b3J7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDozMDBweDtib3JkZXI6MXB4IHNvbGlkICNkNmRjZTU7Ym9yZGVyLXJhZGl1czo4cHg7Zm9udC1mYW1pbHk6dWktbW9ub3NwYWNlLFNGTW9uby1SZWd1bGFyLENvbnNvbGFzLE1lbmxvLG1vbm9zcGFjZTtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjU1O3BhZGRpbmc6MTBweDtyZXNpemU6dmVydGljYWw7Y29sb3I6IzFjMjQzMDtiYWNrZ3JvdW5kOiNmZGZlZmV9Ci5keGItZWRpdG9yOmZvY3Vze291dGxpbmU6MnB4IHNvbGlkICNiZmRiZmV9Ci5keGItcHYtaXRlbXtib3JkZXI6MXB4IHNvbGlkICNlNmViZjI7Ym9yZGVyLXJhZGl1czoxMHB4O3BhZGRpbmc6MTBweCAxNHB4O21hcmdpbi1ib3R0b206MTBweDtiYWNrZ3JvdW5kOiNmYWZiZmR9Ci5keGItcHYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O2ZvbnQtc2l6ZToxMy41cHh9Ci5keGItcHYtYmFkZ2V7YmFja2dyb3VuZDojZGJlYWZlO2NvbG9yOiMxZDRlZDg7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MXB4IDlweDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDB9Ci5keGItcHYtc2FtcGxle21hcmdpbjo4cHggMCAwO2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxDb25zb2xhcyxtb25vc3BhY2U7Zm9udC1zaXplOjExLjVweDtiYWNrZ3JvdW5kOiMwZjE3MmE7Y29sb3I6I2NiZDVlMTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjhweCAxMHB4O3doaXRlLXNwYWNlOnByZS13cmFwO3dvcmQtYnJlYWs6YnJlYWstYWxsfQouZHhiLXB2LXNhbXBsZSAuaGx7YmFja2dyb3VuZDojN2YxZDFkO2NvbG9yOiNmZWNhY2E7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1yYWRpdXM6M3B4O3BhZGRpbmc6MCAycHh9Ci5keGItZXhwYW5ke2JhY2tncm91bmQ6bm9uZTtib3JkZXI6bm9uZTtjb2xvcjojMjU2M2ViO2ZvbnQtc2l6ZToxMi41cHg7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowO21hcmdpbi10b3A6NnB4fQouZHhiLWJpZ2ljb3tmb250LXNpemU6NTZweDtsaW5lLWhlaWdodDoxfQouZHhiLXBhdGh7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O2JhY2tncm91bmQ6I2Y0ZjZmOTtib3JkZXI6MXB4IHNvbGlkICNlNmViZjI7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo4cHggMTJweDttYXgtd2lkdGg6NjQwcHg7bWFyZ2luOjEycHggYXV0byAwO2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxDb25zb2xhcyxtb25vc3BhY2U7Zm9udC1zaXplOjEycHg7d29yZC1icmVhazpicmVhay1hbGw7dGV4dC1hbGlnbjpsZWZ0fQouZHhiLW1haWx7bWFyZ2luLXRvcDoxNHB4O2ZvbnQtc2l6ZToxM3B4O2NvbG9yOiMzZjRhNWE7bWF4LXdpZHRoOjU2MHB4O2xpbmUtaGVpZ2h0OjEuNn0KLmR4Yi1tYWlsIGF7Y29sb3I6IzI1NjNlYn0KLmR4Yi1leHBlcnR7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWF4LWhlaWdodDoyMjBweDtvdmVyZmxvdzphdXRvO2JhY2tncm91bmQ6IzBmMTcyYTtjb2xvcjojY2JkNWUxO2JvcmRlci1yYWRpdXM6OHB4O2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxDb25zb2xhcyxtb25vc3BhY2U7Zm9udC1zaXplOjExcHg7cGFkZGluZzoxMHB4O21hcmdpbi10b3A6MTBweDt0ZXh0LWFsaWduOmxlZnQ7d2hpdGUtc3BhY2U6cHJlLXdyYXB9Ci5keGItcHd7cG9zaXRpb246Zml4ZWQ7dG9wOjUwJTtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlKC01MCUsLTUwJSk7ei1pbmRleDoyMTQ3NDgzMDAxO3dpZHRoOjQ0MHB4O21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNDBweCk7YmFja2dyb3VuZDojZmZmO2JvcmRlci1yYWRpdXM6MTRweDtib3gtc2hhZG93OjAgMThweCA2MHB4IHJnYmEoMCwwLDAsLjQpO3BhZGRpbmc6MjJweDtmb250LWZhbWlseTpzeXN0ZW0tdWksLWFwcGxlLXN5c3RlbSwiU2Vnb2UgVUkiLCJQaW5nRmFuZyBTQyIsIk1pY3Jvc29mdCBZYUhlaSIsc2Fucy1zZXJpZjtjb2xvcjojMWMyNDMwfQouZHhiLWNvdW50YmFye2hlaWdodDo1cHg7Ym9yZGVyLXJhZGl1czozcHg7YmFja2dyb3VuZDojZTVlYWYxO292ZXJmbG93OmhpZGRlbjttYXJnaW46MTJweCAwIDRweH0KLmR4Yi1jb3VudGJhciBpe2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZDojMjU2M2ViO3RyYW5zaXRpb246d2lkdGggMXMgbGluZWFyfQouZHhiLXRyaWdnZXJ7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtib3JkZXI6MXB4IHNvbGlkICNlMGU1ZWQ7YmFja2dyb3VuZDojZmZmO2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDEwcHg7Zm9udC1zaXplOjEyLjVweDtjdXJzb3I6cG9pbnRlcjtjb2xvcjojM2Y0YTVhO3doaXRlLXNwYWNlOm5vd3JhcH0KLmR4Yi10cmlnZ2VyOmhvdmVye2JhY2tncm91bmQ6I2Y1ZjdmYTtib3JkZXItY29sb3I6IzI1NjNlYjtjb2xvcjojMjU2M2VifQouZHhiLWRvdC1yZWR7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6N3B4O2hlaWdodDo3cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDojZGMyNjI2fQouZHhiLWNvbmZpcm17YmFja2dyb3VuZDojZmZmOGY4O2JvcmRlcjoxcHggc29saWQgI2ZlY2FjYTtib3JkZXItcmFkaXVzOjEwcHg7cGFkZGluZzoxNHB4IDE2cHg7bWF4LXdpZHRoOjQ4MHB4O21hcmdpbjowIGF1dG99Ci5keGItaGludHtmb250LXNpemU6MTJweDtjb2xvcjojOGE5NGE2O21hcmdpbi10b3A6NHB4fQouZHhiLXN1bW1hcnktdGF7d2lkdGg6MTAwJTtoZWlnaHQ6NjRweDtyZXNpemU6dmVydGljYWw7Ym9yZGVyOjFweCBzb2xpZCAjMmMzNDQyO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6IzBlMTQyMDtjb2xvcjojZTZlYmYyO3BhZGRpbmc6OHB4IDEwcHg7Zm9udC1zaXplOjEzcHg7Zm9udC1mYW1pbHk6aW5oZXJpdDtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWFyZ2luLWJvdHRvbTo2cHh9Ci5keGItc3VtbWFyeS10YTpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOiM0YTkwZDl9Ci5keGItYWl7Ym9yZGVyOjFweCBzb2xpZCAjMmMzNDQyO2JvcmRlci1yYWRpdXM6MTBweDtwYWRkaW5nOjEwcHggMTJweDttYXJnaW46MCAwIDEwcHg7YmFja2dyb3VuZDpyZ2JhKDc0LDE0NCwyMTcsLjA2KX0KLmR4Yi1haS1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttYXJnaW4tYm90dG9tOjZweDtmbGV4LXdyYXA6d3JhcH0KLmR4Yi1haS10aXRsZXtmb250LXdlaWdodDo2MDA7Zm9udC1zaXplOjEzcHh9Ci5keGItYWktYmFkZ2V7Zm9udC1zaXplOjEycHg7Y29sb3I6IzkzYzVmZDtiYWNrZ3JvdW5kOnJnYmEoNzQsMTQ0LDIxNywuMTUpO2JvcmRlci1yYWRpdXM6MTBweDtwYWRkaW5nOjFweCA4cHh9Ci5keGItYWktbGlzdHttYXJnaW46MCAwIDZweDtwYWRkaW5nLWxlZnQ6MThweH0KLmR4Yi1haS1saXN0IGxpe21hcmdpbi1ib3R0b206NnB4O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjEuNX0KLmR4Yi1haS1ldntjb2xvcjojOTRhM2I4O3dvcmQtYnJlYWs6YnJlYWstYWxsfQouZHhiLWFpLWFke2NvbG9yOiNhNWI0Yzd9Ci5keGItYWktcHJle3doaXRlLXNwYWNlOnByZS13cmFwO3dvcmQtYnJlYWs6YnJlYWstYWxsO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjEuNTtjb2xvcjojYTViNGM3O2JhY2tncm91bmQ6IzBiMTAxOTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjhweDttYXJnaW46NnB4IDAgMDttYXgtaGVpZ2h0OjE4MHB4O292ZXJmbG93OmF1dG99Ci5keGItYWktZm9vdHtmb250LXNpemU6MTFweDtjb2xvcjojNjQ3NDhiO21hcmdpbi10b3A6NHB4fQoKLmR4Yi1sbG0tcm93e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmb250LXNpemU6MTJweDtjb2xvcjojYTViNGM3O21hcmdpbjoycHggMCA2cHg7ZmxleC13cmFwOndyYXB9Ci5keGItbGxtLWhpbnR7Zm9udC1zaXplOjExcHg7Y29sb3I6IzY0NzQ4Yn0KCi5keGItYnRuLWRhbmdlcntjb2xvcjojZmZmO2JhY2tncm91bmQ6I2RjMjYyNn0uZHhiLWJ0bi1kYW5nZXI6aG92ZXJ7YmFja2dyb3VuZDojYjkxYzFjfQouZHhiLWFpLXNldHRpbmdze2JvcmRlcjoxcHggc29saWQgI2UyZThmMDtib3JkZXItcmFkaXVzOjEwcHg7cGFkZGluZzoxMHB4IDEycHg7bWFyZ2luOjZweCAwIDhweDtiYWNrZ3JvdW5kOiNmOGZhZmN9Ci5keGItYWktc2V0dGluZ3MgaDR7bWFyZ2luOjAgMCA2cHg7Zm9udC1zaXplOjEzcHg7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fQouZHhiLXByb3ZpZGVyLXJvd3tkaXNwbGF5OmZsZXg7Z2FwOjhweDthbGlnbi1pdGVtczpjZW50ZXI7ZmxleC13cmFwOndyYXA7cGFkZGluZzo3cHggMDtib3JkZXItYm90dG9tOjFweCBkYXNoZWQgI2UyZThmMH0KLmR4Yi1wcm92aWRlci1yb3c6bGFzdC1jaGlsZHtib3JkZXItYm90dG9tOm5vbmV9Ci5keGItZml4LWNhcmR7Ym9yZGVyOjFweCBzb2xpZCAjZmRlNjhhO2JhY2tncm91bmQ6I2ZmZmJlYjtib3JkZXItcmFkaXVzOjEwcHg7cGFkZGluZzoxMHB4IDEycHg7bWFyZ2luOjhweCAwfQouZHhiLWZpeC1jbWR7Zm9udC1mYW1pbHk6dWktbW9ub3NwYWNlLENvbnNvbGFzLG1vbm9zcGFjZTtmb250LXNpemU6MTEuNXB4O2xpbmUtaGVpZ2h0OjEuNTtiYWNrZ3JvdW5kOiMxZTI5M2I7Y29sb3I6I2UyZThmMDtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjZweCA4cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7d29yZC1icmVhazpicmVhay1hbGw7bWFyZ2luOjZweCAwO21heC1oZWlnaHQ6MTYwcHg7b3ZlcmZsb3c6YXV0b30KLmR4Yi1maXgtcmVzdWx0e2ZvbnQtc2l6ZToxMnB4O21hcmdpbi10b3A6NnB4fQouZHhiLWZpeC1yZXN1bHQub2t7Y29sb3I6IzE1ODAzZH0uZHhiLWZpeC1yZXN1bHQuZmFpbHtjb2xvcjojYjkxYzFjfQouZHhiLWZpeC1jb25maXJte2JhY2tncm91bmQ6I2ZlZjJmMjtib3JkZXI6MXB4IHNvbGlkICNmZWNhY2E7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo4cHggMTBweDttYXJnaW4tdG9wOjZweDtmb250LXNpemU6MTJweDtjb2xvcjojN2YxZDFkfQo=");
      var apply = function (ctx) {
      
      var slots = ctx.get('slots');
      if (!slots) return;
      var timerSvc = {
        interval: function (fn, ms) { var id = window.setInterval(fn, ms); return function () { window.clearInterval(id); }; },
        timeout: function (fnOrMs, ms) {
          if (typeof fnOrMs === 'function') { var id = window.setTimeout(fnOrMs, ms); return function () { window.clearTimeout(id); }; }
          return new Promise(function (res) { window.setTimeout(res, fnOrMs); });
        },
      };
      var workspaces = ctx.get('workspaces');
      var CALL_TIMEOUT = 20000;
      var call = function (m, a) {
        var p;
        try { p = fetch('/dsh-diagnostic-bundle/rpc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: m, args: a || {} }),
          }).then(function (resp) { return resp.json(); }).then(function (j) {
            if (!j || !j.ok) throw new Error((j && j.error) || 'rpc failed: ' + m);
            return j.data;
          }); } catch (e) { return Promise.reject(e); }
        var to = new Promise(function (_, rej) {
          timerSvc.timeout(function () {
            rej(new Error('宿主响应超时（' + m + '）：可能是连接中断，请刷新页面后重试'));
          }, CALL_TIMEOUT);
        });
        return Promise.race([p, to]);
      };

      /* ---------- store ---------- */
      var store = {
        open: false, sessionId: '', runId: '', phase: 'idle', lastPhase: 'idle',
        items: null, errCtx: null, topicDefault: '', topic: '',
        checks: { env: true, logs: true, config: true, system: true, plugins: true },
        keywords: '', maskEmail: true, maskIpv4: true,
        userSummary: '', aiOpen: false, useLLM: true, llmProviders: [], llmHasKey: false,
        aiSettingsOpen: false, llmForm: null, llmFlash: '', fixes: [], fixResults: {}, confirmFix: null,
        patches: {}, preview: null, result: null, error: '',
        browserErrors: [],
        expert: false, supportEmail: C.supportPlaceholder,
        countdown: 30, busy: false, activeTab: 0, activeFile: {},
        tabData: {}, jumpInput: '',
      };
      var subs = new Set();
      function setStore(p) { Object.assign(store, p); subs.forEach(function (f) { try { f(); } catch (e) {} }); }
      function useStore() {
        var state = React.useState(0)[1];
        React.useEffect(function () {
          var f = function () { state(function (v) { return v + 1; }); };
          subs.add(f);
          return function () { subs.delete(f); };
        }, []);
        return store;
      }

      /* ---------- css ---------- */
      var css = b64ToUtf8("LmR4Yi1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7ei1pbmRleDoyMTQ3NDgzMDAwO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtiYWNrZ3JvdW5kOnJnYmEoMTAsMTQsMjQsLjYyKTtiYWNrZHJvcC1maWx0ZXI6Ymx1cigycHgpO3BvaW50ZXItZXZlbnRzOmF1dG87Zm9udC1mYW1pbHk6c3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sIlNlZ29lIFVJIiwiUGluZ0ZhbmcgU0MiLCJNaWNyb3NvZnQgWWFIZWkiLHNhbnMtc2VyaWY7Y29sb3I6IzFjMjQzMH0KLmR4Yi1tb2RhbHtiYWNrZ3JvdW5kOiNmZmY7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6MCAxOHB4IDYwcHggcmdiYSgwLDAsMCwuMzUpO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47b3ZlcmZsb3c6aGlkZGVuO3dpZHRoOjg4MHB4O21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNDhweCk7aGVpZ2h0OjY0MHB4O21heC1oZWlnaHQ6Y2FsYygxMDB2aCAtIDQ4cHgpO21pbi13aWR0aDo3MjBweDttaW4taGVpZ2h0OjUyMHB4fQouZHhiLWhlYWR7cGFkZGluZzoxNnB4IDIwcHggMTBweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZThlY2YyO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDoxMHB4O2ZsZXgtc2hyaW5rOjB9Ci5keGItaGVhZCBoMnttYXJnaW46MDtmb250LXNpemU6MTdweDtmb250LXdlaWdodDo2MDA7bGluZS1oZWlnaHQ6MS4zfQouZHhiLWhlYWQgcHttYXJnaW46NHB4IDAgMDtmb250LXNpemU6MTIuNXB4O2NvbG9yOiM2Yjc2ODY7bGluZS1oZWlnaHQ6MS41fQouZHhiLWNsb3Nle21hcmdpbi1sZWZ0OmF1dG87Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtiYWNrZ3JvdW5kOiNmMWY0Zjg7Y29sb3I6IzRhNTU2ODtib3JkZXItcmFkaXVzOjhweDt3aWR0aDozMnB4O2hlaWdodDozMnB4O2ZvbnQtc2l6ZToxNXB4O2N1cnNvcjpwb2ludGVyO2ZsZXgtc2hyaW5rOjB9Ci5keGItY2xvc2U6aG92ZXJ7YmFja2dyb3VuZDojZTRlOWYwfQouZHhiLWJvZHl7ZmxleDoxO292ZXJmbG93OmF1dG87cGFkZGluZzoxOHB4IDIwcHh9Ci5keGItZm9vdHtwYWRkaW5nOjEycHggMjBweDtib3JkZXItdG9wOjFweCBzb2xpZCAjZThlY2YyO2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7Z2FwOjEwcHg7ZmxleC1zaHJpbms6MDthbGlnbi1pdGVtczpjZW50ZXJ9Ci5keGItYnRue2JvcmRlci1yYWRpdXM6OHB4O2JvcmRlcjoxcHggc29saWQgI2Q2ZGNlNTtiYWNrZ3JvdW5kOiNmZmY7Y29sb3I6IzI0MzAzZjtwYWRkaW5nOjhweCAxNnB4O2ZvbnQtc2l6ZToxMy41cHg7Y3Vyc29yOnBvaW50ZXJ9Ci5keGItYnRuOmhvdmVye2JhY2tncm91bmQ6I2Y1ZjdmYX0KLmR4Yi1idG46ZGlzYWJsZWR7b3BhY2l0eTouNTU7Y3Vyc29yOm5vdC1hbGxvd2VkfQouZHhiLWJ0bi1wcmltYXJ5e2JvcmRlcjoxcHggc29saWQgIzI1NjNlYjtiYWNrZ3JvdW5kOiMyNTYzZWI7Y29sb3I6I2ZmZn0KLmR4Yi1idG4tcHJpbWFyeTpob3ZlcntiYWNrZ3JvdW5kOiMxZDRlZDh9Ci5keGItYnRuLWRhbmdlcntib3JkZXI6MXB4IHNvbGlkICNkYzI2MjY7Y29sb3I6I2RjMjYyNn0KLmR4Yi1idG4tZGFuZ2VyOmhvdmVye2JhY2tncm91bmQ6I2ZlZjJmMn0KLmR4Yi1zcGlue3dpZHRoOjM4cHg7aGVpZ2h0OjM4cHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjRweCBzb2xpZCAjZGJlNGYwO2JvcmRlci10b3AtY29sb3I6IzI1NjNlYjthbmltYXRpb246ZHhic3BpbiAuOHMgbGluZWFyIGluZmluaXRlO21hcmdpbjowIGF1dG8gMTRweH0KQGtleWZyYW1lcyBkeGJzcGlue3Rve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19Ci5keGItY2VudGVye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7dGV4dC1hbGlnbjpjZW50ZXI7aGVpZ2h0OjEwMCU7cGFkZGluZzoyMHB4fQouZHhiLXN0ZXBze2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjEwcHg7bWFyZ2luLXRvcDoxOHB4O21heC13aWR0aDo1MjBweDt3aWR0aDoxMDAlfQouZHhiLXN0ZXB7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjEwcHggMTRweDtib3JkZXI6MXB4IHNvbGlkICNlNmViZjI7Ym9yZGVyLXJhZGl1czoxMHB4O2JhY2tncm91bmQ6I2ZhZmJmZH0KLmR4Yi1zdGVwLWljb3t3aWR0aDoyMnB4O2hlaWdodDoyMnB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6I2VlZjFmNjtjb2xvcjojNjQ3NDhiO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LXNpemU6MTJweDtmbGV4LXNocmluazowfQouZHhiLXN0ZXAtb2t7YmFja2dyb3VuZDojZGNmY2U3O2NvbG9yOiMxNTgwM2R9Ci5keGItc3RlcC1ydW57YmFja2dyb3VuZDojZGJlYWZlO2NvbG9yOiMxZDRlZDh9Ci5keGItc3RlcC1za2lwe2JhY2tncm91bmQ6I2ZlZjNjNztjb2xvcjojYjQ1MzA5fQouZHhiLXN0ZXAtZmFpbHtiYWNrZ3JvdW5kOiNmZWUyZTI7Y29sb3I6I2I5MWMxY30KLmR4Yi1zdGVwLW5hbWV7Zm9udC1zaXplOjEzLjVweDtmb250LXdlaWdodDo1MDB9Ci5keGItc3RlcC1ub3Rle21hcmdpbi1sZWZ0OmF1dG87Zm9udC1zaXplOjEycHg7Y29sb3I6IzhhOTRhNn0KLmR4Yi1zdGF0dXN7Zm9udC1zaXplOjEzcHg7Y29sb3I6IzViNjU3NTttYXJnaW4tdG9wOjEycHh9Ci5keGItZXJye2NvbG9yOiNiOTFjMWM7Zm9udC1zaXplOjEzcHg7YmFja2dyb3VuZDojZmVmMmYyO2JvcmRlcjoxcHggc29saWQgI2ZlY2FjYTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjhweCAxMnB4O21hcmdpbi10b3A6MTBweDttYXgtd2lkdGg6NTIwcHg7dGV4dC1hbGlnbjpsZWZ0fQouZHhiLWZvcm0gbGFiZWx7ZGlzcGxheTpibG9jaztmb250LXNpemU6MTIuNXB4O2NvbG9yOiMzZjRhNWE7Zm9udC13ZWlnaHQ6NTAwO21hcmdpbjoxMnB4IDAgNXB4fQouZHhiLWlucHV0e3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlcjoxcHggc29saWQgI2Q2ZGNlNTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjhweCAxMHB4O2ZvbnQtc2l6ZToxMy41cHg7YmFja2dyb3VuZDojZmZmO2NvbG9yOiMxYzI0MzB9Ci5keGItaW5wdXQ6Zm9jdXN7b3V0bGluZToycHggc29saWQgI2JmZGJmZTtib3JkZXItY29sb3I6IzI1NjNlYn0KLmR4Yi1yb3d7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcH0KLmR4Yi1jaGVja3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC1zaXplOjEzLjVweDtwYWRkaW5nOjdweCAxMnB4O2JvcmRlcjoxcHggc29saWQgI2UwZTVlZDtib3JkZXItcmFkaXVzOjlweDtiYWNrZ3JvdW5kOiNmZmY7Y3Vyc29yOnBvaW50ZXI7dXNlci1zZWxlY3Q6bm9uZX0KLmR4Yi1jaGVjayBpbnB1dHttYXJnaW46MDthY2NlbnQtY29sb3I6IzI1NjNlYn0KLmR4Yi1jaGVjay1vZmZ7b3BhY2l0eTouNTU7YmFja2dyb3VuZDojZjRmNmY5fQouZHhiLXRhYnN7ZGlzcGxheTpmbGV4O2dhcDo0cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2U2ZWJmMjttYXJnaW4tYm90dG9tOjEycHg7ZmxleC1zaHJpbms6MH0KLmR4Yi10YWJ7Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtiYWNrZ3JvdW5kOm5vbmU7cGFkZGluZzo4cHggMTRweDtmb250LXNpemU6MTMuNXB4O2N1cnNvcjpwb2ludGVyO2JvcmRlci1yYWRpdXM6OHB4IDhweCAwIDA7Y29sb3I6IzViNjU3NTtwb3NpdGlvbjpyZWxhdGl2ZX0KLmR4Yi10YWItb257Ym9yZGVyLWNvbG9yOiNlNmViZjI7Ym9yZGVyLWJvdHRvbS1jb2xvcjojZmZmO2JhY2tncm91bmQ6I2ZmZjtjb2xvcjojMWMyNDMwO2ZvbnQtd2VpZ2h0OjYwMH0KLmR4Yi10YWItZXhjbHVkZWR7Y29sb3I6I2I0NTMwOX0KLmR4Yi1kb3R7cG9zaXRpb246YWJzb2x1dGU7dG9wOjZweDtyaWdodDo3cHg7Y29sb3I6I2RjMjYyNjtmb250LXNpemU6MTFweH0KLmR4Yi1maWxlYmFye2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2ZsZXgtd3JhcDp3cmFwO21hcmdpbi1ib3R0b206MTBweH0KLmR4Yi1maWxlY2hpcHtib3JkZXI6MXB4IHNvbGlkICNlMGU1ZWQ7Ym9yZGVyLXJhZGl1czoxNHB4O3BhZGRpbmc6M3B4IDEwcHg7Zm9udC1zaXplOjEycHg7YmFja2dyb3VuZDojZmZmO2N1cnNvcjpwb2ludGVyfQouZHhiLWZpbGVjaGlwLW9ue2JhY2tncm91bmQ6IzI1NjNlYjtib3JkZXItY29sb3I6IzI1NjNlYjtjb2xvcjojZmZmfQouZHhiLXBhZ2Vye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttYXJnaW4tYm90dG9tOjhweDtmb250LXNpemU6MTIuNXB4O2NvbG9yOiM1YjY1NzU7ZmxleC13cmFwOndyYXB9Ci5keGItcGFnZXIgaW5wdXR7d2lkdGg6OTBweH0KLmR4Yi1lZGl0b3J7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDozMDBweDtib3JkZXI6MXB4IHNvbGlkICNkNmRjZTU7Ym9yZGVyLXJhZGl1czo4cHg7Zm9udC1mYW1pbHk6dWktbW9ub3NwYWNlLFNGTW9uby1SZWd1bGFyLENvbnNvbGFzLE1lbmxvLG1vbm9zcGFjZTtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjU1O3BhZGRpbmc6MTBweDtyZXNpemU6dmVydGljYWw7Y29sb3I6IzFjMjQzMDtiYWNrZ3JvdW5kOiNmZGZlZmV9Ci5keGItZWRpdG9yOmZvY3Vze291dGxpbmU6MnB4IHNvbGlkICNiZmRiZmV9Ci5keGItcHYtaXRlbXtib3JkZXI6MXB4IHNvbGlkICNlNmViZjI7Ym9yZGVyLXJhZGl1czoxMHB4O3BhZGRpbmc6MTBweCAxNHB4O21hcmdpbi1ib3R0b206MTBweDtiYWNrZ3JvdW5kOiNmYWZiZmR9Ci5keGItcHYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O2ZvbnQtc2l6ZToxMy41cHh9Ci5keGItcHYtYmFkZ2V7YmFja2dyb3VuZDojZGJlYWZlO2NvbG9yOiMxZDRlZDg7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MXB4IDlweDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDB9Ci5keGItcHYtc2FtcGxle21hcmdpbjo4cHggMCAwO2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxDb25zb2xhcyxtb25vc3BhY2U7Zm9udC1zaXplOjExLjVweDtiYWNrZ3JvdW5kOiMwZjE3MmE7Y29sb3I6I2NiZDVlMTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjhweCAxMHB4O3doaXRlLXNwYWNlOnByZS13cmFwO3dvcmQtYnJlYWs6YnJlYWstYWxsfQouZHhiLXB2LXNhbXBsZSAuaGx7YmFja2dyb3VuZDojN2YxZDFkO2NvbG9yOiNmZWNhY2E7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1yYWRpdXM6M3B4O3BhZGRpbmc6MCAycHh9Ci5keGItZXhwYW5ke2JhY2tncm91bmQ6bm9uZTtib3JkZXI6bm9uZTtjb2xvcjojMjU2M2ViO2ZvbnQtc2l6ZToxMi41cHg7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowO21hcmdpbi10b3A6NnB4fQouZHhiLWJpZ2ljb3tmb250LXNpemU6NTZweDtsaW5lLWhlaWdodDoxfQouZHhiLXBhdGh7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O2JhY2tncm91bmQ6I2Y0ZjZmOTtib3JkZXI6MXB4IHNvbGlkICNlNmViZjI7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo4cHggMTJweDttYXgtd2lkdGg6NjQwcHg7bWFyZ2luOjEycHggYXV0byAwO2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxDb25zb2xhcyxtb25vc3BhY2U7Zm9udC1zaXplOjEycHg7d29yZC1icmVhazpicmVhay1hbGw7dGV4dC1hbGlnbjpsZWZ0fQouZHhiLW1haWx7bWFyZ2luLXRvcDoxNHB4O2ZvbnQtc2l6ZToxM3B4O2NvbG9yOiMzZjRhNWE7bWF4LXdpZHRoOjU2MHB4O2xpbmUtaGVpZ2h0OjEuNn0KLmR4Yi1tYWlsIGF7Y29sb3I6IzI1NjNlYn0KLmR4Yi1leHBlcnR7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWF4LWhlaWdodDoyMjBweDtvdmVyZmxvdzphdXRvO2JhY2tncm91bmQ6IzBmMTcyYTtjb2xvcjojY2JkNWUxO2JvcmRlci1yYWRpdXM6OHB4O2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxDb25zb2xhcyxtb25vc3BhY2U7Zm9udC1zaXplOjExcHg7cGFkZGluZzoxMHB4O21hcmdpbi10b3A6MTBweDt0ZXh0LWFsaWduOmxlZnQ7d2hpdGUtc3BhY2U6cHJlLXdyYXB9Ci5keGItcHd7cG9zaXRpb246Zml4ZWQ7dG9wOjUwJTtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlKC01MCUsLTUwJSk7ei1pbmRleDoyMTQ3NDgzMDAxO3dpZHRoOjQ0MHB4O21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNDBweCk7YmFja2dyb3VuZDojZmZmO2JvcmRlci1yYWRpdXM6MTRweDtib3gtc2hhZG93OjAgMThweCA2MHB4IHJnYmEoMCwwLDAsLjQpO3BhZGRpbmc6MjJweDtmb250LWZhbWlseTpzeXN0ZW0tdWksLWFwcGxlLXN5c3RlbSwiU2Vnb2UgVUkiLCJQaW5nRmFuZyBTQyIsIk1pY3Jvc29mdCBZYUhlaSIsc2Fucy1zZXJpZjtjb2xvcjojMWMyNDMwfQouZHhiLWNvdW50YmFye2hlaWdodDo1cHg7Ym9yZGVyLXJhZGl1czozcHg7YmFja2dyb3VuZDojZTVlYWYxO292ZXJmbG93OmhpZGRlbjttYXJnaW46MTJweCAwIDRweH0KLmR4Yi1jb3VudGJhciBpe2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZDojMjU2M2ViO3RyYW5zaXRpb246d2lkdGggMXMgbGluZWFyfQouZHhiLXRyaWdnZXJ7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtib3JkZXI6MXB4IHNvbGlkICNlMGU1ZWQ7YmFja2dyb3VuZDojZmZmO2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDEwcHg7Zm9udC1zaXplOjEyLjVweDtjdXJzb3I6cG9pbnRlcjtjb2xvcjojM2Y0YTVhO3doaXRlLXNwYWNlOm5vd3JhcH0KLmR4Yi10cmlnZ2VyOmhvdmVye2JhY2tncm91bmQ6I2Y1ZjdmYTtib3JkZXItY29sb3I6IzI1NjNlYjtjb2xvcjojMjU2M2VifQouZHhiLWRvdC1yZWR7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6N3B4O2hlaWdodDo3cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDojZGMyNjI2fQouZHhiLWNvbmZpcm17YmFja2dyb3VuZDojZmZmOGY4O2JvcmRlcjoxcHggc29saWQgI2ZlY2FjYTtib3JkZXItcmFkaXVzOjEwcHg7cGFkZGluZzoxNHB4IDE2cHg7bWF4LXdpZHRoOjQ4MHB4O21hcmdpbjowIGF1dG99Ci5keGItaGludHtmb250LXNpemU6MTJweDtjb2xvcjojOGE5NGE2O21hcmdpbi10b3A6NHB4fQ==");

      var _styleEl = document.createElement('style');
      _styleEl.textContent = css;
      (document.head || document.documentElement).appendChild(_styleEl);

      /* ---------- helpers ---------- */
      function fileRelFor(tab, items) {
        if (tab === 0) return 'environment.json';
        if (tab === 3) return 'system.json';
        if (tab === 4) return 'plugins.json';
        var files = tab === 1 ? (items && items.logs && items.logs.files) || [] : (items && items.config && items.config.files) || [];
        var cur = store.activeFile[tab];
        if (cur && files.some(function (f) { return f.rel === cur; })) return cur;
        return files.length ? files[0].rel : null;
      }

      function parseKeywords() {
        return store.keywords.split(/[,，\s]+/).map(function (w) { return w.trim(); }).filter(Boolean).slice(0, 50);
      }

      function openModal(sessionId) {
        setStore({
          open: true, sessionId: sessionId || '', runId: '', phase: 'collecting', lastPhase: 'collecting',
          items: null, errCtx: null, topic: '', patches: {}, preview: null, result: null, error: '',
          expert: false, countdown: 30, busy: false, activeTab: 0, activeFile: {}, tabData: {}, jumpInput: '',
        });
        call('dxb:collect', { sessionId: sessionId || '' }).then(function (r) {
          setStore({ runId: r.runId || r });
        }).catch(function (e) {
          setStore({ phase: 'failed', error: String((e && e.message) || e) });
        });
        call('dxb:context', {}).then(function (c) {
          if (c && c.llmProviders) setStore({ llmProviders: c.llmProviders, llmHasKey: c.llmProviders.some(function (p) { return p.hasKey; }) });
        }).catch(function () {});
      }

      function closeModal() {
        setStore({ open: false, phase: 'idle' });
      }

      function doCleanup() {
        var rid = store.runId;
        if (rid) { try { call('dxb:cleanup', { runId: rid }); } catch (e) {} }
        closeModal();
      }

      function requestCancel() {
        if (store.phase === 'success' || store.phase === 'failed') { doCleanup(); return; }
        if (store.phase === 'confirm') return;
        setStore({ lastPhase: store.phase, phase: 'confirm' });
      }

      function abortConfirmed() { doCleanup(); }

      /* ---------- trigger components ---------- */
      function TriggerBtn(props) {
        var st = useStore();
        React.useEffect(function () {
          var sid = props && props.sessionId;
          if (!sid) return;
          call('dxb:context', { sessionId: sid }).then(function (r) {
            if (r) setStore({ errCtx: r.hasError ? { hasError: true, message: r.errMessage } : null, topicDefault: r.topicDefault || '', supportEmail: r.supportEmail || C.supportPlaceholder });
          }).catch(function () {});
        }, []);
        return React.createElement('button', {
          className: 'dxb-trigger',
          title: (st.errCtx && st.errCtx.hasError ? C.errHint + ' — ' : '') + C.title,
          onClick: function () { openModal(props && props.sessionId); },
        }, st.errCtx && st.errCtx.hasError ? React.createElement('span', { className: 'dxb-dot-red' }) : null, C.trigger);
      }

      function InputBtn(props) {
        var st = useStore();
        React.useEffect(function () {
          var sid = props && props.sessionId;
          if (!sid || st.topicDefault) return;
          call('dxb:context', { sessionId: sid }).then(function (r) {
            if (r) setStore({ topicDefault: r.topicDefault || '', supportEmail: r.supportEmail || C.supportPlaceholder });
          }).catch(function () {});
        }, []);
        return React.createElement('button', {
          className: 'dxb-trigger',
          title: C.title,
          onClick: function () { openModal(props && props.sessionId); },
        }, C.inputBtn);
      }

      /* ---------- modal views ---------- */
      function stepIcon(status) {
        if (status === 'ok' || status === 'done') return React.createElement('span', { className: 'dxb-step-ico dxb-step-ok' }, '✓');
        if (status === 'running') return React.createElement('span', { className: 'dxb-step-ico dxb-step-run' }, '•');
        if (status === 'skip' || status === 'missing') return React.createElement('span', { className: 'dxb-step-ico dxb-step-skip' }, '!');
        if (status === 'fail' || status === 'failed' || status === 'permission_denied') return React.createElement('span', { className: 'dxb-step-ico dxb-step-fail' }, '✕');
        return React.createElement('span', { className: 'dxb-step-ico' }, '·');
      }
      function stepNote(status) {
        if (status === 'ok' || status === 'done') return C.stDone;
        if (status === 'running') return C.stRun;
        if (status === 'missing') return '未找到';
        if (status === 'skip' || status === 'failed') return C.stSkip;
        if (status === 'permission_denied') return C.stPerm;
        return C.stWait;
      }

      function CollectView() {
        var st = useStore();
        var items = st.items;
        var envS = items ? items.env.status : (st.phase === 'collecting' ? 'running' : 'wait');
        var logS = items ? (items.logs.status === 'missing' ? 'missing' : 'ok') : 'wait';
        var cfgS = items ? (items.config.status === 'missing' ? 'missing' : 'ok') : 'wait';
        var sysS = items ? (items.system.status === 'failed' ? 'failed' : items.system.status === 'permission_denied' ? 'permission_denied' : items.system.status === 'ok' ? 'ok' : items.system.status === 'partial' ? 'ok' : 'wait') : 'wait';
        var rows = [
          { k: 'env', label: C.steps.env, s: envS },
          { k: 'logs', label: C.steps.logs, s: logS },
          { k: 'config', label: C.steps.config, s: cfgS },
          { k: 'system', label: C.steps.system, s: sysS },
          { k: 'plugins', label: C.steps.plugins, s: items && items.plugins ? (items.plugins.status === 'failed' ? 'failed' : 'ok') : 'wait' },
        ];
        return React.createElement('div', { className: 'dxb-center', role: 'status' },
          React.createElement('div', { className: 'dxb-spin' }),
          React.createElement('h3', { style: { margin: '0 0 4px', fontSize: '16px' } }, C.collecting),
          React.createElement('div', { className: 'dxb-status' }, C.collectingDesc),
          React.createElement('div', { className: 'dxb-steps' },
            rows.map(function (r) {
              return React.createElement('div', { key: r.k, className: 'dxb-step' },
                stepIcon(r.s),
                React.createElement('span', { className: 'dxb-step-name' }, r.label),
                React.createElement('span', { className: 'dxb-step-note' }, stepNote(r.s)));
            })),
          st.error ? React.createElement('div', { className: 'dxb-err', role: 'alert' }, st.error) : null);
      }

      function ElevateView() {
        var st = useStore();
        var inputRef = React.useRef(null);
        React.useEffect(function () {
          setStore({ countdown: 30 });
          var t = timerSvc.interval(function () {
            var c = store.countdown - 1;
            setStore({ countdown: c });
            if (c <= 0) {
              try { t(); } catch (e) {}

              if (store.phase === 'elevation' && !store.busy) {
                call('dxb:elevate', { runId: store.runId, action: 'timeout' }).then(function (s) { setStore({ phase: 'review', items: s.items, topicDefault: s.topicDefault || store.topicDefault }); }).catch(function () {});
              }
            }
          }, 1000);
          return function () { try { t(); } catch (e) {} };
        }, []);
        function submit() {
          var pw = inputRef.current && inputRef.current.value || '';
          if (!pw) return;
          setStore({ busy: true });
          call('dxb:elevate', { runId: store.runId, password: pw }).then(function (s) {
            setStore({ busy: false, phase: 'review', items: s.items, countdown: 0 });
          }).catch(function (e) {
            setStore({ busy: false, error: C.elevateWrong + '（' + String((e && e.message) || e).slice(0, 120) + '）' });
          });
        }
        function skip() {
          setStore({ busy: true });
          call('dxb:elevate', { runId: store.runId, action: 'skip' }).then(function (s) {
            setStore({ busy: false, phase: 'review', items: s.items });
          }).catch(function () { setStore({ busy: false, error: C.elevateWrong }); });
        }
        var pct = Math.max(0, Math.min(100, (st.countdown / 30) * 100));
        return React.createElement('div', { className: 'dxb-pw', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dxb-pw-title' },
          React.createElement('h3', { id: 'dxb-pw-title', style: { margin: '0 0 8px', fontSize: '15px' } }, C.elevateTitle),
          React.createElement('div', { style: { fontSize: '12.5px', color: '#5b6575', lineHeight: 1.6 } }, C.elevateDesc),
          React.createElement('label', { style: { display: 'block', margin: '14px 0 5px', fontSize: '12.5px', fontWeight: 500 } }, C.elevateLabel),
          React.createElement('input', { ref: inputRef, type: 'password', className: 'dxb-input', autoComplete: 'off', disabled: st.busy, onKeyDown: function (e) { if (e.key === 'Enter') submit(); } }),
          React.createElement('div', { className: 'dxb-countbar' }, React.createElement('i', { style: { width: pct + '%' } })),
          React.createElement('div', { style: { fontSize: '11.5px', color: '#8a94a6' } }, C.elevateCountdown.replace('{s}', String(Math.max(0, st.countdown)))),
          st.error ? React.createElement('div', { className: 'dxb-err', role: 'alert' }, st.error) : null,
          React.createElement('div', { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' } },
            React.createElement('button', { className: 'dxb-btn', onClick: skip, disabled: st.busy }, C.elevateSkip),
            React.createElement('button', { className: 'dxb-btn dxb-btn-primary', onClick: submit, disabled: st.busy }, st.busy ? C.elevateBusy : C.elevateSubmit)));
      }

      function FileEditor(props) {
        var st = useStore();
        var rel = props.rel;
        var data = st.tabData[rel];
        var from = data ? data.from : 1;
        var total = data ? data.total : 0;
        var lines = data ? data.lines : [];
        var base = data ? data.base : '';
        var value = data ? data.value : '';
        React.useEffect(function () {
          if (!rel || st.tabData[rel]) return;
          call('dxb:read', { runId: st.runId, rel: rel, from: 1, count: 2000 }).then(function (r) {
            var b = r.lines.join('\n');
            var rawEndsNl = r.lines.length && r.lines[r.lines.length - 1] === '';
            if (rawEndsNl) b = b + '\n';
            var td = Object.assign({}, st.tabData, {});
            td[rel] = { from: 1, total: r.total, lines: r.lines, base: b, value: b };
            setStore({ tabData: td });
          }).catch(function (e) { setStore({ error: String((e && e.message) || e) }); });
        }, [rel]);
        function loadPage(nf) {
          if (!rel) return;
          call('dxb:read', { runId: st.runId, rel: rel, from: nf, count: 2000 }).then(function (r) {
            var b = r.lines.join('\n');
            var rawEndsNl = r.lines.length && r.lines[r.lines.length - 1] === '';
            if (rawEndsNl) b = b + '\n';
            var td = Object.assign({}, st.tabData, {});
            td[rel] = { from: nf, total: r.total, lines: r.lines, base: b, value: b };
            setStore({ tabData: td, jumpInput: '' });
          }).catch(function (e) { setStore({ error: String((e && e.message) || e) }); });
        }
        function onChange(ev) {
          var v = ev.target.value;
          var td = Object.assign({}, st.tabData, {});
          td[rel] = Object.assign({}, td[rel], { value: v });
          setStore({ tabData: td });
          var patches = Object.assign({}, st.patches, {});
          var list = (patches[rel] || []).filter(function (p) { return p.startLine !== from; });
          if (v !== base) {
            var endLine = from + lines.length - 1;
            if (lines.length && lines[lines.length - 1] === '' && base !== '') endLine = from + lines.length - 2;
            list.push({ startLine: from, endLine: Math.max(from, endLine), newText: v });
          }
          patches[rel] = list;
          setStore({ patches: patches });
        }
        var last = Math.min(total, from + 1999);
        var hasPatch = (st.patches[rel] || []).some(function (p) { return p.startLine === from; });
        return React.createElement('div', null,
          React.createElement('div', { className: 'dxb-pager' },
            React.createElement('button', { className: 'dxb-btn', disabled: from <= 1 || !rel, onClick: function () { loadPage(Math.max(1, from - 2000)); } }, C.prev),
            React.createElement('button', { className: 'dxb-btn', disabled: from + 2000 > total || !rel, onClick: function () { loadPage(from + 2000); } }, C.next),
            React.createElement('span', null, C.pageInfo.replace('{from}', String(from)).replace('{to}', String(last)).replace('{total}', String(total))),
            React.createElement('input', { className: 'dxb-input', style: { width: '100px', padding: '4px 8px' }, placeholder: C.jumpPh, value: st.jumpInput, onChange: function (e) { setStore({ jumpInput: e.target.value }); }, onKeyDown: function (e) { if (e.key === 'Enter') doJump(); } }),
            React.createElement('button', { className: 'dxb-btn', onClick: doJump }, C.jumpBtn),
            hasPatch ? React.createElement('span', { style: { color: '#dc2626', fontSize: '12px', fontWeight: 600 } }, C.unsaved) : null),
          React.createElement('textarea', { className: 'dxb-editor', value: value, onChange: onChange, spellCheck: false, placeholder: total === 0 ? '（文件为空）' : '' }),
          React.createElement('div', { className: 'dxb-hint' }, C.reviewHint));
        function doJump() {
          var n = parseInt(st.jumpInput, 10);
          if (!n || !total) return;
          var f = Math.max(1, Math.min(n, Math.max(1, total - 1999)));
          loadPage(f);
        }
      }

      function pickFile(tab, rel) {
        var af = Object.assign({}, store.activeFile, {});
        af[tab] = rel;
        setStore({ activeFile: af });
        if (!store.tabData[rel]) {
          call('dxb:read', { runId: store.runId, rel: rel, from: 1, count: 2000 }).then(function (r) {
            var b = r.lines.join('\n');
            if (r.lines.length && r.lines[r.lines.length - 1] === '') b = b + '\n';
            var td = Object.assign({}, store.tabData, {});
            td[rel] = { from: 1, total: r.total, lines: r.lines, base: b, value: b };
            setStore({ tabData: td });
          }).catch(function (e) { setStore({ error: String((e && e.message) || e) }); });
        }
      }

      function LlmSettingsPanel() {
        var st = useStore();
        function refreshProviders() {
          call('dxb:context').then(function (c) {
            if (c && c.llmProviders) setStore({ llmProviders: c.llmProviders, llmHasKey: c.llmProviders.some(function (p) { return p.hasKey; }), llmFlash: '' });
          }).catch(function () {});
        }
        function saveForm() {
          var f = st.llmForm || {};
          var entry = { id: f.id || '', name: f.name || '', baseUrl: f.baseUrl || '', model: f.model || '', apiKey: f.apiKey || '', enabled: f.enabled !== false };
          call('dxb:llmProviderSave', { provider: entry }).then(function () {
            setStore({ llmForm: null });
            refreshProviders();
            setStore({ llmFlash: C.aiSaved });
            timerSvc.timeout(function () { if (store.llmFlash) setStore({ llmFlash: '' }); }, 2500);
          }).catch(function (e) { setStore({ error: String((e && e.message) || e) }); });
        }
        function del(id) {
          call('dxb:llmProviderDelete', { id: id }).then(refreshProviders).catch(function (e) { setStore({ error: String((e && e.message) || e) }); });
        }
        function newForm() { setStore({ llmForm: { id: '', name: '', baseUrl: '', model: '', apiKey: '', enabled: true } }); }
        var provs = st.llmProviders || [];
        return React.createElement('div', { className: 'dxb-ai-settings' },
          React.createElement('h4', null, '🔑 ' + C.aiSettingsTitle,
            React.createElement('span', { style: { fontSize: '11px', color: '#8a94a6', fontWeight: 400, marginLeft: '4px' } }, C.aiSettingsDesc)),
          provs.map(function (p) {
            return React.createElement('div', { key: p.id, className: 'dxb-provider-row' },
              React.createElement('span', { style: { fontWeight: 600, fontSize: '12.5px', minWidth: '110px' } }, p.name || p.id),
              React.createElement('span', { style: { fontSize: '11.5px', color: '#64748b' } }, (p.model || '') + ' · ' + (p.hasKey ? C.aiSaved : C.aiFieldKey)),
              React.createElement('span', { style: { fontSize: '11.5px', color: p.enabled ? '#15803d' : '#94a3b8' } }, p.enabled ? C.aiEnabled : C.aiDisabled),
              React.createElement('button', { className: 'dxb-btn', style: { padding: '2px 8px', fontSize: '11.5px', marginLeft: 'auto' }, onClick: function () { setStore({ llmForm: Object.assign({}, p, { apiKey: '' }) }); } }, C.aiEdit),
              React.createElement('button', { className: 'dxb-btn', style: { padding: '2px 8px', fontSize: '11.5px' }, onClick: function () { del(p.id); } }, C.aiDelete));
          }),
          st.llmForm ? React.createElement('div', { className: 'dxb-provider-row' },
            React.createElement('input', { className: 'dxb-input', placeholder: C.aiFieldName, style: { width: '96px' }, value: st.llmForm.name || '', onChange: function (e) { var f = Object.assign({}, st.llmForm, { name: e.target.value }); setStore({ llmForm: f }); } }),
            React.createElement('input', { className: 'dxb-input', placeholder: C.aiFieldBase, style: { width: '170px' }, value: st.llmForm.baseUrl || '', onChange: function (e) { var f = Object.assign({}, st.llmForm, { baseUrl: e.target.value }); setStore({ llmForm: f }); } }),
            React.createElement('input', { className: 'dxb-input', placeholder: C.aiFieldModel, style: { width: '120px' }, value: st.llmForm.model || '', onChange: function (e) { var f = Object.assign({}, st.llmForm, { model: e.target.value }); setStore({ llmForm: f }); } }),
            React.createElement('input', { type: 'password', className: 'dxb-input', placeholder: C.aiFieldKey, style: { width: '170px' }, value: st.llmForm.apiKey || '', onChange: function (e) { var f = Object.assign({}, st.llmForm, { apiKey: e.target.value }); setStore({ llmForm: f }); } }),
            React.createElement('label', { style: { fontSize: '12px' } }, React.createElement('input', { type: 'checkbox', checked: st.llmForm.enabled !== false, onChange: function (e) { var f = Object.assign({}, st.llmForm, { enabled: e.target.checked }); setStore({ llmForm: f }); } }), ' ' + C.aiEnabled),
            React.createElement('button', { className: 'dxb-btn dxb-btn-primary', style: { padding: '3px 10px', fontSize: '12px' }, onClick: saveForm }, C.aiSave),
            React.createElement('button', { className: 'dxb-btn', style: { padding: '3px 10px', fontSize: '12px' }, onClick: function () { setStore({ llmForm: null }); } }, C.aiCancelEdit))
          : React.createElement('div', { style: { marginTop: '4px' } },
              React.createElement('button', { className: 'dxb-btn', style: { padding: '3px 10px', fontSize: '12px' }, onClick: newForm }, '+ ' + C.aiAdd)),
          st.llmFlash ? React.createElement('div', { style: { fontSize: '12px', color: '#15803d', marginTop: '4px' } }, st.llmFlash) : null);
      }

      function ReviewView() {
        var st = useStore();
        var items = st.items;
        function setTab(i) {
          setStore({ activeTab: i });
          var rel = fileRelFor(i, items);
          if (rel && !st.tabData[rel]) {
            call('dxb:read', { runId: st.runId, rel: rel, from: 1, count: 2000 }).then(function (r) {
              var b = r.lines.join('\n');
              if (r.lines.length && r.lines[r.lines.length - 1] === '') b = b + '\n';
              var td = Object.assign({}, st.tabData, {});
              td[rel] = { from: 1, total: r.total, lines: r.lines, base: b, value: b };
              setStore({ tabData: td });
            }).catch(function (e) { setStore({ error: String((e && e.message) || e) }); });
          }
        }
        function toggleCheck(k) {
          var c = Object.assign({}, st.checks, {});
          c[k] = !c[k];
          setStore({ checks: c });
        }
        function preview() {
          setStore({ phase: 'previewing', error: '' });
          call('dxb:preview', {
            runId: st.runId,
            checks: st.checks,
            keywords: store.keywords,
            masks: { email: st.maskEmail, ipv4: st.maskIpv4 },
            patches: st.patches,
            topic: st.topic,
            userSummary: st.userSummary,
            useLLM: st.useLLM,
            browserErrors: store.browserErrors.slice(-20),
          }).then(function (r) {
            setStore({ phase: 'preview', preview: r, topic: r.topic || st.topic, fixes: r.fixes || [] });
          }).catch(function (e) {
            setStore({ phase: 'failed', error: String((e && e.message) || e) });
          });
        }
        var rel = fileRelFor(st.activeTab, items);
        var tabRels = [
          ['environment.json'],
          (items && items.logs && items.logs.files || []).map(function (f) { return f.rel; }),
          (items && items.config && items.config.files || []).map(function (f) { return f.rel; }),
          ['system.json'],
          ['plugins.json'],
        ];
        var excludedTabs = [st.checks.env === false, st.checks.logs === false, st.checks.config === false, st.checks.system === false, st.checks.plugins === false];
        var fileCounts = [
          rel && tabRels[0].length ? st.tabData[rel] ? '' : ' ' : '',
          (items && items.logs && items.logs.files || []).length,
          (items && items.config && items.config.files || []).length,
          '',
          '',
        ];
        return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
          React.createElement('div', { className: 'dxb-row' },
            React.createElement('div', { style: { flex: 1, minWidth: '260px' } },
              React.createElement('label', null, C.topicLabel),
              React.createElement('input', { className: 'dxb-input', value: st.topic, placeholder: C.topicPh, onChange: function (e) { setStore({ topic: e.target.value }); } })),
            React.createElement('div', { style: { flex: 1.4 } },
              React.createElement('label', null, C.keywordLabel),
              React.createElement('input', { className: 'dxb-input', value: st.keywords, placeholder: C.keywordPh, onChange: function (e) { setStore({ keywords: e.target.value }); } })),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'flex-end', paddingBottom: '2px' } },
              React.createElement('label', { style: { fontSize: '12px' } }, C.maskEmail, ' ', React.createElement('input', { type: 'checkbox', checked: st.maskEmail, onChange: function (e) { setStore({ maskEmail: e.target.checked }); } })),
              React.createElement('label', { style: { fontSize: '12px' } }, C.maskIpv4, ' ', React.createElement('input', { type: 'checkbox', checked: st.maskIpv4, onChange: function (e) { setStore({ maskIpv4: e.target.checked }); } })))),
          React.createElement('label', null, C.checksLabel),
          React.createElement('div', { className: 'dxb-row', style: { marginBottom: '8px' } },
            React.createElement('label', { className: 'dxb-check ' + (st.checks.env ? '' : 'dxb-check-off') },
              React.createElement('input', { type: 'checkbox', checked: st.checks.env, onChange: function () { toggleCheck('env'); } }), '环境信息'),
            React.createElement('label', { className: 'dxb-check ' + (st.checks.logs ? '' : 'dxb-check-off') },
              React.createElement('input', { type: 'checkbox', checked: st.checks.logs, onChange: function () { toggleCheck('logs'); } }), '运行日志（' + fileCounts[1] + '）'),
            React.createElement('label', { className: 'dxb-check ' + (st.checks.config ? '' : 'dxb-check-off') },
              React.createElement('input', { type: 'checkbox', checked: st.checks.config, onChange: function () { toggleCheck('config'); } }), '配置文件（' + fileCounts[2] + '）'),
            React.createElement('label', { className: 'dxb-check ' + (st.checks.system ? '' : 'dxb-check-off') },
              React.createElement('input', { type: 'checkbox', checked: st.checks.system, onChange: function () { toggleCheck('system'); } }), '系统状态'),
            React.createElement('label', { className: 'dxb-check ' + (st.checks.plugins ? '' : 'dxb-check-off') },
              React.createElement('input', { type: 'checkbox', checked: st.checks.plugins, onChange: function () { toggleCheck('plugins'); } }), '插件适配')),
          React.createElement('label', { className: 'dxb-llm-row' },
            React.createElement('input', { type: 'checkbox', checked: st.useLLM, onChange: function (e) { setStore({ useLLM: e.target.checked }); } }),
            React.createElement('span', null, C.llmLabel),
            React.createElement('span', { className: 'dxb-llm-hint' }, st.llmHasKey ? C.llmHint : C.llmNoKey)),
          React.createElement('div', { className: 'dxb-row', style: { margin: '2px 0 4px' } },
            React.createElement('button', { className: 'dxb-btn', style: { padding: '3px 10px', fontSize: '12px' }, onClick: function () { setStore({ aiSettingsOpen: !st.aiSettingsOpen }); } }, st.aiSettingsOpen ? C.aiSettingsHide : C.aiSettingsBtn),
            React.createElement('span', { style: { fontSize: '11.5px', color: '#8a94a6', alignSelf: 'center' } }, C.aiSettingsShort)),
          st.aiSettingsOpen ? React.createElement(LlmSettingsPanel, null) : null,
          React.createElement('label', { style: { marginTop: '4px' } }, C.summaryLabel),
          React.createElement('textarea', {
            className: 'dxb-summary-ta',
            placeholder: C.summaryPh,
            value: st.userSummary,
            maxLength: 20000,
            onChange: function (e) { setStore({ userSummary: e.target.value }); },
          }),
          React.createElement('div', { className: 'dxb-tabs' },
            C.tabs.map(function (t, i) {
              return React.createElement('button', {
                key: t, className: 'dxb-tab ' + (st.activeTab === i ? 'dxb-tab-on' : '') + (excludedTabs[i] ? ' dxb-tab-excluded' : ''),
                onClick: function () { setTab(i); },
              }, excludedTabs[i] ? t + '（' + C.excluded + '）' : t,
                (i === 1 || i === 2) && (st.patches[tabRels[i][0]] || []).length ? React.createElement('span', { className: 'dxb-dot' }, C.unsaved) : null);
            })),
          (function () {
            if (!rel) return React.createElement('div', { className: 'dxb-hint' }, '该分类没有可查看的文件。');
            var files = tabRels[st.activeTab];
            if (files.length > 1) {
              return React.createElement('div', null,
                React.createElement('div', { className: 'dxb-filebar' },
                  files.map(function (f) {
                    return React.createElement('button', {
                      key: f, className: 'dxb-filechip ' + (f === rel ? 'dxb-filechip-on' : ''),
                      onClick: function () { pickFile(st.activeTab, f); },
                    }, f.split('/').pop());
                  })),
                React.createElement(FileEditor, { rel: rel }));
            }
            return React.createElement(FileEditor, { rel: rel });
          })(),
          st.error ? React.createElement('div', { className: 'dxb-err', role: 'alert' }, st.error) : null);
      }

      function PreviewView() {
        var st = useStore();
        var pv = st.preview || {};
        var files = pv.files || [];
        var expandedState = React.useState({});
        var expanded = expandedState[0];
        var setExpanded = expandedState[1];
        function toggle(f) { var e = Object.assign({}, expanded, {}); e[f] = !e[f]; setExpanded(e); }
        function pack() {
          setStore({ phase: 'packing', error: '' });
          var minDelay = timerSvc.timeout(400);
          Promise.all([call('dxb:pack', { runId: st.runId }), minDelay]).then(function (rs) {
            setStore({ phase: 'success', result: rs[0] });
          }).catch(function (e) {
            setStore({ phase: 'failed', error: String((e && e.message) || e) });
          });
        }
        return React.createElement('div', null,
          React.createElement('div', { className: 'dxb-center', style: { height: 'auto', padding: '6px 0 12px' } },
            React.createElement('h3', { style: { margin: '0 0 4px', fontSize: '16px' } }, C.previewTitle),
            React.createElement('div', { className: 'dxb-status', role: 'status' }, C.previewTotal.replace('{n}', String(pv.totalHits || 0)))),
          (function () {
            var ai = pv.aiSummary;
            if (!ai || !ai.text) return null;
            var issues = ai.issues || [];
            return React.createElement('div', { className: 'dxb-ai' },
              React.createElement('div', { className: 'dxb-ai-head' },
                React.createElement('span', { className: 'dxb-ai-title' }, '🤖 ' + C.aiTitle),
                React.createElement('span', { className: 'dxb-ai-badge' }, issues.length ? C.aiIssues.replace('{n}', String(issues.length)) : C.aiNone)),
              React.createElement('ul', { className: 'dxb-ai-list' },
                issues.map(function (it, i) {
                  return React.createElement('li', { key: i },
                    React.createElement('div', null, React.createElement('b', null, it.label)),
                    React.createElement('div', { className: 'dxb-ai-ev' }, '证据：' + it.evidence),
                    React.createElement('div', { className: 'dxb-ai-ad' }, '建议：' + it.advice));
                })),
              React.createElement('div', null,
                React.createElement('button', { className: 'dxb-expand', onClick: function () { setStore({ aiOpen: !st.aiOpen }); } }, st.aiOpen ? C.aiCollapse : C.aiExpand),
                st.aiOpen ? React.createElement('pre', { className: 'dxb-ai-pre' }, ai.text) : null),
              React.createElement('div', { className: 'dxb-ai-foot' }, C.aiFooter));
          })(),
          (function () {
            var fixes = st.fixes || [];
            if (!fixes.length) return null;
            function runFix(f) {
              setStore({ busy: true });
              call('dxb:runFix', { runId: st.runId, fixId: f.id }).then(function (r) {
                var fr = Object.assign({}, st.fixResults, {});
                fr[f.id] = { ok: !!r.ok, exitCode: r.exitCode != null ? r.exitCode : 0, output: r.output || '' };
                setStore({ fixResults: fr, confirmFix: null, busy: false });
              }).catch(function (e) {
                setStore({ confirmFix: null, busy: false, error: String((e && e.message) || e) });
              });
            }
            return React.createElement('div', null,
              React.createElement('div', { className: 'dxb-ai-head', style: { marginTop: '10px' } },
                React.createElement('span', { className: 'dxb-ai-title' }, '🔧 ' + C.fixesTitle),
                React.createElement('span', { className: 'dxb-ai-badge' }, String(fixes.length))),
              React.createElement('div', { style: { fontSize: '11.5px', color: '#8a94a6', margin: '2px 0 4px' } }, C.fixesDesc),
              fixes.map(function (f) {
                var res = st.fixResults[f.id];
                var confirming = st.confirmFix === f.id;
                return React.createElement('div', { key: f.id, className: 'dxb-fix-card' },
                  React.createElement('div', null,
                    React.createElement('b', { style: { fontSize: '12.5px' } }, f.title || f.signal),
                    f.needRoot ? React.createElement('span', { className: 'dxb-pv-badge', style: { marginLeft: '6px' } }, C.fixNeedRoot) : null),
                  React.createElement('pre', { className: 'dxb-fix-cmd' }, f.command),
                  confirming ? React.createElement('div', { className: 'dxb-fix-confirm', role: 'alert' },
                    React.createElement('span', null, C.fixConfirm),
                    React.createElement('pre', { className: 'dxb-fix-cmd', style: { maxHeight: '120px' } }, f.command),
                    React.createElement('div', { className: 'dxb-row', style: { marginTop: '6px', justifyContent: 'flex-end' } },
                      React.createElement('button', { className: 'dxb-btn', style: { padding: '3px 10px', fontSize: '12px' }, onClick: function () { setStore({ confirmFix: null }); } }, C.fixCancel),
                      React.createElement('button', { className: 'dxb-btn dxb-btn-danger', style: { padding: '3px 10px', fontSize: '12px' }, onClick: function () { runFix(f); }, disabled: st.busy }, st.busy ? C.elevateBusy : C.fixRunOk)))
                  : React.createElement('button', { className: 'dxb-btn', style: { padding: '3px 10px', fontSize: '12px', marginTop: '6px' }, onClick: function () { setStore({ confirmFix: f.id }); } }, C.fixRun),
                  res ? React.createElement('div', { className: 'dxb-fix-result ' + (res.ok ? 'ok' : 'fail'), role: 'status' },
                    (res.ok ? C.fixResultOk : C.fixResultFail).replace('{code}', String(res.exitCode)),
                    res.output ? React.createElement('pre', { className: 'dxb-fix-cmd', style: { marginTop: '4px', maxHeight: '140px' } }, res.output) : null) : null);
              }));
          })(),
          React.createElement('div', null,
            files.map(function (f) {
              var isExp = !!expanded[f.rel];
              return React.createElement('div', { key: f.rel, className: 'dxb-pv-item' },
                React.createElement('div', { className: 'dxb-pv-head' },
                  React.createElement('span', { style: { fontFamily: 'ui-monospace,Consolas,monospace', fontSize: '12px', wordBreak: 'break-all' } }, f.rel),
                  React.createElement('span', { className: 'dxb-pv-badge' }, String(f.hits) + ' 处'),
                  React.createElement('span', { style: { marginLeft: 'auto', fontSize: '12px', color: '#8a94a6' } }, (f.bytes / 1024).toFixed(1) + ' KB')),
                f.samples && f.samples.length ? React.createElement(React.Fragment, null,
                  React.createElement('button', { className: 'dxb-expand', onClick: function () { toggle(f.rel); } }, isExp ? C.previewCollapse : C.previewExpand),
                  isExp ? f.samples.map(function (s, i) {
                    return React.createElement('div', { key: i, className: 'dxb-pv-sample' },
                      React.createElement('span', { style: { color: '#94a3b8' } }, '[' + s.key + '] '),
                      React.createElement('span', null, s.before),
                      React.createElement('div', null, '→ '),
                      React.createElement('span', { className: 'hl' }, s.after));
                  }) : null) : null);
            })),
          React.createElement('div', { className: 'dxb-foot', style: { border: 'none', padding: '14px 0 0' } },
            React.createElement('button', { className: 'dxb-btn', onClick: function () { setStore({ phase: 'review' }); } }, C.previewBack),
            React.createElement('button', { className: 'dxb-btn dxb-btn-primary', onClick: pack }, C.packBtn)));
      }

      function PackView() {
        return React.createElement('div', { className: 'dxb-center', role: 'status' },
          React.createElement('div', { className: 'dxb-spin' }),
          React.createElement('h3', { style: { margin: '0 0 4px', fontSize: '16px' } }, C.packing),
          React.createElement('div', { className: 'dxb-status' }, C.packingDesc));
      }

      function SuccessView() {
        var st = useStore();
        var r = st.result || {};
        var copiedState = React.useState(false);
        var copied = copiedState[0];
        var setCopied = copiedState[1];
        function copyPath() {
          var text = r.zipPath || '';
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
            else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
          } catch (e) {}
          setCopied(true);
          timerSvc.timeout(function () { setCopied(false); }, 1500);
        }
        function openFolder() {
          if (r && r.dir) { call('openFolder', { dir: r.dir }).catch(function () {}); }
        }
        var mail = st.supportEmail || C.supportPlaceholder;
        return React.createElement('div', { className: 'dxb-center', role: 'status' },
          React.createElement('div', { className: 'dxb-bigico' }, '\u2705'),
          React.createElement('h3', { style: { margin: '10px 0 4px', fontSize: '18px' } }, C.successTitle),
          React.createElement('div', { className: 'dxb-status' }, (r.fallbackUsed ? C.successFallback : C.successDesc).replace('{name}', r.filename || '')),
          React.createElement('div', { className: 'dxb-path' },
            React.createElement('span', { style: { wordBreak: 'break-all' } }, r.zipPath || ''),
            React.createElement('button', { className: 'dxb-btn', style: { padding: '4px 10px', fontSize: '12px', flexShrink: 0 }, onClick: copyPath }, copied ? C.copied : C.copy)),
          React.createElement('div', { className: 'dxb-row', style: { marginTop: '14px', justifyContent: 'center' } },
            React.createElement('button', { className: 'dxb-btn', onClick: openFolder }, C.open),
            React.createElement('a', { className: 'dxb-btn', href: 'mailto:' + mail + '?subject=' + encodeURIComponent('DSH 诊断包：' + (r.filename || '')) + '&body=' + encodeURIComponent(C.mail.replace('{email}', mail) + '\n附件文件：' + (r.filename || '')), style: { textDecoration: 'none', display: 'inline-flex', alignItems: 'center' } }, C.mailBtn),
            React.createElement('button', { className: 'dxb-btn', onClick: function () { setStore({ expert: !st.expert }); } }, st.expert ? C.expertOff : C.expert)),
          React.createElement('div', { className: 'dxb-mail' }, C.mail.replace('{email}', mail)),
          st.expert ? React.createElement(React.Fragment, null,
            React.createElement('div', { style: { fontSize: '12px', color: '#8a94a6', marginTop: '8px' } }, C.terminalCmd.replace('{path}', r.zipPath || '')),
            React.createElement('pre', { className: 'dxb-expert' }, C.manifestLabel + '\n\n' + JSON.stringify((r.manifest || {}), null, 2))) : null);
      }

      function FailedView() {
        var st = useStore();
        return React.createElement('div', { className: 'dxb-center', role: 'alert' },
          React.createElement('div', { className: 'dxb-bigico' }, '⚠️'),
          React.createElement('h3', { style: { margin: '10px 0 4px', fontSize: '18px' } }, C.failedTitle),
          React.createElement('div', { className: 'dxb-err', style: { maxWidth: '520px' } }, C.failedReason.replace('{reason}', st.error || '未知错误')),
          React.createElement('div', { className: 'dxb-row', style: { marginTop: '16px' } },
            React.createElement('button', { className: 'dxb-btn dxb-btn-primary', onClick: function () { openModal(st.sessionId); } }, C.retry),
            React.createElement('button', { className: 'dxb-btn', onClick: function () { doCleanup(); } }, C.close)));
      }

      function ConfirmView() {
        var st = useStore();
        return React.createElement('div', { className: 'dxb-center' },
          React.createElement('div', { className: 'dxb-confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'dxb-confirm-title' },
            React.createElement('h3', { id: 'dxb-confirm-title', style: { margin: '0 0 6px', fontSize: '15px' } }, C.confirmTitle),
            React.createElement('div', { style: { fontSize: '13px', color: '#5b6575' } }, C.confirmDesc),
            React.createElement('div', { className: 'dxb-row', style: { marginTop: '14px', justifyContent: 'flex-end' } },
              React.createElement('button', { className: 'dxb-btn', onClick: function () { setStore({ phase: st.lastPhase || 'review' }); } }, C.confirmKeep),
              React.createElement('button', { className: 'dxb-btn dxb-btn-danger', onClick: abortConfirmed }, C.confirmAbort))));
      }

      /* ---------- modal ---------- */
      function Modal() {
        var st = useStore();
        var ref = React.useRef(null);
        React.useEffect(function () {
          if (!st.open) return;
          var prev = document.activeElement;
          var el = ref.current;
          if (el) {
            var f = el.querySelector('button, input, textarea, a, [tabindex]');
            if (f) { try { f.focus(); } catch (e) {} }
          }
          function onKey(e) {
            if (e.key === 'Escape') { e.preventDefault(); requestCancel(); return; }
            if (e.key !== 'Tab' || !el) return;
            var f = el.querySelectorAll('button, input, textarea, a, [tabindex]:not([tabindex="-1"])');
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
          document.addEventListener('keydown', onKey, true);
          return function () {
            document.removeEventListener('keydown', onKey, true);
            if (prev && prev.focus) { try { prev.focus(); } catch (e) {} }
          };
        }, [st.open]);
        React.useEffect(function () {
          if (st.phase !== 'collecting' || !st.runId) return;
          var t = timerSvc.interval(function () {
            call('dxb:status', { runId: store.runId }).then(function (s) {
              if (!s) return;
              if (s.phase === 'collecting') {
                setStore({ items: s.items });
                return;
              }
              try { t(); } catch (e) {}
              if (s.needsElevation) setStore({ phase: 'elevation', countdown: 30, items: s.items });
              else if (s.phase === 'ready') {
                setStore({ phase: 'review', items: s.items, topicDefault: s.topicDefault || store.topicDefault, topic: store.topic || s.topicDefault || '', errCtx: s.errCtx || store.errCtx });
              } else if (s.phase === 'failed') {
                setStore({ phase: 'failed', error: s.error || '采集失败' });
              } else {
                try { t(); } catch (e) {}
              }
            }).catch(function (e) {
              // 轮询失败：停止轮询并明确报错，绝不无限转圈
              try { t(); } catch (x) {}
              setStore({ phase: 'failed', error: String((e && e.message) || e) || '无法获取采集状态' });
            });
          }, 400);
          return function () { try { t(); } catch (e) {} };
        }, [st.phase, st.runId]);
        if (!st.open) return null;
        var view = null;
        if (st.phase === 'collecting') view = React.createElement(CollectView, null);
        else if (st.phase === 'review') view = React.createElement(ReviewView, null);
        else if (st.phase === 'previewing') view = React.createElement('div', { className: 'dxb-center', role: 'status' },
          React.createElement('div', { className: 'dxb-spin' }),
          React.createElement('h3', { style: { margin: '0 0 4px', fontSize: '16px' } }, C.previewing),
          React.createElement('div', { className: 'dxb-status' }, st.useLLM ? C.previewingLLM : C.packingDesc));
        else if (st.phase === 'preview') view = React.createElement(PreviewView, null);
        else if (st.phase === 'packing') view = React.createElement(PackView, null);
        else if (st.phase === 'success') view = React.createElement(SuccessView, null);
        else if (st.phase === 'failed') view = React.createElement(FailedView, null);
        else if (st.phase === 'confirm') view = React.createElement(ConfirmView, null);
        else return null;
        var foot = null;
        if (st.phase === 'review' || st.phase === 'preview') {
          foot = React.createElement('div', { className: 'dxb-foot' },
            st.phase === 'review' ? React.createElement('button', { className: 'dxb-btn dxb-btn-primary', onClick: function () {
              setStore({ phase: 'previewing', error: '' });
              call('dxb:preview', {
                runId: st.runId, checks: st.checks, keywords: store.keywords,
                masks: { email: st.maskEmail, ipv4: st.maskIpv4 }, patches: st.patches, topic: st.topic,
                browserErrors: store.browserErrors.slice(-20),
              }).then(function (r) { setStore({ phase: 'preview', preview: r, topic: r.topic || st.topic }); })
                .catch(function (e) { setStore({ phase: 'failed', error: String((e && e.message) || e) }); });
            } }, C.previewBtn) : null,
            React.createElement('button', { className: 'dxb-btn', onClick: requestCancel }, C.cancelBtn));
        }
        return React.createElement('div', null,
          React.createElement('div', { className: 'dxb-overlay' },
            React.createElement('div', { ref: ref, className: 'dxb-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dxb-title' },
              React.createElement('div', { className: 'dxb-head' },
                React.createElement('div', null,
                  React.createElement('h2', { id: 'dxb-title' }, C.title),
                  React.createElement('p', null, C.subtitle + (st.errCtx && st.errCtx.hasError ? ' — ' + C.errHint : ''))),
                React.createElement('button', { className: 'dxb-close', 'aria-label': C.cancelBtn, onClick: requestCancel }, '×')),
              React.createElement('div', { className: 'dxb-body' }, view),
              foot)));
      }

      /* ---------- 浏览器错误捕获（1.3.2，随包提交，供辅助排查前端问题） ---------- */
      var pushBrowserError = function (type, message, stack) {
        var arr = store.browserErrors || [];
        arr.push({ time: new Date().toISOString(), type: type, message: String(message || '').slice(0, 500), stack: String(stack || '').split('\n')[0].slice(0, 200) });
        if (arr.length > 20) arr.splice(0, arr.length - 20);
        store.browserErrors = arr;
      };
      var onWinErr = function (ev) {
        try { pushBrowserError('error', (ev && ev.message) || 'window error', (ev && ev.error && ev.error.stack) || ''); } catch (e) {}
      };
      var onWinRej = function (ev) {
        try {
          var r = ev && ev.reason;
          pushBrowserError('unhandledrejection', (r && (r.message || r.toString())) || 'unhandled rejection', (r && r.stack) || '');
        } catch (e) {}
      };
      window.addEventListener('error', onWinErr);
      window.addEventListener('unhandledrejection', onWinRej);
      ctx.effect(function () {
        return function () {
          window.removeEventListener('error', onWinErr);
          window.removeEventListener('unhandledrejection', onWinRej);
        };
      });

      /* ---------- slots ---------- */
      slots.inject('shell.overlay', function () {
        return slots.register({ name: 'shell.overlay', id: 'dsh-bundle2-modal', order: 100 }, function () {
          return React.createElement(Modal, null);
        });
      });
      slots.inject('conversation.session.header.actions', function () {
        return slots.register({ name: 'conversation.session.header.actions', id: 'dsh-bundle2-trigger', order: 30, label: function () { return C.trigger; } }, function (props) {
          return React.createElement(TriggerBtn, { sessionId: props && props.sessionId });
        });
      });
      slots.inject('conversation.input.right', function () {
        return slots.register({ name: 'conversation.input.right', id: 'dsh-bundle2-input', order: 50, label: function () { return C.inputBtn; } }, function (props) {
          return React.createElement(InputBtn, { sessionId: props && props.sessionId });
        });
      });

    }
      module.exports = { apply: apply, inject: ['slots'] };
      return module.exports;
    },
  });
})();
