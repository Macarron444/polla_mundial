import { IPartido, IEquipo } from "./Interfaces";
import { EstadoPartido, FasePartido } from "./enums";

// ── CONFIGURACIÓN ──────────────────────────────────────────────────────────────

const BASE_URL      = "https://api.football-data.org/v4";
const WORLD_CUP_ID  = 2000; // FIFA World Cup

// ── TIPOS INTERNOS DE LA API ───────────────────────────────────────────────────

interface FDArea {
  id: number;
  name: string;
  code: string;   // ISO "ARG", "BRA"
  flag: string;   // URL de la bandera
}

interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;    // código 3 letras
  crest: string;  // URL escudo
  area: FDArea;
}

interface FDScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  fullTime: { home: number | null; away: number | null };
  halfTime:  { home: number | null; away: number | null };
}

interface FDMatch {
  id: number;
  utcDate: string;          // ISO 8601
  status: string;           // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | SUSPENDED | POSTPONED | CANCELLED
  stage: string;            // GROUP_STAGE | ROUND_OF_16 | QUARTER_FINALS | SEMI_FINALS | FINAL | etc.
  group: string | null;     // "Group A" | null en fases eliminatorias
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
}

interface FDMatchesResponse {
  count: number;
  filters: Record<string, string>;
  matches: FDMatch[];
}

interface FDTeamsResponse {
  count: number;
  teams: FDTeam[];
}

// ── MAPEO: API → DOMINIO ───────────────────────────────────────────────────────

/**
 * Convierte el status de football-data.org al EstadoPartido del dominio.
 * Equivalente dashboard: estados PROGRAMADO | EN_CURSO | FINALIZADO
 */
function mapearEstado(status: string): EstadoPartido {
  switch (status) {
    case "SCHEDULED":
    case "TIMED":
      return EstadoPartido.PROGRAMADO;
    case "IN_PLAY":
    case "PAUSED":
    case "LIVE":
      return EstadoPartido.EN_CURSO;
    case "FINISHED":
      return EstadoPartido.FINALIZADO;
    case "SUSPENDED":
    case "CANCELLED":
      return EstadoPartido.SUSPENDIDO;
    case "POSTPONED":
      return EstadoPartido.POSPUESTO;
    default:
      return EstadoPartido.PROGRAMADO;
  }
}

/**
 * Convierte el stage de football-data.org a la FasePartido del dominio.
 * Equivalente dashboard: GRUPOS | OCTAVOS | CUARTOS | SEMIFINAL | FINAL
 */
function mapearFase(stage: string): FasePartido {
  switch (stage) {
    case "GROUP_STAGE":
      return FasePartido.GRUPOS;
    case "ROUND_OF_16":
      return FasePartido.OCTAVOS;
    case "QUARTER_FINALS":
      return FasePartido.CUARTOS;
    case "SEMI_FINALS":
      return FasePartido.SEMIFINAL;
    case "FINAL":
      return FasePartido.FINAL;
    case "THIRD_PLACE":
      return FasePartido.SEMIFINAL; // 3er puesto se ubica como fase de semifinal
    default:
      return FasePartido.GRUPOS;
  }
}

/**
 * Extrae la letra del grupo desde el campo "group" de la API.
 * Ej: "Group A" → "A", null → "?"
 */
function extraerGrupo(group: string | null): string {
  if (!group) return "?";
  const match = group.match(/[A-Z]$/);
  return match ? match[0] : group;
}

/**
 * Convierte el código ISO 3166-1 alpha-3 en emoji de bandera.
 * Ej: "ARG" → "🇦🇷"
 */
function codigoAEmoji(tla: string): string {
  // Los emojis de banderas usan Regional Indicator Symbols (U+1F1E6 - U+1F1FF)
  // El código TLA de football-data es alpha-2 del área, así que usamos area.code
  return "";  // Se calcula dinámicamente abajo
}

function areaCodeAEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  const offset = 0x1F1E6 - 65; // 'A'.charCodeAt(0) = 65
  const c1 = String.fromCodePoint(code.charCodeAt(0) + offset);
  const c2 = String.fromCodePoint(code.charCodeAt(1) + offset);
  return c1 + c2;
}

/**
 * Convierte un FDTeam en IEquipo del dominio.
 */
function mapearEquipo(team: FDTeam, grupo: string): IEquipo {
  return {
    id:          team.id,
    nombre:      team.shortName || team.name,
    grupo:       grupo,
    codigoPais:  team.tla,
    flag:        areaCodeAEmoji(team.area?.code ?? ""),
  };
}

/**
 * Convierte un FDMatch en IPartido del dominio.
 */
function mapearPartido(match: FDMatch): IPartido {
  return {
    id:               match.id,
    equipoLocalId:    match.homeTeam.id,
    equipoVisitanteId: match.awayTeam.id,
    golesLocal:       match.score.fullTime.home,
    golesVisitante:   match.score.fullTime.away,
    fechaHora:        new Date(match.utcDate),
    estado:           mapearEstado(match.status),
    fase:             mapearFase(match.stage),
  };
}

// ── SERVICIO PRINCIPAL ─────────────────────────────────────────────────────────

