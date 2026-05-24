import { getPredicionesPorGrupo } from './prediccionesGrupo.js'

// Calcula el ranking completo de un grupo
export function calcularRanking(grupo) {
    const preds = getPredicionesPorGrupo(grupo.id)
    const mapa = {}

    grupo.miembros.forEach((m) => {
        mapa[m.usuarioId] = {
            usuarioId: m.usuarioId,
            nombre: m.nombre,
            pts: 0, exactas: 0, correctas: 0, fallidas: 0, pendientes: 0,
        }
    })

    preds.forEach((p) => {
        if (!mapa[p.usuarioId]) return
        mapa[p.usuarioId].pts += p.pts
        if (p.estado === 'EXACTA') mapa[p.usuarioId].exactas++
        else if (p.estado === 'CORRECTA') mapa[p.usuarioId].correctas++
        else if (p.estado === 'FALLIDA') mapa[p.usuarioId].fallidas++
        else mapa[p.usuarioId].pendientes++
    })

    return Object.values(mapa).sort((a, b) => b.pts - a.pts || b.exactas - a.exactas)
}

// Historial del ranking por snapshot (guardado cuando se resuelve un partido)
const HIST_KEY = 'polla_mundial_ranking_hist'

function getHistorial() {
    try { return JSON.parse(localStorage.getItem(HIST_KEY) || '{}') } catch { return {} }
}

export function guardarSnapshot(grupoId, ranking) {
    const hist = getHistorial()
    if (!hist[grupoId]) hist[grupoId] = []
    hist[grupoId].push({ fecha: new Date().toISOString(), ranking: ranking.map((r) => ({ ...r })) })
    localStorage.setItem(HIST_KEY, JSON.stringify(hist))
}

export function getHistorialRanking(grupoId) {
    return (getHistorial()[grupoId] ?? [])
}