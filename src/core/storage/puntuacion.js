import { get, post } from './httpClient.js'
import { getPredicionesPorGrupo } from './prediccionesGrupo.js'
import { esSuperAdminPorEmail } from '../constants/superadmin.js'

// ── Puntos por predicción global personal ────────────────────────────────────
// Campeón acertado: +5 pts, Goleador acertado: +3 pts
const PTS_CAMPEON   = 5
const PTS_GOLEADOR  = 3

export async function resolverPrediccionGlobalPersonal(campeonReal, goleadorReal) {
    const todas = await get('/prediccion-global-personal')
    if (!Array.isArray(todas) && typeof todas !== 'object') return

    const entradas = Array.isArray(todas)
        ? todas
        : Object.values(todas)

    const actualizadas = entradas.map((pred) => {
        if (!pred) return pred
        let pts = pred.ptsGlobal ?? 0
        let campeonAcertado = pred.campeonAcertado ?? false
        let goleadorAcertado = pred.goleadorAcertado ?? false

        // Solo calcular si no se ha resuelto aún
        if (!pred.resuelta) {
            campeonAcertado  = campeonReal  && pred.campeon?.trim().toLowerCase()  === campeonReal.trim().toLowerCase()
            goleadorAcertado = goleadorReal && pred.goleador?.trim().toLowerCase() === goleadorReal.trim().toLowerCase()
            pts = (campeonAcertado ? PTS_CAMPEON : 0) + (goleadorAcertado ? PTS_GOLEADOR : 0)
        }

        return { ...pred, ptsGlobal: pts, campeonAcertado, goleadorAcertado, resuelta: true }
    })

    // Guardar cada predicción actualizada
    for (const pred of actualizadas) {
        if (!pred?.usuarioId) continue
        await post(`/prediccion-global-personal/${pred.usuarioId}`, pred)
    }

    return actualizadas
}

export async function calcularRanking(grupo) {
    const preds = await getPredicionesPorGrupo(grupo.id)
    const mapa  = {}

    const miembrosVisibles = grupo.miembros.filter((m) => !esSuperAdminPorEmail(m.email))

    miembrosVisibles.forEach((m) => {
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