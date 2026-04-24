/** RF-15 — Ciclo de vida de un partido */
export enum EstadoPartido {
  PROGRAMADO  = "PROGRAMADO",   // predicciones abiertas
  EN_CURSO    = "EN_CURSO",     // predicciones bloqueadas
  FINALIZADO  = "FINALIZADO",   // puntajes calculados
  SUSPENDIDO  = "SUSPENDIDO",   // sin puntaje hasta resolución
  POSPUESTO   = "POSPUESTO",    // predicciones reabiertas con nueva fecha
}

/** RF-13 — Fases del torneo */
export enum FasePartido {
  GRUPOS        = "GRUPOS",
  DIECISEISAVOS = "DIECISEISAVOS",
  OCTAVOS       = "OCTAVOS",
  CUARTOS       = "CUARTOS",
  SEMIFINAL     = "SEMIFINAL",
  FINAL         = "FINAL",
}

/** RF-04 / RF-07 — Resultado de evaluar una predicción */
export enum EstadoPrediccion {
  PENDIENTE = "PENDIENTE",  // partido aún no finalizado
  EXACTA    = "EXACTA",     // marcador exacto → máximos puntos
  CORRECTA  = "CORRECTA",   // ganador/empate correcto → puntos parciales
  FALLIDA   = "FALLIDA",    // ningún criterio acertado
}

/** RF-17 — Roles dentro de una polla */
export enum RolPolla {
  CREADOR        = "CREADOR",        // todos los permisos + transferir propiedad
  ADMINISTRADOR  = "ADMINISTRADOR",  // modificar reglas, eliminar participantes
  PARTICIPANTE   = "PARTICIPANTE",   // predecir y ver ranking
}

/** RF-09 — Canales de notificación */
export enum TipoNotificacion {
  PUSH   = "PUSH",    // Service Worker + VAPID, requiere consentimiento
  IN_APP = "IN_APP",  // toast/banner, siempre activo
  EMAIL  = "EMAIL",   // SendGrid/SMTP, configurable por usuario
}

/** RF-02 — Visibilidad de una polla */
export enum VisibilidadPolla {
  PUBLICA  = "PUBLICA",
  PRIVADA  = "PRIVADA",
}

/** RF-10 — Estado de una polla */
export enum EstadoPolla {
  ACTIVA    = "ACTIVA",
  CERRADA   = "CERRADA",
  ARCHIVADA = "ARCHIVADA",
}