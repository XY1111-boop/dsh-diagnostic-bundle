'use strict';
/* dsh-diagnostic-bundle redaction worker: runs inside worker_threads.
   workerData: { originals, finalRoot, checks, keywords, masks, patches }
   Order per spec: final content = redaction( edit patches( original ) ).
   Match priority: structured JSON key names -> key=value lines -> full-text regex. */
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const KEY_RE = /(^|[-_. ])(api[_-]?key|access[_-]?key|secret|token|password|passwd|pwd|authorization|auth|bearer|cookie|credential|session[_-]?id|private[_-]?key|ssh[_-]?key)(s)?$/i;
const SK_RE = /\bsk-[A-Za-z0-9_\-]{8,}\b/g;
const EMAIL_RE = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;
const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;
const KV_RE = /^(\s*[-*]?\s*)([A-Za-z0-9_.\-\[\]"\']+)\s*[:=]\s*(.+)$/;
const STAR = '***';

function escRe(s) {
  return s.replace(/[.*+?^$\[\](){}|\\]/g, '\\$&');
}

function sampleAround(text, idx, len) {
  const start = Math.max(0, idx - 25);
  const end = Math.min(text.length, idx + len + 25);
  return text.slice(start, end).replace(/\n/g, '\\n');
}

function applyPatterns(text, rules, counts, samples, seen) {
  const run = (re, key, replaceWith) => {
    let m;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      if (m[0] === STAR) { re.lastIndex = start + 1; continue; }
      counts[key] = (counts[key] || 0) + 1;
      if (samples.length < 6 && !seen[key + ':' + start]) {
        samples.push({ key, before: sampleAround(text, start, m[0].length), after: sampleAround(text, start, m[0].length).replace(m[0], replaceWith) });
      }
      text = text.slice(0, start) + replaceWith + text.slice(start + m[0].length);
      re.lastIndex = start + replaceWith.length;
    }
  };
  run(SK_RE, 'sk', STAR);
  if (rules.masks.email !== false) run(EMAIL_RE, 'email', STAR);
  if (rules.masks.ipv4 !== false) run(IPV4_RE, 'ipv4', STAR);
  for (const kw of rules.keywords || []) {
    if (!kw) continue;
    const re = new RegExp(escRe(kw), 'gi');
    run(re, 'keyword', STAR);
  }
  return text;
}

function redactJson(text, counts, samples) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return null; }
  let changed = false;
  const walk = (node, keyPath) => {
    if (Array.isArray(node)) { for (let i = 0; i < node.length; i++) walk(node[i], keyPath); return; }
    if (!node || typeof node !== 'object') return;
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (KEY_RE.test(k)) {
        if (typeof v === 'string' && v !== STAR && v !== '') {
          counts.jsonKey = (counts.jsonKey || 0) + 1;
          if (samples.length < 6) {
            const before = String(v).slice(0, 80);
            samples.push({ key: 'jsonKey', before: k + ' = ' + before, after: k + ' = ' + STAR });
          }
          node[k] = STAR;
          changed = true;
        }
      } else if (v && typeof v === 'object') {
        walk(v, keyPath + '.' + k);
      }
    }
  };
  walk(obj, '');
  if (!changed) return null;
  return JSON.stringify(obj, null, 2);
}

function redactKvLines(text, counts, samples) {
  const lines = text.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(KV_RE);
    if (!m) continue;
    if (!KEY_RE.test(m[2])) continue;
    const val = m[3].trim();
    if (val === STAR || val === '') continue;
    counts.kvKey = (counts.kvKey || 0) + 1;
    if (samples.length < 6) samples.push({ key: 'kvKey', before: m[1] + m[2] + ' = ' + val.slice(0, 60), after: m[1] + m[2] + ' = ' + STAR });
    lines[i] = m[1] + m[2] + ': ' + STAR;
    changed = true;
  }
  return changed ? lines.join('\n') : text;
}

function applyPatches(text, patches) {
  if (!patches || !patches.length) return text;
  const lines = text.split('\n');
  const sorted = patches.slice().sort((a, b) => (b.startLine - a.startLine) || (b.endLine - a.endLine));
  for (const p of sorted) {
    const s = Math.max(1, p.startLine || 1);
    const e = Math.min(lines.length, p.endLine || s);
    if (s > e || s > lines.length) continue;
    const rep = String(p.newText == null ? '' : p.newText).split('\n');
    lines.splice(s - 1, e - s + 1, ...rep);
  }
  return lines.join('\n');
}

function buildFileList(originals, checks) {
  const list = [];
  if (checks.env !== false) list.push({ rel: 'environment.json', src: path.join(originals, 'environment.json') });
  if (checks.system !== false) list.push({ rel: 'system.json', src: path.join(originals, 'system.json') });
  // 1.3.2：错误/时间线/网络探测文件（存在才加入，不受四类勾选控制，始终进包）
  for (const rel of ['errors.json', 'session-timeline.json', 'network.json']) {
    const src = path.join(originals, rel);
    if (fs.existsSync(src)) list.push({ rel, src });
  }
  // 1.3.3：插件适配分析（与四类并列的第五类，受 checks.plugins 控制）
  if (checks.plugins !== false) {
    const src = path.join(originals, 'plugins.json');
    if (fs.existsSync(src)) list.push({ rel: 'plugins.json', src });
  }
  if (checks.logs !== false) {
    const dir = path.join(originals, 'logs');
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
        list.push({ rel: 'logs/' + f, src: path.join(dir, f) });
      }
    }
  }
  if (checks.config !== false) {
    const dir = path.join(originals, 'config');
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
        list.push({ rel: 'config/' + f, src: path.join(dir, f) });
      }
    }
  }
  return list;
}

function main() {
  try {
    const { originals, finalRoot, checks, keywords, masks, patches } = workerData;
    const files = buildFileList(originals, checks);
    const rules = { keywords: keywords || [], masks: masks || {} };
    const outFiles = [];
    const totalCounts = { jsonKey: 0, kvKey: 0, sk: 0, email: 0, ipv4: 0, keyword: 0 };
    let totalHits = 0;
    for (const f of files) {
      if (!fs.existsSync(f.src)) continue;
      let text = fs.readFileSync(f.src, 'utf8');
      const filePatches = patches && patches[f.rel];
      text = applyPatches(text, filePatches);
      const counts = {};
      const samples = [];
      let out = null;
      if (/\.json$/i.test(f.rel)) out = redactJson(text, counts, samples);
      if (out === null) {
        let t2 = redactKvLines(text, counts, samples);
        t2 = applyPatterns(t2, { keywords: rules.keywords, masks: rules.masks }, counts, samples, {});
        out = t2;
      } else {
        out = applyPatterns(out, { keywords: rules.keywords, masks: rules.masks }, counts, samples, {});
      }
      const dest = path.join(finalRoot, f.rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, out, { mode: 0o600 });
      let fileHits = 0;
      for (const k of Object.keys(counts)) {
        totalCounts[k] = (totalCounts[k] || 0) + counts[k];
        fileHits += counts[k];
      }
      totalHits += fileHits;
      outFiles.push({ rel: f.rel, bytes: Buffer.byteLength(out), hits: fileHits, samples });
    }
    parentPort.postMessage({ ok: true, files: outFiles, totalHits, counts: totalCounts });
  } catch (e) {
    parentPort.postMessage({ ok: false, error: String((e && e.stack) || e) });
  }
}

main();
