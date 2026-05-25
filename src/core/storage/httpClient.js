// ── CLIENTE HTTP HACIA EL BACKEND /db ─────────────────────────────────────────
const BASE = '/db'

async function http(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } }
    if (body !== undefined) opts.body = JSON.stringify(body)
    const res = await fetch(`${BASE}${path}`, opts)
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? `Error ${res.status}`)
    }
    return res.json()
}

export const get  = (path)       => http('GET',    path)
export const post = (path, body) => http('POST',   path, body)
export const put  = (path, body) => http('PUT',    path, body)
export const del  = (path)       => http('DELETE', path)