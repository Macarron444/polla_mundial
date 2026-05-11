import {
    EstadoPartido,
    EstadoPolla,
    EstadoPrediccion,
    FasePartido,
    RolPolla,
    TipoNotificacion,
    VisibilidadPolla,
} from '../enums'

export interface IUsuario {
    id: number
    nombre: string
    email: string
    passwordHash: string
    notifPushActiva: boolean
    notifEmailActiva: boolean
    fechaRegistro: Date
}

export interface IReglaPuntuacion {
    puntosExacto: number
    puntosResultadoCorrecto: number
    puntosFallo: number
    bonusPrediccionGlobal: number
    bloqueada: boolean
}

export interface IPolla {
    id: number
    nombre: string
    enlaceInvitacion: string
    visibilidad: VisibilidadPolla
    estado: EstadoPolla
    fechaCreacion: Date
    reglasBlockeadas: boolean
}

export interface IParticipacionPolla {
    usuarioId: number
    pollaId: number
    rol: RolPolla
    fechaUnion: Date
    puntajeTotal: number
    posicionRanking: number
}

export interface IEquipo {
    id: number
    nombre: string
    grupo: string
    codigoPais: string
    flag?: string
}

export interface IPartido {
    id: number
    equipoLocalId: number
    equipoVisitanteId: number
    golesLocal: number | null
    golesVisitante: number | null
    fechaHora: Date
    estado: EstadoPartido
    fase: FasePartido
}

export interface IPrediccion {
    id: number
    usuarioId: number
    partidoId: number
    pollaId: number
    golesLocalPredicho: number
    golesVisitantePredicho: number
    equipoClasificadoId?: number
    estado: EstadoPrediccion
    puntosObtenidos: number
}

export interface IPrediccionGlobal {
    id: number
    usuarioId: number
    pollaId: number
    campeonId?: number
    subcampeonId?: number
    maxGoleador: string
    bloqueada: boolean
    puntosObtenidos: number
}

export interface IHistorialPredicciones {
    exactas: number
    correctas: number
    fallidas: number
}

export interface INotificacion {
    id: number
    usuarioId: number
    mensaje: string
    tipo: TipoNotificacion
    leida: boolean
    fechaEnvio: Date
}

export interface IResultadoAPI {
    fuente: string
    exitoso: boolean
    fechaConsulta: Date
    rawData: string
}
