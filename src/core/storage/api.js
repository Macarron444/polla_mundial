const BASE = '/db'
const LEGACY_PREFIX = 'polla_mundial:'
const migratedCollections = new Set()

async function http(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    }
    if (body !== undefined) opts.body = JSON.stringify(body)

    const res = await fetch(`${BASE}${path}`, opts)
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? `Error ${res.status}`)
    }
    return res.json()
}

async function migrateLegacyCollection(path) {
    const [collection] = path.split('/').filter(Boolean)
    if (!collection || migratedCollections.has(collection)) return
    migratedCollections.add(collection)

    const raw = localStorage.getItem(`${LEGACY_PREFIX}${collection}`)
    if (!raw) return

    try {
        const legacyItems = JSON.parse(raw)
        if (!Array.isArray(legacyItems) || legacyItems.length === 0) return

        await Promise.all(
            legacyItems.map((item) => {
                const id = item.id ?? item.key
                return id ? http('PUT', `/${collection}/${id}`, item) : http('POST', `/${collection}`, item)
            })
        )
        localStorage.setItem(`${LEGACY_PREFIX}${collection}:migrated`, new Date().toISOString())
    } catch (error) {
        console.warn(`No se pudo migrar ${collection} al backend compartido:`, error)
    }
}

export const get = async (path) => {
    await migrateLegacyCollection(path)
    return http('GET', path)
}
export const post = (path, body) => http('POST', path, body)
export const put = (path, body) => http('PUT', path, body)
export const del = (path) => http('DELETE', path)
