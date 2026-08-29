'use strict';
/* dsh-diagnostic-bundle helper: runs in real Node (spawned by the plugin host).
   Reads command + JSON args from process.argv, prints ONE JSON line to stdout.
   Whitelist-only read commands; 15s per-command timeout; never blocks others. */
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { Worker } = require('worker_threads');

const DSH_LOG_ROOT = path.join(os.homedir(), '.dsh', 'logs');
const DSH_CFG_ROOT = path.join(os.homedir(), '.dsh');
const CFG_WHITELIST = [
  'settings.yaml', 'settings.yaml.bak', 'settings.json', 'settings.yml',
  'config.yaml', 'config.yml', 'config.json',
];
const CFG_EXCLUDE = /credential|secret|\.env/i;

/* 运行期可配置参数（由 host 经 collect argv 注入；命令白名单本身不可配置） */
const CFG = {
  dshHome: DSH_CFG_ROOT,
  logMaxBytes: 10 * 1024 * 1024,
  logMaxLines: 50000,
  configMaxBytes: 2 * 1024 * 1024,
  perItemTimeoutMs: 15000,
  processTopN: 50,
  elevatedTimeoutMs: 30000,
};

function now() {
  const d = new Date();
  const p = (n, w) => String(n).padStart(w || 2, '0');
  return {
    iso: d.toISOString(),
    local: p(d.getFullYear()) + p(d.getMonth() + 1) + p(d.getDate()) +
      p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()),
    timezone: (function () {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch (e) { return null; }
    })(),
  };
}

function runCmd(cmd, args, timeoutMs, opts) {
  return new Promise((resolve) => {
    const options = Object.assign({
      timeout: timeoutMs || CFG.perItemTimeoutMs,
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
    }, opts || {});
    if (cmd === 'free' || cmd === 'df') options.env = Object.assign({}, options.env, LANG_ENV);
    execFile(cmd, args || [], options, (err, stdout) => {
      if (err) {
        const msg = String(err.message || err);
        resolve({
          ok: false,
          perm: /EACCES|EPERM|permission denied/i.test(msg),
          reason: msg.slice(0, 200),
        });
      } else {
        resolve({ ok: true, out: String(stdout) });
      }
    });
  });
}

/* ---------- collectors ---------- */

async function collectEnvironment() {
  const osInfo = {
    name: os.type(),
    version: os.release(),
    arch: os.arch(),
    platform: process.platform,
  };
  const uname = await runCmd('uname', ['-a'], 5000);
  if (uname.ok) osInfo.kernel = uname.out.trim().slice(0, 500);
  const node = await runCmd('node', ['-v'], 5000);
  const py = await runCmd('python3', ['--version'], 5000);
  const runtimes = {
    node: node.ok ? node.out.trim() : null,
    python: py.ok ? py.out.trim().replace(/^Python\s+/i, '') : null,
  };
  let harnessVersion = null;
  try {
    const prefix = path.dirname(path.dirname(process.execPath));
    const pkgPath = require.resolve('@deepseek-ai/dsh/package.json', {
      paths: [path.join(prefix, 'lib', 'node_modules'), process.cwd()],
    });
    harnessVersion = require(pkgPath).version || null;
  } catch (e) { harnessVersion = null; }
  let gpu = null;
  if (process.platform === 'linux') {
    const g = await runCmd('nvidia-smi', ['--query-gpu=name,driver_version,memory.total', '--format=csv,noheader'], 10000);
    if (g.ok && g.out.trim()) {
      gpu = g.out.trim().split('\n').filter(Boolean).map((line) => {
        const parts = line.split(',').map((s) => s.trim());
        return { name: parts[0] || null, driver: parts[1] || null, vramTotalMB: parts[2] ? parseInt(parts[2], 10) || null : null };
      });
    }
  } else if (process.platform === 'darwin') {
    const g = await runCmd('system_profiler', ['SPDisplaysDataType'], 15000);
    if (g.ok) gpu = [{ raw: g.out.trim().slice(0, 2000) }];
  }
  return {
    status: 'ok',
    data: {
      os: osInfo,
      runtimes,
      harness: { version: harnessVersion, locale: process.env.LC_ALL || process.env.LANG || 'zh-CN', timezone: now().timezone },
      gpu,
      memoryTotalMB: Math.round(os.totalmem() / 1048576),
      user: os.userInfo().username,
      hostname: os.hostname(),
    },
  };
}

function tailLines(text, maxLines) {
  if (maxLines <= 0) return { body: '', dropped: text ? text.split('\n').length : 0 };
  const lines = text.split('\n');
  if (lines.length <= maxLines) return { body: text, dropped: 0 };
  return { body: lines.slice(lines.length - maxLines).join('\n'), dropped: lines.length - maxLines };
}

