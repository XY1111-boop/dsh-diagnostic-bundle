/**
 * runner.js — helper 子进程封装。
 * spawn 真实 node 执行包内 assets/helper.cjs，管理超时、stdout/stderr 上限、
 * 首行 JSON 解析、stdin 密码注入（提权）与 SIGKILL 兜底。
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.dirname(fileURLToPath(import.meta.url));
export const HELPER = path.join(PKG_ROOT, 'assets', 'helper.cjs');
export const WORKER = path.join(PKG_ROOT, 'assets', 'redactor-worker.cjs');

const OUT_CAP = 64 * 1024 * 1024;
const ERR_CAP = 2 * 1024 * 1024;

/**
 * @param {string[]} args helper 子命令参数
 * @param {{capMs?:number, stdinData?:string}} opts
 * @returns {Promise<any>} helper 首行 JSON（ok 必须为 true）
 */
export function runHelper(args, opts = {}) {
    return new Promise((resolve, reject) => {
        let child;
        try {
            child = spawn(process.execPath, [HELPER, ...args], { stdio: ['pipe', 'pipe', 'pipe'] });
        } catch (e) {
            reject(new Error('helper spawn failed: ' + String((e && e.message) || e)));
            return;
        }
        let stdout = '';
        let stderr = '';
        let outBytes = 0;
        let errBytes = 0;
        child.stdout.on('data', (d) => {
            outBytes += d.length;
            if (outBytes <= OUT_CAP) stdout += d;
        });
        child.stderr.on('data', (d) => {
            errBytes += d.length;
            if (errBytes <= ERR_CAP) stderr += d;
        });
        child.stdin.on('error', () => {});
        let settled = false;
        const cap = opts.capMs || 80000;
        const to = setTimeout(() => {
            if (settled) return;
            settled = true;
            try { child.kill('SIGKILL'); } catch (e) {}
            reject(new Error('helper ' + args[0] + ' timeout after ' + cap + 'ms'));
        }, cap);
        child.on('error', (e) => {
            if (settled) return;
            settled = true;
            clearTimeout(to);
            reject(e);
        });
        child.on('close', (code) => {
            if (settled) return;
            settled = true;
            clearTimeout(to);
            if (code !== 0) {
                reject(new Error('helper ' + args[0] + ' failed code=' + code + ' stderr=' + String(stderr).slice(0, 300)));
                return;
            }
            const line = String(stdout).split('\n')[0] || '';
            let data = null;
            try {
                data = JSON.parse(line);
            } catch (e) {
                reject(new Error('helper bad output: ' + String(stdout).slice(0, 200)));
                return;
            }
            if (!data || data.ok === false) {
                reject(new Error('helper error: ' + String((data && data.error) || 'unknown')));
                return;
            }
            resolve(data);
        });
        try {
            child.stdin.end(opts.stdinData !== undefined ? String(opts.stdinData) : '');
        } catch (e) {}
    });
}

/** 平台门：helper 命令表按平台过滤。 */
export function platform() {
    return process.platform;
}
