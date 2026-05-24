const KEY = 'polla_mundial_pred_grupo'

function getTodos() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function saveTodos(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

// key: `${grupoId}_${usuarioId}_${partidoId}`
function buildKey(grupoId, usuarioId, partidoId) {
    return `${grupoId}_${usuarioId}_${partidoId}`
}

export function getPredicion(grupoId, usuarioId, partidoId) {
    return getTodos()[buildKey(grupoId, usuarioId, partidoId)] ?? null
}

export function getPredicionesPorGrupoPartido(grupoId, partidoId) {
    const todos = getTodos()
    return Object.entries(todos)
        .filter(([k]) => k.startsWith(`${grupoId}_`) && k.endsWith(`_${partidoId}`))
        .map(([, v]) => v)
}

export function getPredicionesPorGrupoUsuario(grupoId, usuarioId) {
    const todos = getTodos()
    return Object.entries(todos)
        .filter(([k]) => k.startsWith(`${grupoId}_${usuarioId}_`))
        .map(([, v]) => v)
}

export function getPredicionesPorGrupo(grupoId) {
    const todos = getTodos()
    return Object.entries(todos)
        .filter(([k]) => k.startsWith(`${grupoId}_`))
        .map(([, v]) => v)
}

export function guardarPrediccion(grupoId, usuarioId, partidoId, golesL, golesV, usaComodin = false) {
    const todos = getTodos()
    todos[buildKey(grupoId, usuarioId, partidoId)] = {
        grupoId, usuarioId, partidoId,
        golesL, golesV, usaComodin,
        fecha: new Date().toISOString(),
        estado: 'PENDIENTE',
        pts: 0,
    }
    saveTodos(todos)
}

// Llama esto cuando el admin registra resultado real
export function resolverPredicciones(grupoId, partidoId, golesLReal, golesVReal) {
    const todos = getTodos()
    const resultadoL = golesLReal, resultadoV = golesVReal
    const ganadorReal = resultadoL > resultadoV ? 'L' : resultadoL < resultadoV ? 'V' : 'E'

    Object.keys(todos).forEach((k) => {
        if (!k.startsWith(`${grupoId}_`) || !k.endsWith(`_${partidoId}`)) return
        const p = todos[k]
        const ganadorPred = p.golesL > p.golesV ? 'L' : p.golesL < p.golesV ? 'V' : 'E'
        let pts = 0, estado = 'FALLIDA'
        if (p.golesL === resultadoL && p.golesV === resultadoV) {
            estado = 'EXACTA'; pts = p.usaComodin ? 6 : 3
        } else if (ganadorPred === ganadorReal) {
            estado = 'CORRECTA'; pts = p.usaComodin ? 2 : 1
        }
        todos[k] = { ...p, estado, pts }
    })
    saveTodos(todos)
}

// Verifica si el usuario ya usó su comodín en este grupo
export function usaComodinDisponible(grupoId, usuarioId) {
    return !getPredicionesPorGrupoUsuario(grupoId, usuarioId).some((p) => p.usaComodin)
}