function walkLogFiles(dir, depth) {
  const out = [];
  if (depth > 4 || !fs.existsSync(dir)) return out;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const ent of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push.apply(out, walkLogFiles(full, depth + 1));
    else if (ent.isFile() && /\.log(\.\d+)?$/i.test(ent.name)) out.push(full);
  }
  return out;
}

function collectLogs(destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const files = [];
  const seen = {};
  for (const root of [path.join(CFG.dshHome, "logs"), CFG.dshHome]) {
    for (const full of walkLogFiles(root, 0)) {
      if (seen[full]) continue;
      seen[full] = true;
      files.push(full);
    }
  }
  const collected = [];
  let failed = 0;
  for (const full of files) {
    try {
      const st = fs.statSync(full);
      if (!st.isFile()) continue;
      let rel = path.relative(path.join(CFG.dshHome, "logs"), full);
      if (rel.indexOf('..') === 0) rel = path.basename(full);
      const destName = rel.replace(/[\/\\]/g, '__');
      const dest = path.join(destDir, destName);
      if (st.size > CFG.logMaxBytes) {
        const fd = fs.openSync(full, 'r');
        const buf = Buffer.alloc(CFG.logMaxBytes);
        const n = fs.readSync(fd, buf, 0, CFG.logMaxBytes, Math.max(0, st.size - CFG.logMaxBytes));
        fs.closeSync(fd);
        let txt = buf.toString('utf8', 0, n);
        const t = tailLines(txt, CFG.logMaxLines);
        txt = '# [前 ' + t.dropped + ' 行已被截断]\n' + t.body;
        fs.writeFileSync(dest, txt, { mode: 0o600 });
        collected.push({ rel: 'logs/' + destName, bytes: Buffer.byteLength(txt), lines: txt.split('\n').length, truncated: true });
      } else {
        const contentRaw = fs.readFileSync(full, 'utf8');
        const t = tailLines(contentRaw, CFG.logMaxLines);
        if (t.dropped > 0) {
          const txt = '# [前 ' + t.dropped + ' 行已被截断]\n' + t.body;
          fs.writeFileSync(dest, txt, { mode: 0o600 });
          collected.push({ rel: 'logs/' + destName, bytes: Buffer.byteLength(txt), lines: txt.split('\n').length, truncated: true });
        } else {
          fs.copyFileSync(full, dest);
          fs.chmodSync(dest, 0o600);
          collected.push({ rel: 'logs/' + destName, bytes: st.size, lines: contentRaw.split('\n').length, truncated: false });
        }
      }
    } catch (e) { failed++; }
  }
  if (collected.length === 0) {
    const dest = path.join(destDir, 'NO-LOGS.txt');
    fs.writeFileSync(dest, '未找到可收集的日志文件。\nNo log files were found.\n', { mode: 0o600 });
    return { status: 'missing', files: [{ rel: 'logs/NO-LOGS.txt', bytes: 60, lines: 2, truncated: false }] };
  }
  return { status: 'ok', files: collected, failed };
}

function collectConfig(destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const collected = [];
  let skipped = 0;
  for (const name of CFG_WHITELIST) {
    const full = path.join(CFG.dshHome, name);
    if (!fs.existsSync(full)) continue;
    if (CFG_EXCLUDE.test(name)) { skipped++; continue; }
    try {
      const st = fs.statSync(full);
      if (st.size > CFG.configMaxBytes) { skipped++; continue; }
      const content = fs.readFileSync(full, 'utf8');
      const dest = path.join(destDir, name);
      fs.writeFileSync(dest, content, { mode: 0o600 });
      collected.push({ rel: 'config/' + name, bytes: st.size, lines: content.split('\n').length });
    } catch (e) { skipped++; }
  }
  return { status: collected.length ? 'ok' : 'missing', files: collected, skipped };
}

