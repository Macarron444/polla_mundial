import {
  EstadoPartido, EstadoPolla, EstadoPrediccion,
  FasePartido, RolPolla, TipoNotificacion, VisibilidadPolla,
} from "./enums";

// ── RF-01 ────────────────────────────────────────────────────────────────────
export interface IUsuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  notifPushActiva: boolean;
  notifEmailActiva: boolean;
  fechaRegistro: Date;
}

// ── RF-12 ────────────────────────────────────────────────────────────────────
export interface IReglaPuntuacion {
  puntosExacto: number;            // default 3
  puntosResultadoCorrecto: number; // default 1
  puntosFallo: number;             // default 0
  bonusPrediccionGlobal: number;   // default 5
  bloqueada: boolean;
}

// ── RF-02 ────────────────────────────────────────────────────────────────────
export interface IPolla {
  id: number;
  nombre: string;
  enlaceInvitacion: string;
  visibilidad: VisibilidadPolla;
  estado: EstadoPolla;
  fechaCreacion: Date;
  reglasBlockeadas: boolean;
}

// ── RF-03 / RF-17 ────────────────────────────────────────────────────────────
export interface IParticipacionPolla {
  usuarioId: number;
  pollaId: number;
  rol: RolPolla;
  fechaUnion: Date;
  puntajeTotal: number;
  posicionRanking: number;
}

// ── RF-05 ────────────────────────────────────────────────────────────────────
export interface IEquipo {
  id: number;
  nombre: string;
  grupo: string;       // letra del grupo: A-L
  codigoPais: string;  // ISO 3166-1 alpha-3: "COL", "BRA"
  flag?: string;       // emoji de bandera para la UI
}

export interface IPartido {
  id: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  golesLocal: number | null;      // null hasta finalizar
  golesVisitante: number | null;  // null hasta finalizar
  fechaHora: Date;
  estado: EstadoPartido;
  fase: FasePartido;
}

// ── RF-04 / RF-13 ────────────────────────────────────────────────────────────
export interface IPrediccion {
  id: number;
  usuarioId: number;
  partidoId: number;
  pollaId: number;
  golesLocalPredicho: number;
  golesVisitantePredicho: number;
  equipoClasificadoId?: number;  // solo en fases eliminatorias (RF-13)
  estado: EstadoPrediccion;
  puntosObtenidos: number;
}

// ── RF-14 ────────────────────────────────────────────────────────────────────
export interface IPrediccionGlobal {
  id: number;
  usuarioId: number;
  pollaId: number;
  campeonId?: number;
  subcampeonId?: number;
  maxGoleador: string;
  bloqueada: boolean;
  puntosObtenidos: number;
}

// ── RF-18 ────────────────────────────────────────────────────────────────────
export interface IHistorialPredicciones {
  exactas: number;
  correctas: number;
  fallidas: number;
}

// ── RF-09 ────────────────────────────────────────────────────────────────────
export interface INotificacion {
  id: number;
  usuarioId: number;
  mensaje: string;
  tipo: TipoNotificacion;
  leida: boolean;
  fechaEnvio: Date;
}

// ── RF-06 ────────────────────────────────────────────────────────────────────
export interface IResultadoAPI {
  fuente: string;
  exitoso: boolean;
  fechaConsulta: Date;
  rawData: string;
}
