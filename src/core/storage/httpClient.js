const BASE = '/db'
const STORAGE_PREFIX = 'polla_mundial:http:'
const PENDING_KEY = `${STORAGE_PREFIX}pending`
let flushing = false

function canUseLocalStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isOnline() {
    return typeof navigator === 'undefined' ? true : navigator.onLine
}

function readJson(key, fallback) {
    if (!canUseLocalStorage()) return fallback
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}

function writeJson(key, value) {
    if (!canUseLocalStorage()) return
    localStorage.setItem(key, JSON.stringify(value))
}

function getCollection(path) {
    return path.split('/').filter(Boolean)[0] ?? ''
}

function getResourceId(path) {
    return path.split('/').filter(Boolean)[1] ?? null
}

function getNestedResourceId(path) {
    const parts = path.split('/').filter(Boolean)
    if (parts[0] === 'comentarios' && parts[1] && parts[2]) return `${parts[1]}_${parts[2]}`
    return parts[1] ?? null
}

function cacheKey(collection) {
    return `${STORAGE_PREFIX}cache:${collection}`
}

function getItemId(item) {
    return item?._key ?? item?.key ?? item?.id
}

function readCache(collection, fallback = []) {
    return readJson(cacheKey(collection), fallback)
}

function writeCache(collection, value) {
    writeJson(cacheKey(collection), value)
}

function notifyStorageChange(collection, reason) {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('polla_mundial:storage-change', {
        detail: { collection, reason },
    }))
}

function upsertArray(items, id, body) {
    const next = Array.isArray(items) ? [...items] : []
    const idx = next.findIndex((item) => String(getItemId(item)) === String(id))
    const item = { ...body }

    if (id != null && item._key === undefined && item.key === undefined && item.id === undefined) {
        item.id = id
    }

    if (idx === -1) next.push(item)
    else next[idx] = { ...next[idx], ...item }

    return next
}

function applyMutationToCache(method, path, body, responseBody = body) {
    const collection = getCollection(path)
    if (!collection) return responseBody

    const id = getResourceId(path)
    const current = readCache(collection, collection === 'comentarios' || collection === 'ranking' ? {} : [])

    if (method === 'PUT') {
        const next = Array.isArray(current)
            ? upsertArray(current, id, responseBody)
            : { ...current, [id]: responseBody }
        writeCache(collection, next)
        return responseBody
    }

    if (method === 'POST') {
        if (path.endsWith('/bulk')) {
            writeCache(collection, body)
            return responseBody
        }

        if (id && !Array.isArray(current)) {
            const next = { ...current, [id]: responseBody }
            writeCache(collection, next)
            return responseBody
        }

        const next = Array.isArray(current) ? [...current, responseBody] : current
        writeCache(collection, next)
        return responseBody
    }

    if (method === 'DELETE' && id) {
        const next = Array.isArray(current)
            ? current.filter((item) => String(getItemId(item)) !== String(id))
            : Object.fromEntries(Object.entries(current).filter(([key]) => String(key) !== String(id)))
        writeCache(collection, next)
    }

    return responseBody
}

function writeGetResponseToCache(path, response) {
    const collection = getCollection(path)
    if (!collection) return

    const id = getNestedResourceId(path)
    if ((collection === 'ranking' || collection === 'comentarios') && id) {
        const current = readCache(collection, {})
        writeCache(collection, { ...current, [id]: response })
        return
    }

    writeCache(collection, response)
}

function readGetResponseFromCache(path) {
    const collection = getCollection(path)
    if (!collection) return null

    const cached = readCache(collection, null)
    if (cached === null) return null

    const id = getNestedResourceId(path)
    if ((collection === 'ranking' || collection === 'comentarios') && id) {
        return cached[id] ?? null
    }

    return cached
}

function readPending() {
    return readJson(PENDING_KEY, [])
}

function writePending(items) {
    writeJson(PENDING_KEY, items)
}

function queueMutation(method, path, body) {
    const pending = readPending()
    const op = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        method,
        path,
        body,
        createdAt: new Date().toISOString(),
    }

    const next = method === 'PUT'
        ? [...pending.filter((item) => !(item.method === method && item.path === path)), op]
        : [...pending, op]

    writePending(next)
    applyMutationToCache(method, path, body)
    notifyStorageChange(getCollection(path), 'queued')
    return body ?? { ok: true, offline: true }
}

function applyPendingToPath(path, value) {
    const collection = getCollection(path)
    if (!collection) return value

    for (const op of readPending()) {
        if (getCollection(op.path) !== collection) continue
        applyMutationToCache(op.method, op.path, op.body)
    }

    return readGetResponseFromCache(path) ?? value
}

async function request(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } }
    if (body !== undefined) opts.body = JSON.stringify(body)

    let res
    try {
        res = await fetch(`${BASE}${path}`, opts)
    } catch (cause) {
        const error = new Error('Sin conexión — cambio guardado localmente')
        error.offline = true
        error.cause = cause
        throw error
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        const error = new Error(err.error ?? `Error ${res.status}`)
        error.offline = err.offline === true || res.status === 503
        throw error
    }

    return res.json()
}

async function flushPending() {
    if (flushing || !canUseLocalStorage() || !isOnline()) return

    flushing = true
    try {
        const pending = readPending()
        const remaining = []

        for (const op of pending) {
            try {
                const response = await request(op.method, op.path, op.body)
                applyMutationToCache(op.method, op.path, op.body, response)
                notifyStorageChange(getCollection(op.path), 'synced')
            } catch (error) {
                remaining.push(op)
                if (error.offline || !isOnline()) break
            }
        }

        writePending(remaining)
    } finally {
        flushing = false
    }
}

async function http(method, path, body) {
    if (method !== 'GET') {
        try {
            const response = await request(method, path, body)
            applyMutationToCache(method, path, body, response)
            notifyStorageChange(getCollection(path), 'saved')
            return response
        } catch (error) {
            if (error.offline || !isOnline()) return queueMutation(method, path, body)
            throw error
        }
    }

    const collection = getCollection(path)

    try {
        await flushPending()
        const response = await request(method, path, body)
        writeGetResponseToCache(path, response)
        return collection ? applyPendingToPath(path, response) : response
    } catch (error) {
        const cached = readGetResponseFromCache(path)
        if (cached !== null) return applyPendingToPath(path, cached)
        throw error
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => { flushPending() })
    setTimeout(() => { flushPending() }, 0)
}

export const get  = (path)       => http('GET',    path)
export const post = (path, body) => http('POST',   path, body)
export const put  = (path, body) => http('PUT',    path, body)
export const del  = (path)       => http('DELETE', path)
