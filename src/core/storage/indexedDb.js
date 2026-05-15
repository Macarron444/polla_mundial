const DB_NAME = 'polla-mundial-db'
const DB_VERSION = 1
const STORE_USUARIOS = 'usuarios'
const STORE_PREDICCIONES = 'predicciones'

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB no esta disponible en este navegador.'))
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
            const db = request.result

            if (!db.objectStoreNames.contains(STORE_USUARIOS)) {
                db.createObjectStore(STORE_USUARIOS, { keyPath: 'id' })
            }

            if (!db.objectStoreNames.contains(STORE_PREDICCIONES)) {
                db.createObjectStore(STORE_PREDICCIONES, { keyPath: 'usuarioId' })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function runStore(storeName, mode, action) {
    return openDatabase().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, mode)
                const store = transaction.objectStore(storeName)
                const request = action(store)

                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
                transaction.oncomplete = () => db.close()
                transaction.onerror = () => {
                    db.close()
                    reject(transaction.error)
                }
            })
    )
}

export function guardarUsuario(usuario) {
    if (!usuario?.id) return Promise.resolve()

    return runStore(STORE_USUARIOS, 'readwrite', (store) =>
        store.put({ ...usuario, actualizadoEn: new Date().toISOString() })
    )
}

export function obtenerUsuario(usuarioId) {
    return runStore(STORE_USUARIOS, 'readonly', (store) => store.get(usuarioId))
}

export function guardarPrediccionesUsuario(usuarioId, predicciones) {
    if (!usuarioId) return Promise.resolve()

    return runStore(STORE_PREDICCIONES, 'readwrite', (store) =>
        store.put({
            usuarioId,
            predicciones,
            actualizadoEn: new Date().toISOString(),
        })
    )
}

export function obtenerPrediccionesUsuario(usuarioId) {
    if (!usuarioId) return Promise.resolve(null)

    return runStore(STORE_PREDICCIONES, 'readonly', (store) => store.get(usuarioId))
}