export class FootballDataService {
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(apiKey: string) {
    this.apiKey  = apiKey;
    this.headers = {
      "X-Auth-Token": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  // ── MÉTODO BASE ──────────────────────────────────────────────────────────────

  private async get<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, { headers: this.headers });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`football-data.org [${res.status}]: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  // ── PARTIDOS ─────────────────────────────────────────────────────────────────

  /**
   * RF-06 — Obtiene todos los partidos del Mundial.
   * Equivalente dashboard: initialPartidos / setPartidos
   *
   * @returns Array de IPartido mapeados al dominio
   */
  async obtenerPartidosMundial(): Promise<IPartido[]> {
    const data = await this.get<FDMatchesResponse>(
      `/competitions/${WORLD_CUP_ID}/matches`
    );
    return data.matches.map(mapearPartido);
  }

  /**
   * Obtiene partidos filtrados por estado (PROGRAMADO, EN_CURSO, FINALIZADO).
   * Útil para actualizar solo partidos activos.
   */
  async obtenerPartidosPorEstado(estado: EstadoPartido): Promise<IPartido[]> {
    // Mapeo inverso: EstadoPartido → status de la API
    const statusMap: Record<EstadoPartido, string> = {
      [EstadoPartido.PROGRAMADO]:  "SCHEDULED,TIMED",
      [EstadoPartido.EN_CURSO]:    "IN_PLAY,PAUSED,LIVE",
      [EstadoPartido.FINALIZADO]:  "FINISHED",
      [EstadoPartido.SUSPENDIDO]:  "SUSPENDED,CANCELLED",
      [EstadoPartido.POSPUESTO]:   "POSTPONED",
    };
    const status = statusMap[estado];
    const data = await this.get<FDMatchesResponse>(
      `/competitions/${WORLD_CUP_ID}/matches?status=${status}`
    );
    return data.matches.map(mapearPartido);
  }

  /**
   * Obtiene partidos de hoy y mañana (útil para mostrar "próximos partidos").
   */
  async obtenerPartidosHoy(): Promise<IPartido[]> {
    const hoy   = new Date().toISOString().split("T")[0];
    const data  = await this.get<FDMatchesResponse>(
      `/competitions/${WORLD_CUP_ID}/matches?dateFrom=${hoy}&dateTo=${hoy}`
    );
    return data.matches.map(mapearPartido);
  }

  /**
   * Obtiene un partido específico por ID.
   * Útil para sincronizar el resultado de un partido finalizado.
   */
  async obtenerPartido(matchId: number): Promise<IPartido> {
    const data = await this.get<{ match: FDMatch }>(`/matches/${matchId}`);
    return mapearPartido(data.match);
  }

  // ── EQUIPOS ──────────────────────────────────────────────────────────────────

  /**
   * RF-05 — Obtiene todos los equipos participantes del Mundial.
   * Equivalente dashboard: EQUIPOS (array estático)
   *
   * @returns Array de IEquipo mapeados al dominio
   */
  async obtenerEquiposMundial(): Promise<IEquipo[]> {
    const data    = await this.get<FDTeamsResponse>(
      `/competitions/${WORLD_CUP_ID}/teams`
    );
    // El grupo se extrae de los partidos; aquí usamos "?" como placeholder
    // para completar con obtenerPartidosMundial() si se necesita el grupo exacto
    return data.teams.map(team => mapearEquipo(team, "?"));
  }

  /**
   * Obtiene equipos CON información de grupo, cruzando datos de partidos.
   * Más completo pero requiere 2 llamadas a la API.
   */
  async obtenerEquiposConGrupo(): Promise<IEquipo[]> {
    const [teamsData, matchesData] = await Promise.all([
      this.get<FDTeamsResponse>(`/competitions/${WORLD_CUP_ID}/teams`),
      this.get<FDMatchesResponse>(
        `/competitions/${WORLD_CUP_ID}/matches?stage=GROUP_STAGE`
      ),
    ]);

    // Mapa teamId → grupo
    const grupoMap = new Map<number, string>();
    for (const match of matchesData.matches) {
      const grupo = extraerGrupo(match.group);
      grupoMap.set(match.homeTeam.id, grupo);
      grupoMap.set(match.awayTeam.id, grupo);
    }

    return teamsData.teams.map(team =>
      mapearEquipo(team, grupoMap.get(team.id) ?? "?")
    );
  }

  // ── SINCRONIZACIÓN COMPLETA ───────────────────────────────────────────────────

  /**
   * RF-06 — Sincronización completa: trae partidos + equipos en paralelo.
   * Úsalo al iniciar la app o al refrescar datos.
   *
   * Equivalente dashboard: carga inicial de initialPartidos + EQUIPOS
   */
  async sincronizarTodo(): Promise<{
    partidos: IPartido[];
    equipos: IEquipo[];
  }> {
    const [partidos, equipos] = await Promise.all([
      this.obtenerPartidosMundial(),
      this.obtenerEquiposConGrupo(),
    ]);
    return { partidos, equipos };
  }
}

// ── INSTANCIA SINGLETON (opcional) ────────────────────────────────────────────

/**
 * Exporta una función factory para evitar exponer la API key en el módulo.
 * Uso:
 *   import { crearServicioFootball } from "./FootballData.service";
 *   const fd = crearServicioFootball(process.env.FOOTBALL_DATA_API_KEY!);
 */
export function crearServicioFootball(apiKey: string): FootballDataService {
  return new FootballDataService(apiKey);
}