function configSummary() {
  // settings.yaml 扁平化脱敏摘要（config-summary.json 进包但仅含脱敏标量）
  const SENS = /api[_-]?key|access[_-]?key|secret|token|password|passwd|pwd|authorization|bearer|credential|private[_-]?key|ssh[_-]?key|proxy/i;
  try {
    const full = path.join(CFG.dshHome, 'settings.yaml');
    if (!fs.existsSync(full)) return null;
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    const stack = []; // {indent, key}
    const entries = [];
    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const indent = line.length - line.trimStart().length;
      const content = line.trim();
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      const m = content.match(/^([A-Za-z0-9_.\-]+)\s*:\s*(.*)$/);
      const isList = content.startsWith('- ');
      if (isList) {
        const item = content.slice(2).trim();
        if (item && !item.includes(':')) {
          const key = (stack.map((x) => x.key).concat('[list]')).join('.');
          entries.push({ key, value: item.slice(0, 200), redacted: false });
        }
        continue;
      }
      if (!m) continue;
      const key = m[1];
      let value = m[2].trim();
      const keyPath = stack.map((x) => x.key).concat(key).join('.');
      if (!value) { // 子对象开始
        stack.push({ indent, key });
        continue;
      }
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      let redacted = false;
      if (SENS.test(keyPath) || /\bsk-[A-Za-z0-9_\-]{8,}\b/.test(value)) { value = '***'; redacted = true; }
      entries.push({ key: keyPath, value: value.slice(0, 200), redacted });
      if (entries.length >= 300) break;
      stack.push({ indent, key });
    }
    return { source: 'settings.yaml', entries };
  } catch (e) {
    return { source: 'settings.yaml', error: String(e).slice(0, 120) };
  }
}

function collectPlugins() {
  // 插件适配原始数据：profile 声明的 bundles/dependencies 与 node_modules 实际状态的对照
  try {
    const profileDir = path.join(os.homedir(), '.dsh', 'profiles', 'web');
    const pjPath = path.join(profileDir, 'package.json');
    if (!fs.existsSync(pjPath)) return { status: 'missing', reason: 'profile package.json not found' };
    const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
    const deps = (pj.dependencies && typeof pj.dependencies === 'object') ? pj.dependencies : {};
    const bundles = (pj.dsh && pj.dsh.profile && Array.isArray(pj.dsh.profile.bundles)) ? pj.dsh.profile.bundles : [];
    const plugins = [];
    const seen = {};
    for (const name of bundles) {
      if (seen[name]) continue;
      seen[name] = true;
      const declared = deps[name] || null;
      const nmDir = path.join(profileDir, 'node_modules', name);
      const pkgPath = path.join(nmDir, 'package.json');
      const rec = { name, declaredVersion: declared, installedVersion: null, inNodeModules: false, builtin: false, packageJsonOk: false, entry: null, entryExists: false, depsMissing: [], sizeKB: null };
      if (!fs.existsSync(pkgPath)) {
        // 不在 profile node_modules：若是 @deepseek-ai/* 且未声明为依赖 → 宿主内置
        if (/^@deepseek-ai\//.test(name) && !declared) {
          rec.builtin = true;
          rec.installedVersion = '(host builtin)';
        } else {
          rec.problems = [{ type: 'module_missing', detail: 'node_modules/' + name + '/package.json 不存在（依赖未安装或安装失败）' }];
        }
        plugins.push(rec);
        continue;
      }
      rec.inNodeModules = true;
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        rec.packageJsonOk = true;
        rec.installedVersion = pkg.version || '(no version)';
        rec.entry = pkg.main || (pkg.exports && typeof pkg.exports === 'object' && typeof pkg.exports['.'] === 'string' ? pkg.exports['.'] : null) || 'index.js';
        rec.entryExists = fs.existsSync(path.join(nmDir, rec.entry));
        try { rec.sizeKB = Math.round(require('fs').statSync(nmDir).size / 1024) || null; } catch (e) {}
        // 自身 dependencies 缺失检查（只查直接依赖的顶层缺失）
        const ownDeps = (pkg.dependencies && typeof pkg.dependencies === 'object') ? Object.keys(pkg.dependencies) : [];
        for (const d of ownDeps) {
          const dp = path.join(profileDir, 'node_modules', d);
          if (!fs.existsSync(dp)) {
            let resolvedElsewhere = false;
            try {
              resolvedElsewhere = !!(require.resolve(d + '/package.json', { paths: [nmDir] }));
            } catch (e) { resolvedElsewhere = false; }
            if (!resolvedElsewhere) rec.depsMissing.push(d);
          }
        }
      } catch (e) {
        rec.problems = [{ type: 'package_json_broken', detail: 'package.json 解析失败：' + String(e.message || e).slice(0, 120) }];
      }
      plugins.push(rec);
    }
    return { status: 'ok', profileDir, bundlesDeclared: bundles.length, plugins };
  } catch (e) {
    return { status: 'failed', reason: String(e.message || e).slice(0, 200) };
  }
}

function parsePs(out) {
  const rows = [];
  const lines = out.trim().split('\n');
  for (let i = 1; i < lines.length && rows.length < CFG.processTopN; i++) {
    const m = lines[i].trim().split(/\s+/);
    if (m.length >= 4) {
      rows.push({ pid: parseInt(m[0], 10) || 0, name: m[1], cpu: parseFloat(m[2]) || 0, mem: parseFloat(m[3]) || 0 });
    }
  }
  return rows;
}

