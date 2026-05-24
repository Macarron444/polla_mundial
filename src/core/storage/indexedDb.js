const DB_NAME    = 'polla-mundial-db'
const DB_VERSION = 2  

const STORES = {
    USUARIOS:            'usuarios',
    PREDICCIONES:        'predicciones',        
    GRUPOS:              'grupos',
    PREDICCIONES_GRUPO:  'prediccionesGrupo',   
    COMENTARIOS:         'comentarios',
    SOLICITUDES:         'solicitudes',
    RANKING_HIST:        'rankingHistorial',
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB no esta disponible en este navegador.'))
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = request.result

            // Stores v1
            if (!db.objectStoreNames.contains(STORES.USUARIOS)) {
                db.createObjectStore(STORES.USUARIOS, { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains(STORES.PREDICCIONES)) {
                db.createObjectStore(STORES.PREDICCIONES, { keyPath: 'usuarioId' })
            }

            // Stores v2
            if (!db.objectStoreNames.contains(STORES.GRUPOS)) {
                db.createObjectStore(STORES.GRUPOS, { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains(STORES.PREDICCIONES_GRUPO)) {
                // clave compuesta: grupoId_usuarioId_partidoId
                db.createObjectStore(STORES.PREDICCIONES_GRUPO, { keyPath: 'key' })
            }
            if (!db.objectStoreNames.contains(STORES.COMENTARIOS)) {
                // clave compuesta: grupoId_partidoId
                db.createObjectStore(STORES.COMENTARIOS, { keyPath: 'key' })
            }
            if (!db.objectStoreNames.contains(STORES.SOLICITUDES)) {
                db.createObjectStore(STORES.SOLICITUDES, { keyPath: 'id', autoIncrement: false })
            }
            if (!db.objectStoreNames.contains(STORES.RANKING_HIST)) {
                db.createObjectStore(STORES.RANKING_HIST, { keyPath: 'grupoId' })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror  = () => reject(request.error)
    })
}

function runStore(storeName, mode, action) {
    return openDatabase().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, mode)
                const store       = transaction.objectStore(storeName)
                const req         = action(store)

                req.onsuccess              = () => resolve(req.result)
                req.onerror               = () => reject(req.error)
                transaction.oncomplete    = () => db.close()
                transaction.onerror       = () => { db.close(); reject(transaction.error) }
            })
    )
}

function runStoreAll(storeName, mode, action) {
    return openDatabase().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, mode)
                const store       = transaction.objectStore(storeName)
                const result      = action(store)          // puede ser undefined (put/delete)
                transaction.oncomplete = () => { db.close(); resolve(result) }
                transaction.onerror    = () => { db.close(); reject(transaction.error) }
            })
    )
}

function getAll(storeName) {
    return runStore(storeName, 'readonly', (store) => store.getAll())
}

export function guardarUsuario(usuario) {
    if (!usuario?.id) return Promise.resolve()
    return runStore(STORES.USUARIOS, 'readwrite', (store) =>
        store.put({ ...usuario, actualizadoEn: new Date().toISOString() })
    )
}

export function obtenerUsuario(usuarioId) {
    return runStore(STORES.USUARIOS, 'readonly', (store) => store.get(usuarioId))
}

export function obtenerTodosUsuarios() {
    return getAll(STORES.USUARIOS)
}

export function guardarTodosUsuarios(usuarios) {
    return runStoreAll(STORES.USUARIOS, 'readwrite', (store) => {
        store.clear()
        usuarios.forEach((u) => store.put({ ...u, actualizadoEn: new Date().toISOString() }))
    })
}

export function guardarPrediccionesUsuario(usuarioId, predicciones) {
    if (!usuarioId) return Promise.resolve()
    return runStore(STORES.PREDICCIONES, 'readwrite', (store) =>
        store.put({ usuarioId, predicciones, actualizadoEn: new Date().toISOString() })
    )
}

export function obtenerPrediccionesUsuario(usuarioId) {
    if (!usuarioId) return Promise.resolve(null)
    return runStore(STORES.PREDICCIONES, 'readonly', (store) => store.get(usuarioId))
}

export function obtenerTodosGrupos() {
    return getAll(STORES.GRUPOS)
}

export function guardarGrupo(grupo) {
    return runStore(STORES.GRUPOS, 'readwrite', (store) =>
        store.put({ ...grupo, actualizadoEn: new Date().toISOString() })
    )
}

export function guardarTodosGrupos(grupos) {
    return runStoreAll(STORES.GRUPOS, 'readwrite', (store) => {
        store.clear()
        grupos.forEach((g) => store.put({ ...g, actualizadoEn: new Date().toISOString() }))
    })
}

export function eliminarGrupoDb(grupoId) {
    return runStore(STORES.GRUPOS, 'readwrite', (store) => store.delete(grupoId))
}

function buildPredKey(grupoId, usuarioId, partidoId) {
    return `${grupoId}_${usuarioId}_${partidoId}`
}

export function obtenerTodasPrediccionesGrupo() {
    return getAll(STORES.PREDICCIONES_GRUPO)
}

export function guardarPrediccionGrupo(prediccion) {
    const key = buildPredKey(prediccion.grupoId, prediccion.usuarioId, prediccion.partidoId)
    return runStore(STORES.PREDICCIONES_GRUPO, 'readwrite', (store) =>
        store.put({ ...prediccion, key })
    )
}

export function guardarTodasPrediccionesGrupo(predicciones) {
    return runStoreAll(STORES.PREDICCIONES_GRUPO, 'readwrite', (store) => {
        store.clear()
        predicciones.forEach((p) => {
            const key = buildPredKey(p.grupoId, p.usuarioId, p.partidoId)
            store.put({ ...p, key })
        })
    })
}

function buildComentKey(grupoId, partidoId) {
    return `${grupoId}_${partidoId}`
}

export function obtenerComentarios(grupoId, partidoId) {
    const key = buildComentKey(grupoId, partidoId)
    return runStore(STORES.COMENTARIOS, 'readonly', (store) => store.get(key))
        .then((r) => r?.comentarios ?? [])
}

export function guardarComentarios(grupoId, partidoId, comentarios) {
    const key = buildComentKey(grupoId, partidoId)
    return runStore(STORES.COMENTARIOS, 'readwrite', (store) =>
        store.put({ key, comentarios })
    )
}

export function obtenerTodasSolicitudes() {
    return getAll(STORES.SOLICITUDES)
}

export function guardarSolicitud(solicitud) {
    return runStore(STORES.SOLICITUDES, 'readwrite', (store) => store.put(solicitud))
}

export function actualizarSolicitud(solicitud) {
    return runStore(STORES.SOLICITUDES, 'readwrite', (store) => store.put(solicitud))
}

export function guardarTodasSolicitudes(solicitudes) {
    return runStoreAll(STORES.SOLICITUDES, 'readwrite', (store) => {
        store.clear()
        solicitudes.forEach((s) => store.put(s))
    })
}

export function obtenerHistorialRankingGrupo(grupoId) {
    return runStore(STORES.RANKING_HIST, 'readonly', (store) => store.get(grupoId))
        .then((r) => r?.snapshots ?? [])
}

export function guardarSnapshotRanking(grupoId, snapshot) {
    return runStore(STORES.RANKING_HIST, 'readwrite', (store) => store.get(grupoId))
        .then((registro) => {
            const snapshots = registro?.snapshots ?? []
            snapshots.push(snapshot)
            return runStore(STORES.RANKING_HIST, 'readwrite', (store) =>
                store.put({ grupoId, snapshots })
            )
        })
}