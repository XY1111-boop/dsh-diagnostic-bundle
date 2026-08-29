/**
 * Minimal HTTP helpers for the diagnostic-bundle RPC route: JSON
 * serialization, same-origin enforcement for the mutating endpoint, and a
 * size-capped JSON body reader. Pattern follows the official dshmarket
 * helpers (http.js) so the packaged plugin behaves like a first-party web
 * plugin.
 */

/** Write a JSON payload with no-store caching. */
export function sendJson(response, status, payload) {
    response.writeHead(status, {
        'cache-control': 'no-store',
        'content-type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify(payload));
}

/** True when the request's Origin matches its Host — required on every POST route. */
export function sameOrigin(request) {
    const origin = request.headers.origin;
    const host = request.headers.host;
    // Desktop shell (local patch): the desktop carrier's request shim carries
    // no socket, and the app:// protocol handler serves exactly one origin
    // (app://dsh) while refusing every other hostname — so an `app:` origin is
    // inherently same-host, and a body-less shim with no Origin/Host headers
    // can only have come from that same local shell. A remote page cannot
    // reach these routes.
    if (origin !== undefined && /^app:\/\//i.test(origin)) return true;
    if (request.socket === undefined && origin === undefined && host === undefined) return true;
    if (origin === undefined || host === undefined) return false;
    try {
        return new URL(origin).host === host;
    }
    catch {
        return false;
    }
}

/** Read and parse a JSON request body, rejecting anything over `maxBytes`. */
export async function readJsonBody(request, maxBytes = 4096) {
    // Desktop shell (local patch): the desktop carrier's request shim carries
    // no body stream — the client forwards POST bodies in the `body` query
    // parameter instead, so parse it here when the request is not
    // async-iterable (the web carrier's node:http request always is).
    if (typeof request[Symbol.asyncIterator] !== 'function') {
        const url = new URL(request.url, 'app://dsh');
        const raw = url.searchParams.get('body');
        if (raw == null) throw new Error('missing request body');
        const buffer = Buffer.from(raw, 'utf8');
        if (buffer.length > maxBytes) throw new Error('request body too large');
        return JSON.parse(buffer.toString('utf8'));
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > maxBytes) throw new Error('request body too large');
        chunks.push(buffer);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
