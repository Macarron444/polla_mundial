import { get, post } from './api.js'
import { getPredicionesPorGrupo } from './prediccionesGrupo.js'

export async function calcularRanking(grupo) {
    const preds = await getPredicionesPorGrupo(grupo.id)
    const mapa  = {}

    grupo.miembros.forEach((m) => {
        mapa[m.usuarioId] = {
            usuarioId: m.usuarioId,
            nombre: m.nombre,
            pts: 0, exactas: 0, correctas: 0, fallidas: 0, pendientes: 0,
        }
    })

    preds.forEach((p) => {
        if (!mapa[p.usuarioId]) return
        mapa[p.usuarioId].pts += p.pts ?? 0
        if      (p.estado === 'EXACTA')    mapa[p.usuarioId].exactas++
        else if (p.estado === 'CORRECTA')  mapa[p.usuarioId].correctas++
        else if (p.estado === 'FALLIDA')   mapa[p.usuarioId].fallidas++
        else                               mapa[p.usuarioId].pendientes++
    })

    return Object.values(mapa).sort((a, b) => b.pts - a.pts || b.exactas - a.exactas)
}

export async function guardarSnapshot(grupoId, ranking) {
    const snapshot = { fecha: new Date().toISOString(), ranking: ranking.map((r) => ({ ...r })) }
    await post(`/ranking/${grupoId}`, snapshot)
}

export async function getHistorialRanking(grupoId) {
    return get(`/ranking/${grupoId}`)
}