const KEY = 'polla_mundial_comentarios'

function getTodos() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function saveTodos(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

function buildKey(grupoId, partidoId) { return `${grupoId}_${partidoId}` }

export function getComentarios(grupoId, partidoId) {
    return getTodos()[buildKey(grupoId, partidoId)] ?? []
}

export function agregarComentario(grupoId, partidoId, usuario, texto) {
    if (!texto.trim()) return
    const todos = getTodos()
    const k = buildKey(grupoId, partidoId)
    if (!todos[k]) todos[k] = []
    todos[k].push({
        id: Date.now(),
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        texto: texto.trim(),
        fecha: new Date().toISOString(),
    })
    saveTodos(todos)
}

export function eliminarComentario(grupoId, partidoId, comentarioId, usuarioId) {
    const todos = getTodos()
    const k = buildKey(grupoId, partidoId)
    if (!todos[k]) return
    todos[k] = todos[k].filter((c) => !(c.id === comentarioId && c.usuarioId === usuarioId))
    saveTodos(todos)
}