function parseSs(out) {
  const rows = [];
  for (const line of out.split('\n')) {
    if (!/LISTEN/.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    let local = null; let port = null;
    if (parts.length >= 5) {
      local = parts[3];
      const idx = local.lastIndexOf(':');
      if (idx >= 0) { port = local.slice(idx + 1); local = local.slice(0, idx); }
    }
    const procM = line.match(/users:\(\("([^"]+)"(?:,pid=(\d+))?/);
    rows.push({
      proto: parts[0] === 'tcp6' ? 'tcp6' : 'tcp',
      local, port, pid: procM ? (parseInt(procM[2], 10) || null) : null, proc: procM ? procM[1] : null,
    });
  }
  return rows;
}

function parseFree(out) {
  const res = { totalMB: null, usedMB: null, availableMB: null, swapUsedMB: null };
  for (const line of out.split('\n')) {
    const m = line.match(/^Mem:\s+(\d+)\s+(\d+)\s+(\d+)/);
    if (m) { res.totalMB = parseInt(m[1], 10); res.usedMB = parseInt(m[2], 10); res.availableMB = parseInt(m[3], 10); }
    const s = line.match(/^Swap:\s+(\d+)\s+(\d+)/);
    if (s) res.swapUsedMB = parseInt(s[2], 10);
  }
  return res;
}

function parseDf(out) {
  const rows = [];
  for (const line of out.trim().split('\n').slice(1)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;
    rows.push({ fs: parts[0], size: parts[1], used: parts[2], avail: parts[3], usePct: parts[4], mount: parts.slice(5).join(' ') });
  }
  return rows;
}

const LANG_ENV = Object.assign({}, process.env, { LC_ALL: 'C', LANG: 'C' });
const SYSTEM_CMDS = {
  processes: { cmd: 'ps', args: ['-eo', 'pid,comm,%cpu,%mem', '--sort=-%cpu'], parse: parsePs },
  ports: { cmd: 'ss', args: ['-tlnp'], parse: parseSs },
  memory: { cmd: 'free', args: ['-m'], parse: parseFree, env: LANG_ENV },
  gpu: { cmd: 'nvidia-smi', args: ['--query-gpu=utilization.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'], parse: (o) => o.trim().split('\n').filter(Boolean).map((l, i) => { const p = l.split(',').map((s) => s.trim()); return { index: i, utilPct: parseFloat(p[0]) || 0, vramUsedMB: parseFloat(p[1]) || 0, vramTotalMB: parseFloat(p[2]) || 0 }; }) },
  disk: { cmd: 'df', args: ['-h'], parse: parseDf, env: LANG_ENV },
  self: { cmd: 'ps', args: ['-p', String(process.ppid), '-o', 'pid,comm,%cpu,%mem,etime'], parse: (o) => { const lines = o.trim().split('\n'); if (lines.length < 2) return null; const m = lines[1].trim().split(/\s+/); return { pid: process.ppid, name: m[1] || null, cpuPct: parseFloat(m[2]) || 0, memPct: parseFloat(m[3]) || 0, elapsed: m[4] || null, rssMB: Math.round(process.memoryUsage.rss ? process.memoryUsage().rss / 1048576 : 0) }; } },
};

async function collectSystem(elevated, password, netUrls) {
  const data = {};
  // plugins：Harness 插件/包版本（供 LLM 判断插件不适配）
  try {
    const profileDir = path.join(os.homedir(), '.dsh', 'profiles', 'web');
    const pjPath = path.join(profileDir, 'package.json');
    if (fs.existsSync(pjPath)) {
      const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
      data.plugins = { bundles: (pj.dsh && pj.dsh.profile && pj.dsh.profile.bundles) || [], dependencies: pj.dependencies || {} };
    } else {
      data.plugins = { bundles: [], dependencies: {} };
    }
  } catch (e) {
    data.plugins = { bundles: [], dependencies: {}, error: String(e).slice(0, 120) };
  }
  // limits：进程/系统资源边界（OOM/句柄泄漏类问题主因）
  try {
    const limits = { fds: null, rlimits: null, cgroup: null, inodes: null };
    try {
      const l = fs.readFileSync('/proc/self/limits', 'utf8');
      const rows = {};
      l.split('\n').forEach((line) => {
        const m = line.trim().match(/^(.+?)\s+(\S+)\s+(\S+)\s+\S+$/);
        if (m && m[1] !== 'Limit') rows[m[1]] = m[2] === 'unlimited' ? 'unlimited' : m[2];
      });
      limits.rlimits = { 'Max open files': rows['Max open files'] || null, 'Max processes': rows['Max processes'] || null, 'Max locked memory': rows['Max locked memory'] || null, 'Max address space': rows['Max address space'] || null };
    } catch (e) {}
    try {
      const fdDir = '/proc/' + process.ppid + '/fd';
      limits.fds = fs.readdirSync(fdDir).length;
    } catch (e) {}
    try {
      const cg = fs.readFileSync('/proc/self/cgroup', 'utf8').trim();
      limits.cgroup = cg.split('\n').pop() || cg;
      try { const mm = fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim(); if (mm && mm !== 'max') limits.memoryMax = mm; } catch (e) {}
    } catch (e) {}
    const di = await runCmd('df', ['-i'], CFG.perItemTimeoutMs);
    if (di.ok) {
      limits.inodes = di.out.split('\n').slice(0, 8).map((row) => row.trim().split(/\s+/).slice(0, 6).join(' ')).filter(Boolean);
    }
    data.limits = limits;
  } catch (e) {
    data.limits = { error: String(e).slice(0, 120) };
  }

  // net：出站连通性主动探测（URL 由宿主传参，限 http(s)，长度受限）
  const net = [];
  const urls = Array.isArray(netUrls) ? netUrls.slice(0, 6) : [];
  for (const raw of urls) {
    const u = String(raw || '').trim().slice(0, 200);
    if (!/^https?:\/\//i.test(u)) continue;
    const r = await runCmd('curl', ['-sS', '-m', '6', '-o', '/dev/null', '-w', '%{http_code} %{time_total} %{time_namelookup} %{time_connect} %{time_appconnect}', u], 10000);
    if (r.ok) {
      const parts = String(r.out).trim().split(/\s+/);
      net.push({ url: u, httpCode: parts[0] === '000' ? null : parseInt(parts[0], 10) || null, timeTotalS: parseFloat(parts[1]) || null, dnsS: parseFloat(parts[2]) || null, connectS: parseFloat(parts[3]) || null, tlsS: parseFloat(parts[4]) || null });
    } else {
      net.push({ url: u, error: String(r.reason || r.message || 'unreachable').slice(0, 120) });
    }
  }
  const proxyNote = {};
  for (const k of ['http_proxy', 'https_proxy', 'no_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY']) {
    const v = process.env[k];
    if (v) {
      try { const pu = new URL(v); proxyNote[k] = pu.protocol + '//' + pu.host + (pu.port ? ':' + pu.port : ''); }
      catch (e) { proxyNote[k] = '***'; }
    }
  }
  data.net = { probes: net, proxies: proxyNote };
  const skipped = [];
  const permissionFailed = [];
  const pending = [];
  for (const id of Object.keys(SYSTEM_CMDS)) {
    pending.push((async () => {
      if (elevated && elevated.length && elevated.indexOf(id) < 0) return;
      const spec = SYSTEM_CMDS[id];
      let r = await runCmd(spec.cmd, spec.args, CFG.perItemTimeoutMs);
      if (!r.ok && r.perm && !elevated) { permissionFailed.push(id); return; }
      if (!r.ok && r.perm && elevated) {
        const pw = password || '';
        r = await runCmd('sudo', ['-S', '-p', '', spec.cmd].concat(spec.args), CFG.elevatedTimeoutMs, { input: pw });
        if (!r.ok) { skipped.push({ id, reason: r.reason }); return; }
      }
      if (!r.ok) { skipped.push({ id, reason: r.reason || 'command failed' }); return; }
      try { data[id] = spec.parse(r.out); } catch (e) { skipped.push({ id, reason: 'parse failed' }); }
    })());
  }
  await Promise.all(pending);
  return { data, skipped, permissionFailed };
}

/* ---------- LLM 调用（发送前脱敏，密钥仅内存） ---------- */
const LLM_MASK_RE = [
  { re: /\bsk-[A-Za-z0-9_\-]{8,}\b/g, to: 'sk-***' },
  { re: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g, to: '***@***' },
  { re: /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g, to: '***' },
];
function maskText(text) {
  let t = String(text || '');
  for (const m of LLM_MASK_RE) t = t.replace(m.re, m.to);
  return t;
}
async function callLLM(payload, baseUrl, model, apiKey, timeoutMs) {
  const url = String(baseUrl || '').replace(/\/$/, '') + '/chat/completions';
  if (!/^https?:\/\//i.test(url)) throw new Error('invalid LLM endpoint');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs || 45000);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: model,
        messages: payload.messages,
        temperature: payload.temperature != null ? payload.temperature : 0.3,
        max_tokens: payload.max_tokens != null ? payload.max_tokens : 1500,
      }),
      signal: controller.signal,
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = (body && (body.error && (body.error.message || body.error.code))) || ('HTTP ' + resp.status);
      throw new Error('LLM API error: ' + String(msg).slice(0, 300));
    }
    const text = body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content;
    if (!text) throw new Error('LLM empty response');
    return { text: String(text), model: body.model || model, usage: body.usage || null };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- redaction (worker) ---------- */

function redactPayload(payload) {
  return new Promise((resolve, reject) => {
    const workerPath = payload.workerPath;
    const w = new Worker(workerPath, { workerData: payload });
    w.once('message', (msg) => {
      if (msg && msg.ok === false) reject(new Error(msg.error || 'redact worker failed'));
      else resolve(msg);
    });
    w.once('error', (e) => reject(e));
    w.once('exit', (code) => { if (code !== 0) reject(new Error('redact worker exited ' + code)); });
  });
}

/* ---------- zip writer (pure JS, deflate, UTF-8 names) ---------- */

const CRC_TABLE = (function () {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeZip(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, 'utf8');
    const data = e.data;
    const crc = crc32(data);
    const comp = zlib.deflateRawSync(data, { level: 6 });
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
    parts.push(lh, nameBuf, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push({ buf: ch, name: nameBuf });
    offset += lh.length + nameBuf.length + comp.length;
  }
  const cdStart = offset;
  const cdParts = [];
  let cdSize = 0;
  for (const c of central) { cdParts.push(c.buf, c.name); cdSize += c.buf.length + c.name.length; }
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(central.length, 8); eocd.writeUInt16LE(central.length, 10);
  eocd.writeUInt32LE(cdSize, 12); eocd.writeUInt32LE(cdStart, 16);
  return Buffer.concat([].concat(parts, cdParts, [eocd]));
}

function walkDir(dir, base, out) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
    const full = path.join(dir, ent);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkDir(full, base, out);
    else if (st.isFile()) out.push({ name: path.relative(base, full).split(path.sep).join('/'), full });
  }
}

/* ---------- desktop resolution ---------- */

async function resolveDesktop() {
  const home = os.homedir();
  let dir = null;
  if (process.platform === 'win32') {
    dir = path.join(process.env.USERPROFILE || home, 'Desktop');
  } else if (process.platform === 'darwin') {
    dir = path.join(home, 'Desktop');
  } else {
    const r = await runCmd('xdg-user-dir', ['DESKTOP'], 3000);
    if (r.ok && r.out.trim() && r.out.trim() !== '/') dir = r.out.trim().split('\n')[0];
    if (!dir || !fs.existsSync(dir)) dir = path.join(home, 'Desktop');
  }
  if (dir && fs.existsSync(dir)) return { dir, fallbackUsed: false };
  let dl = null;
  if (process.platform !== 'win32') {
    const r = await runCmd('xdg-user-dir', ['DOWNLOAD'], 3000);
    if (r.ok && r.out.trim()) dl = r.out.trim();
  }
  if (!dl) dl = process.platform === 'win32' ? path.join(process.env.USERPROFILE || home, 'Downloads') : path.join(home, 'Downloads');
  try { fs.mkdirSync(dl, { recursive: true }); } catch (e) { dl = os.tmpdir(); }
  return { dir: dl, fallbackUsed: true };
}

/* ---------- commands ---------- */

function readJsonArg(idx) {
  if (idx >= process.argv.length) return null;
  try { return JSON.parse(process.argv[idx]); } catch (e) { return null; }
}

async function main() {
  const cmd = process.argv[2];
  const out = { ok: true };
  try {
    if (cmd === 'init') {
      const staging = process.argv[3];
      fs.mkdirSync(path.join(staging, 'originals'), { recursive: true, mode: 0o700 });
      fs.mkdirSync(path.join(staging, 'final'), { recursive: true, mode: 0o700 });
      const desk = await resolveDesktop();
      out.staging = staging;
      out.desktop = desk;
      out.now = now();
    } else if (cmd === 'collect') {
      const staging = process.argv[3];
      // 配置注入（host → helper）：{elevated:[ids], timeoutMs, processTopN, logMaxBytes, ...}；兼容旧格式（数组=仅 elevated）
      let args4 = {};
      try {
        const raw = JSON.parse(process.argv[4] || '{}');
        if (Array.isArray(raw)) args4 = { elevated: raw };
        else args4 = raw || {};
        if (!Array.isArray(args4.netUrls)) args4.netUrls = [];
      } catch (e) { args4 = {}; }
      const elevated = Array.isArray(args4.elevated) ? args4.elevated : [];
      if (typeof args4.timeoutMs === 'number') CFG.perItemTimeoutMs = args4.timeoutMs;
      if (typeof args4.elevatedTimeoutMs === 'number') CFG.elevatedTimeoutMs = args4.elevatedTimeoutMs;
      if (typeof args4.processTopN === 'number') CFG.processTopN = args4.processTopN;
      if (typeof args4.logMaxBytes === 'number') CFG.logMaxBytes = args4.logMaxBytes;
      if (typeof args4.logMaxLines === 'number') CFG.logMaxLines = args4.logMaxLines;
      if (typeof args4.configMaxBytes === 'number') CFG.configMaxBytes = args4.configMaxBytes;
      if (typeof args4.dshHome === 'string' && args4.dshHome) CFG.dshHome = args4.dshHome;
      let password = '';
      if (elevated.length) {
        try { password = fs.readFileSync(0, 'utf8'); } catch (e) { password = ''; }
      }
      out.now = now();
      out.env = await collectEnvironment();
      try { fs.writeFileSync(path.join(staging, 'originals', 'environment.json'), JSON.stringify(out.env.data || out.env, null, 2), { mode: 0o600 }); } catch (e) {}
      out.logs = collectLogs(path.join(staging, 'originals', 'logs'));
      out.config = collectConfig(path.join(staging, 'originals', 'config'));
      try {
        const cs = configSummary();
        if (cs && cs.entries && cs.entries.length) {
          fs.writeFileSync(path.join(staging, 'originals', 'config', 'config-summary.json'), JSON.stringify(cs, null, 2), { mode: 0o600 });
          out.config.summary = { entries: cs.entries.length };
        }
      } catch (e) {}
      try {
        const pl = collectPlugins();
        fs.writeFileSync(path.join(staging, 'originals', 'plugins.json'), JSON.stringify(pl, null, 2), { mode: 0o600 });
        out.plugins = { status: pl.status, count: pl.plugins ? pl.plugins.length : 0 };
      } catch (e) {}
      const sys = await collectSystem(elevated, password, args4.netUrls);
      out.system = { status: 'partial', data: sys.data, skipped: sys.skipped, permissionFailed: sys.permissionFailed };
      try { fs.writeFileSync(path.join(staging, 'originals', 'system.json'), JSON.stringify(sys.data || sys, null, 2), { mode: 0o600 }); } catch (e) {}
      try {
        if (sys.data && sys.data.net) {
          fs.writeFileSync(path.join(staging, 'originals', 'network.json'), JSON.stringify({ collectedAt: out.now.iso, ...sys.data.net }, null, 2), { mode: 0o600 });
        }
      } catch (e) {}
      const totalGroups = Object.keys(SYSTEM_CMDS).length;
      const okGroups = Object.keys(sys.data).length;
      if (sys.permissionFailed.length === totalGroups) out.system.status = 'permission_denied';
      else if (okGroups === 0 && sys.skipped.length > 0) out.system.status = 'failed';
      else out.system.status = okGroups > 0 ? 'partial' : 'failed';
    } else if (cmd === 'llm') {
      // argv: [staging?, payloadJson, baseUrl, model, timeoutMs]；stdin = apiKey（零落盘）
      // payload: {messages:[{role,content}], temperature?, max_tokens?}
      const payload = readJsonArg(3);
      const baseUrl = process.argv[4];
      const model = process.argv[5];
      const timeoutMs = parseInt(process.argv[6], 10) || 45000;
      let apiKey = '';
      try { apiKey = fs.readFileSync(0, 'utf8').trim(); } catch (e) { apiKey = ''; }
      if (!apiKey && process.argv[7]) {
        // 密钥回退：环境变量 DSH_DXB_LLM_<ID大写>_KEY（动态插件沙箱无 process，由 helper 代读）
        try { apiKey = String(process.env['DSH_DXB_LLM_' + String(process.argv[7]).toUpperCase() + '_KEY'] || '').trim(); } catch (e) { apiKey = ''; }
      }
      if (!apiKey) { out.ok = false; out.error = 'missing api key (stdin/env)'; }
      else {
        try {
          // 发送前脱敏：保护 IP/邮箱/sk- 密钥串
          const messages = (payload.messages || []).map(function (m) {
            return { role: m.role, content: maskText(m.content) };
          });
          const r = await callLLM(Object.assign({}, payload, { messages: messages }), baseUrl, model, apiKey, timeoutMs);
          out.text = r.text;
          out.model = r.model;
          out.usage = r.usage;
        } catch (e) {
          out.ok = false;
          out.error = String((e && e.message) || e).slice(0, 400);
        }
      }
    } else if (cmd === 'runfix') {
      // argv: [command, timeoutMs]；命令来自内置 signals.fixes（人工审核），UI 二次确认后调用
      const command = String(process.argv[3] || '');
      const timeoutMs = parseInt(process.argv[4], 10) || 30000;
      if (!command || command.length > 500) { out.ok = false; out.error = 'invalid fix command'; }
      else {
        try {
          const r = await new Promise(function (resolve) {
            execFile('/bin/sh', ['-c', command], { timeout: timeoutMs, maxBuffer: 2 * 1024 * 1024, env: process.env }, function (err, stdout, stderr) {
              resolve({ ok: !err, exitCode: err ? (err.code || err.status || 1) : 0, stdout: String(stdout || ''), stderr: String(stderr || '') });
            });
          });
          const cap = 2048;
          out.ok = r.ok;
          out.exitCode = r.exitCode;
          out.output = (r.stdout + (r.stderr ? '\n[stderr] ' + r.stderr : '')).slice(-cap);
        } catch (e) {
          out.ok = false;
          out.error = String((e && e.message) || e).slice(0, 300);
        }
      }
    } else if (cmd === 'putfile') {
      // host → helper：写一个最终产物文件（供 ai-summary.txt / summary.txt 用），路径限定在 staging 内
      const staging = process.argv[3];
      const rel = process.argv[4];
      const content = process.argv[5] || '';
      const finalDir = path.resolve(staging, 'final');
      const full = path.resolve(finalDir, rel);
      if (full.indexOf(finalDir + path.sep) !== 0 && full !== finalDir) { out.error = 'bad rel'; out.ok = false; }
      else {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, { mode: 0o600 });
        out.written = rel;
        out.bytes = Buffer.byteLength(content);
      }
    } else if (cmd === 'tail') {
      const staging = process.argv[3];
      const rel = process.argv[4];
      const n = parseInt(process.argv[5], 10) || 120;
      const full = path.join(staging, 'originals', rel);
      if (!fs.existsSync(full)) { out.error = 'file not found: ' + rel; out.ok = false; }
      else {
        const lines = fs.readFileSync(full, 'utf8').split('\n');
        out.total = lines.length;
        out.text = lines.slice(-n).join('\n');
      }
    } else if (cmd === 'read') {
      const staging = process.argv[3];
      const rel = process.argv[4];
      const from = parseInt(process.argv[5], 10) || 1;
      const count = parseInt(process.argv[6], 10) || 2000;
      const full = path.join(staging, 'originals', rel);
      if (!fs.existsSync(full)) { out.error = 'file not found: ' + rel; out.ok = false; }
      else {
        const text = fs.readFileSync(full, 'utf8');
        const lines = text.split('\n');
        const start = Math.max(0, from - 1);
        out.total = lines.length;
        out.size = Buffer.byteLength(text);
        out.lines = lines.slice(start, start + count);
      }
    } else if (cmd === 'redact') {
      const payload = readJsonArg(3);
      payload.workerPath = process.argv[4];
      const result = await redactPayload(payload);
      Object.assign(out, result);
    } else if (cmd === 'time') {
      Object.assign(out, now());
    } else if (cmd === 'finalize') {
      const finalDir = process.argv[3];
      const man = JSON.parse(process.argv[4]);
      const readme = process.argv[5];
      const t = now();
      man.createdAt = t.iso;
      man.timezone = t.timezone;
      fs.mkdirSync(finalDir, { recursive: true });
      fs.writeFileSync(path.join(finalDir, 'manifest.json'), JSON.stringify(man, null, 2), { mode: 0o600 });
      fs.writeFileSync(path.join(finalDir, 'README.txt'), readme, { mode: 0o600 });
      out.createdAt = man.createdAt;
    } else if (cmd === 'pack') {
      // 约定：argv[3] = staging，只打包 staging/final（脱敏后产物）
      const staging = process.argv[3];
      const zipPath = process.argv[4];
      const finalDir = path.join(staging, 'final');
      const entries = [];
      walkDir(finalDir, finalDir, entries);
      const zipBuf = makeZip(entries.map((e) => ({ name: e.name, data: fs.readFileSync(e.full) })));
      fs.mkdirSync(path.dirname(zipPath), { recursive: true });
      fs.writeFileSync(zipPath, zipBuf, { mode: 0o600 });
      out.bytes = zipBuf.length;
      out.entries = entries.map((e) => e.name);
      out.now = now();
    } else if (cmd === 'exists') {
      out.exists = fs.existsSync(process.argv[3]);
    } else if (cmd === 'cleanup') {
      fs.rmSync(process.argv[3], { recursive: true, force: true });
      out.removed = true;
    } else if (cmd === 'desktop') {
      Object.assign(out, await resolveDesktop());
    } else {
      out.ok = false;
      out.error = 'unknown command: ' + cmd;
    }
  } catch (e) {
    out.ok = false;
    out.error = String((e && e.stack) || e);
  }
  process.stdout.write(JSON.stringify(out) + '\n');
  process.exit(out.ok ? 0 : 1);
}

main();
