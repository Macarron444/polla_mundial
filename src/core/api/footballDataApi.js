import { WORLD_CUP_ID } from '../config/footballData.js'

function areaCodeAEmoji(code) {
    if (!code || code.length !== 2) return '🏳️'
    const offset = 0x1f1e6 - 65
    return (
        String.fromCodePoint(code.charCodeAt(0) + offset) +
        String.fromCodePoint(code.charCodeAt(1) + offset)
    )
}

function mapearEstado(status) {
    const m = {
        SCHEDULED: 'PROGRAMADO',
        TIMED: 'PROGRAMADO',
        IN_PLAY: 'EN_CURSO',
        PAUSED: 'EN_CURSO',
        LIVE: 'EN_CURSO',
        FINISHED: 'FINALIZADO',
        SUSPENDED: 'SUSPENDIDO',
        CANCELLED: 'SUSPENDIDO',
        POSTPONED: 'POSPUESTO',
    }
    return m[status] || 'PROGRAMADO'
}

function mapearFase(stage) {
    const m = {
        GROUP_STAGE: 'GRUPOS',
        ROUND_OF_16: 'OCTAVOS',
        QUARTER_FINALS: 'CUARTOS',
        SEMI_FINALS: 'SEMIFINAL',
        FINAL: 'FINAL',
        THIRD_PLACE: 'SEMIFINAL',
    }
    return m[stage] || 'GRUPOS'
}

function extraerGrupo(group) {
    if (!group) return '?'
    const m = group.match(/[A-Z]$/)
    return m ? m[0] : group
}

function mapearPartidoAPI(match) {
    const fecha = new Date(match.utcDate)
    const label =
        fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) +
        ' · ' +
        fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    return {
        id: match.id,
        local: match.homeTeam.id,
        visitante: match.awayTeam.id,
        golesL: match.score.fullTime.home,
        golesV: match.score.fullTime.away,
        fecha: label,
        fechaISO: match.utcDate,
        estado: mapearEstado(match.status),
        fase: mapearFase(match.stage),
    }
}

function mapearEquipoAPI(team, grupo = '?') {
    return {
        id: team.id,
        nombre: team.shortName || team.name,
        grupo,
        flag: areaCodeAEmoji(team.area?.code ?? ''),
    }
}

async function fdFetch(endpoint) {
    const res = await fetch(`/api${endpoint}`)
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`)
    return res.json()
}

export async function cargarDatosAPI() {
    const [matchesData, teamsData] = await Promise.all([
        fdFetch(`/competitions/${WORLD_CUP_ID}/matches`),
        fdFetch(`/competitions/${WORLD_CUP_ID}/teams`),
    ])

    const grupoMap = {}
    for (const m of matchesData.matches) {
        if (m.stage === 'GROUP_STAGE') {
            const g = extraerGrupo(m.group)
            grupoMap[m.homeTeam.id] = g
            grupoMap[m.awayTeam.id] = g
        }
    }

    const equipos = teamsData.teams.map((t) => mapearEquipoAPI(t, grupoMap[t.id] || '?'))
    const partidos = matchesData.matches.map(mapearPartidoAPI)
    return { equipos, partidos }
}
