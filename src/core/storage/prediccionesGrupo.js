import { get, put, post } from './api.js'

function buildKey(grupoId, usuarioId, partidoId) {
    return `${grupoId}_${usuarioId}_${partidoId}`
}

export async function getPredicion(grupoId, usuarioId, partidoId) {
    const todas = await get('/predicciones')
    return todas.find(
        (p) => p.grupoId === grupoId && p.usuarioId === usuarioId && p.partidoId === partidoId
    ) ?? null
}

export async function getPredicionesPorGrupoPartido(grupoId, partidoId) {
    const todas = await get('/predicciones')
    return todas.filter((p) => p.grupoId === grupoId && p.partidoId === partidoId)
}

export async function getPredicionesPorGrupoUsuario(grupoId, usuarioId) {
    const todas = await get('/predicciones')
    return todas.filter((p) => p.grupoId === grupoId && p.usuarioId === usuarioId)
}

export async function getPredicionesPorGrupo(grupoId) {
    const todas = await get('/predicciones')
    return todas.filter((p) => p.grupoId === grupoId)
}

export async function guardarPrediccion(grupoId, usuarioId, partidoId, golesL, golesV, usaComodin = false) {
    const key = buildKey(grupoId, usuarioId, partidoId)
    const prediccion = {
        key, grupoId, usuarioId, partidoId,
        golesL, golesV, usaComodin,
        fecha: new Date().toISOString(),
        estado: 'PENDIENTE',
        pts: 0,
    }
    await put(`/predicciones/${key}`, prediccion)
    return prediccion
}

export async function resolverPredicciones(grupoId, partidoId, golesLReal, golesVReal) {
    const todas       = await get('/predicciones')
    const ganadorReal = golesLReal > golesVReal ? 'L' : golesLReal < golesVReal ? 'V' : 'E'

    const delGrupoPartido = todas.filter(
        (p) => p.grupoId === grupoId && p.partidoId === partidoId
    )

    const actualizadas = delGrupoPartido.map((p) => {
        const ganadorPred = p.golesL > p.golesV ? 'L' : p.golesL < p.golesV ? 'V' : 'E'
        let pts = 0, estado = 'FALLIDA'
        if (p.golesL === golesLReal && p.golesV === golesVReal) {
            estado = 'EXACTA';   pts = p.usaComodin ? 6 : 3
        } else if (ganadorPred === ganadorReal) {
            estado = 'CORRECTA'; pts = p.usaComodin ? 2 : 1
        }
        return { ...p, estado, pts }
    })

    await post('/predicciones/bulk', actualizadas)
}

export async function usaComodinDisponible(grupoId, usuarioId) {
    const preds = await getPredicionesPorGrupoUsuario(grupoId, usuarioId)
    return !preds.some((p) => p.usaComodin)
}