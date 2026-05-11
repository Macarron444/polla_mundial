import { IPartido, IEquipo } from '../interfaces'
import { EstadoPartido, FasePartido } from '../enums'

const BASE_URL = 'https://api.football-data.org/v4'
const WORLD_CUP_ID = 2000

interface FDArea {
    id: number
    name: string
    code: string
    flag: string
}

interface FDTeam {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
    area: FDArea
}

interface FDScore {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT'
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
}

interface FDMatch {
    id: number
    utcDate: string
    status: string
    stage: string
    group: string | null
    homeTeam: FDTeam
    awayTeam: FDTeam
    score: FDScore
}

interface FDMatchesResponse {
    count: number
    filters: Record<string, string>
    matches: FDMatch[]
}

interface FDTeamsResponse {
    count: number
    teams: FDTeam[]
}

function mapearEstado(status: string): EstadoPartido {
    switch (status) {
        case 'SCHEDULED':
        case 'TIMED':
            return EstadoPartido.PROGRAMADO
        case 'IN_PLAY':
        case 'PAUSED':
        case 'LIVE':
            return EstadoPartido.EN_CURSO
        case 'FINISHED':
            return EstadoPartido.FINALIZADO
        case 'SUSPENDED':
        case 'CANCELLED':
            return EstadoPartido.SUSPENDIDO
        case 'POSTPONED':
            return EstadoPartido.POSPUESTO
        default:
            return EstadoPartido.PROGRAMADO
    }
}

function mapearFase(stage: string): FasePartido {
    switch (stage) {
        case 'GROUP_STAGE':
            return FasePartido.GRUPOS
        case 'ROUND_OF_16':
            return FasePartido.OCTAVOS
        case 'QUARTER_FINALS':
            return FasePartido.CUARTOS
        case 'SEMI_FINALS':
            return FasePartido.SEMIFINAL
        case 'FINAL':
            return FasePartido.FINAL
        case 'THIRD_PLACE':
            return FasePartido.SEMIFINAL
        default:
            return FasePartido.GRUPOS
    }
}

function extraerGrupo(group: string | null): string {
    if (!group) return '?'
    const match = group.match(/[A-Z]$/)
    return match ? match[0] : group
}

function areaCodeAEmoji(code: string): string {
    if (!code || code.length !== 2) return '🏳️'
    const offset = 0x1f1e6 - 65
    const c1 = String.fromCodePoint(code.charCodeAt(0) + offset)
    const c2 = String.fromCodePoint(code.charCodeAt(1) + offset)
    return c1 + c2
}

function mapearEquipo(team: FDTeam, grupo: string): IEquipo {
    return {
        id: team.id,
        nombre: team.shortName || team.name,
        grupo,
        codigoPais: team.tla,
        flag: areaCodeAEmoji(team.area?.code ?? ''),
    }
}

function mapearPartido(match: FDMatch): IPartido {
    return {
        id: match.id,
        equipoLocalId: match.homeTeam.id,
        equipoVisitanteId: match.awayTeam.id,
        golesLocal: match.score.fullTime.home,
        golesVisitante: match.score.fullTime.away,
        fechaHora: new Date(match.utcDate),
        estado: mapearEstado(match.status),
        fase: mapearFase(match.stage),
    }
}

export class FootballDataService {
    private apiKey: string
    private headers: Record<string, string>

    constructor(apiKey: string) {
        this.apiKey = apiKey
        this.headers = {
            'X-Auth-Token': this.apiKey,
            'Content-Type': 'application/json',
        }
    }

    private async get<T>(endpoint: string): Promise<T> {
        const url = `${BASE_URL}${endpoint}`
        const res = await fetch(url, { headers: this.headers })

        if (!res.ok) {
            const body = await res.text()
            throw new Error(`football-data.org [${res.status}]: ${body}`)
        }

        return res.json() as Promise<T>
    }

    async obtenerPartidosMundial(): Promise<IPartido[]> {
        const data = await this.get<FDMatchesResponse>(`/competitions/${WORLD_CUP_ID}/matches`)
        return data.matches.map(mapearPartido)
    }

    async obtenerPartidosPorEstado(estado: EstadoPartido): Promise<IPartido[]> {
        const statusMap: Record<EstadoPartido, string> = {
            [EstadoPartido.PROGRAMADO]: 'SCHEDULED,TIMED',
            [EstadoPartido.EN_CURSO]: 'IN_PLAY,PAUSED,LIVE',
            [EstadoPartido.FINALIZADO]: 'FINISHED',
            [EstadoPartido.SUSPENDIDO]: 'SUSPENDED,CANCELLED',
            [EstadoPartido.POSPUESTO]: 'POSTPONED',
        }
        const status = statusMap[estado]
        const data = await this.get<FDMatchesResponse>(
            `/competitions/${WORLD_CUP_ID}/matches?status=${status}`
        )
        return data.matches.map(mapearPartido)
    }

    async obtenerPartidosHoy(): Promise<IPartido[]> {
        const hoy = new Date().toISOString().split('T')[0]
        const data = await this.get<FDMatchesResponse>(
            `/competitions/${WORLD_CUP_ID}/matches?dateFrom=${hoy}&dateTo=${hoy}`
        )
        return data.matches.map(mapearPartido)
    }

    async obtenerPartido(matchId: number): Promise<IPartido> {
        const data = await this.get<{ match: FDMatch }>(`/matches/${matchId}`)
        return mapearPartido(data.match)
    }

    async obtenerEquiposMundial(): Promise<IEquipo[]> {
        const data = await this.get<FDTeamsResponse>(`/competitions/${WORLD_CUP_ID}/teams`)
        return data.teams.map((team) => mapearEquipo(team, '?'))
    }

    async obtenerEquiposConGrupo(): Promise<IEquipo[]> {
        const [teamsData, matchesData] = await Promise.all([
            this.get<FDTeamsResponse>(`/competitions/${WORLD_CUP_ID}/teams`),
            this.get<FDMatchesResponse>(`/competitions/${WORLD_CUP_ID}/matches?stage=GROUP_STAGE`),
        ])

        const grupoMap = new Map<number, string>()
        for (const match of matchesData.matches) {
            const grupo = extraerGrupo(match.group)
            grupoMap.set(match.homeTeam.id, grupo)
            grupoMap.set(match.awayTeam.id, grupo)
        }

        return teamsData.teams.map((team) => mapearEquipo(team, grupoMap.get(team.id) ?? '?'))
    }

    async sincronizarTodo(): Promise<{ partidos: IPartido[]; equipos: IEquipo[] }> {
        const [partidos, equipos] = await Promise.all([
            this.obtenerPartidosMundial(),
            this.obtenerEquiposConGrupo(),
        ])
        return { partidos, equipos }
    }
}

export function crearServicioFootball(apiKey: string): FootballDataService {
    return new FootballDataService(apiKey)
}
