/** RF-15 — Ciclo de vida de un partido */
export enum EstadoPartido {
    PROGRAMADO = 'PROGRAMADO',
    EN_CURSO = 'EN_CURSO',
    FINALIZADO = 'FINALIZADO',
    SUSPENDIDO = 'SUSPENDIDO',
    POSPUESTO = 'POSPUESTO',
}

/** RF-13 — Fases del torneo */
export enum FasePartido {
    GRUPOS = 'GRUPOS',
    DIECISEISAVOS = 'DIECISEISAVOS',
    OCTAVOS = 'OCTAVOS',
    CUARTOS = 'CUARTOS',
    SEMIFINAL = 'SEMIFINAL',
    FINAL = 'FINAL',
}

/** RF-04 / RF-07 — Resultado de evaluar una prediccion */
export enum EstadoPrediccion {
    PENDIENTE = 'PENDIENTE',
    EXACTA = 'EXACTA',
    CORRECTA = 'CORRECTA',
    FALLIDA = 'FALLIDA',
}

/** RF-17 — Roles dentro de una polla */
export enum RolPolla {
    CREADOR = 'CREADOR',
    ADMINISTRADOR = 'ADMINISTRADOR',
    PARTICIPANTE = 'PARTICIPANTE',
}

/** RF-09 — Canales de notificacion */
export enum TipoNotificacion {
    PUSH = 'PUSH',
    IN_APP = 'IN_APP',
    EMAIL = 'EMAIL',
}

/** RF-02 — Visibilidad de una polla */
export enum VisibilidadPolla {
    PUBLICA = 'PUBLICA',
    PRIVADA = 'PRIVADA',
}

/** RF-10 — Estado de una polla */
export enum EstadoPolla {
    ACTIVA = 'ACTIVA',
    CERRADA = 'CERRADA',
    ARCHIVADA = 'ARCHIVADA',
}
