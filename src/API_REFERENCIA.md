# Guía Rápida de Referencia - API de Servicios

## 🚀 Quick Start

### Instalación e Importación
```typescript
// Importar toda la funcionalidad necesaria
import { UsuarioService } from './Usuario.service';
import { PartidoService } from './Partido.service';
import { PollaService } from './Polla.service';
import { PrediccionService } from './Prediccion.service';
import { NotificacionService } from './Notificacion.service';
```

---

## 👤 UsuarioService - API Completa

### `registrar(email, password, nombre): Promise<Usuario>`
Crear nuevo usuario
```typescript
const usuario = await UsuarioService.registrar(
  'juan@example.com',
  'Password123!',
  'Juan Diego'
);
```
**Lanza:** `Error` si email ya existe

---

### `autenticar(email, password): Promise<string>`
Obtener JWT token
```typescript
const token = await UsuarioService.autenticar(
  'juan@example.com',
  'Password123!'
);
// token: "eyJhbGciOiJIUzI1NiIs..."
```
**Lanza:** `Error` si credenciales inválidas

---

### `obtenerPorId(id): Usuario`
Obtener datos de usuario
```typescript
const usuario = UsuarioService.obtenerPorId(1);
console.log(usuario.nombre); // "Juan Diego"
```
**Retorna:** Instancia de Usuario
**Lanza:** `Error` si usuario no existe

---

### `actualizarPerfil(id, nombre): Usuario`
Actualizar nombre de usuario
```typescript
const actualizado = UsuarioService.actualizarPerfil(1, "Juan Nuevo");
```

---

### `configurarNotificaciones(id, push, email): Usuario`
Cambiar preferencias de notificación
```typescript
const usuario = UsuarioService.configurarNotificaciones(
  1,
  true,  // push activo
  false  // email inactivo
);
```

---

## ⚽ PartidoService - API Completa

### `registrarEquipo(equipo): Equipo`
Agregar equipo a la base de datos
```typescript
const argentina = PartidoService.registrarEquipo({
  id: 1,
  nombre: 'Argentina',
  grupo: 'A',
  codigoPais: 'ARG'
});
```

---

### `obtenerEquipo(id): Equipo | null`
Obtener equipo por ID
```typescript
const equipo = PartidoService.obtenerEquipo(1); // Argentina
```

---

### `obtenerEquiposPorGrupo(grupo): Equipo[]`
Listar equipos de un grupo
```typescript
const grupoA = PartidoService.obtenerEquiposPorGrupo('A');
// [Argentina, Francia, ...]
```

---

### `crearPartido(localId, visitanteId, fecha, fase): Partido`
Crear nuevo partido
```typescript
const partido = PartidoService.crearPartido(
  1,                           // Argentina (local)
  2,                           // Francia (visitante)
  new Date('2026-06-11'),     // Fecha
  FasePartido.GRUPOS          // Fase
);
```
**Estado inicial:** PROGRAMADO

---

### `obtenerPartido(id): Partido | null`
```typescript
const partido = PartidoService.obtenerPartido(1);
```

---

### `obtenerTodosPartidos(): Partido[]`
```typescript
const todos = PartidoService.obtenerTodosPartidos();
```

---

### `obtenerPartidosPorFase(fase): Partido[]`
```typescript
const octavos = PartidoService.obtenerPartidosPorFase(FasePartido.OCTAVOS);
```

---

### `obtenerPartidosPorEstado(estado): Partido[]`
```typescript
const finalizados = PartidoService.obtenerPartidosPorEstado(
  EstadoPartido.FINALIZADO
);
```

---

### `registrarResultado(id, golesLocal, golesVisitante): Partido`
Guardar resultado final
```typescript
const resultado = PartidoService.registrarResultado(
  1,    // ID partido
  2,    // Goles Argentina
  1     // Goles Francia
);
// Estado pasa a: FINALIZADO
```
**Lanza:** Error si partido no está EN_CURSO

---

## 🎰 PollaService - API Completa

### `crearPolla(nombre, visibilidad, reglasCustom?): Polla`
Crear nueva polla
```typescript
const polla = PollaService.crearPolla(
  'Mi Polla 2026',
  VisibilidadPolla.PRIVADA,
  {
    puntosExacto: 5,
    puntosResultadoCorrecto: 2,
    bonusPrediccionGlobal: 10
  }
);
// Retorna enlace: "polla_1718xxx_xyz123"
```

---

### `obtenerPolla(id): Polla | null`
```typescript
const polla = PollaService.obtenerPolla(1);
```

---

### `obtenerPollasPublicas(): Polla[]`
Listar todas las pollas públicas
```typescript
const publicas = PollaService.obtenerPollasPublicas();
```

---

### `obtenerPollaPorEnlace(enlace): Polla | null`
Buscar por enlace de invitación
```typescript
const polla = PollaService.obtenerPollaPorEnlace('polla_1718xxx_xyz123');
```

---

### `agregarParticipante(pollaId, usuarioId, rol?): ParticipacionPolla`
Agregar usuario a polla
```typescript
const participacion = PollaService.agregarParticipante(
  1,                          // pollaId
  2,                          // usuarioId
  RolPolla.PARTICIPANTE       // rol (default)
);
```
**Rol opciones:** CREADOR, ADMINISTRADOR, PARTICIPANTE

---

### `eliminarParticipante(pollaId, usuarioId): void`
```typescript
PollaService.eliminarParticipante(1, 2);
```

---

### `obtenerParticipantes(pollaId): ParticipacionPolla[]`
Listar todos los participantes
```typescript
const participantes = PollaService.obtenerParticipantes(1);
// [{ usuarioId: 1, rol: 'CREADOR', puntajeTotal: 15, ... }]
```

---

### `actualizarReglas(pollaId, reglas): IReglaPuntuacion`
Modificar reglas (solo antes de bloquear)
```typescript
const nuevasReglas = PollaService.actualizarReglas(1, {
  puntosExacto: 6
});
```
**Lanza:** Error si `reglasBlockeadas === true`

---

### `cerrarPolla(id): Polla`
Impedir nuevas participaciones
```typescript
const cerrada = PollaService.cerrarPolla(1);
// Estado pasa a: CERRADA
```

---

### `archivarPolla(id): Polla`
Archivar polla (ronda completada)
```typescript
const archivada = PollaService.archivarPolla(1);
// Estado pasa a: ARCHIVADA
```

---

## 🎯 PrediccionService - API Completa

### `crearPrediccion(usuarioId, partidoId, pollaId, golesL, golesV): Prediccion`
Crear predicción de partido
```typescript
const prediccion = PrediccionService.crearPrediccion(
  1,                          // usuarioId
  1,                          // partidoId
  1,                          // pollaId
  2,                          // golesLocalPredicho
  1                           // golesVisitantePredicho
);
// Estado: PENDIENTE
```

---

### `obtenerPrediccion(id): Prediccion | null`
```typescript
const prediccion = PrediccionService.obtenerPrediccion(1);
```

---

### `obtenerPrediccionesUsuario(usuarioId, pollaId): Prediccion[]`
Todas las predicciones de usuario en una polla
```typescript
const misprediccciones = PrediccionService.obtenerPrediccionesUsuario(1, 1);
```

---

### `obtenerPrediccionesPartido(partidoId): Prediccion[]`
Todas las predicciones para un partido
```typescript
const prediccionesPartido = PrediccionService.obtenerPrediccionesPartido(1);
```

---

### `evaluarPrediccion(id, golesRealL, golesRealV, reglas): Prediccion`
Evaluar predicción contra resultado real
```typescript
const reglas = { 
  puntosExacto: 3, 
  puntosResultadoCorrecto: 1,
  bonusPrediccionGlobal: 5
};

const evaluada = PrediccionService.evaluarPrediccion(
  1,            // prediccionId
  2,            // golesRealLocal
  1,            // golesRealVisitante
  reglas
);

// Si 2-1 predicho y 2-1 real → EXACTA (+3 pts)
// Si 2-1 predicho y 2-0 real → CORRECTA (+1 pts)
// Si 2-1 predicho y 0-2 real → FALLIDA (+0 pts)
```

---

### `calcularPuntajeUsuario(usuarioId, pollaId): number`
Puntaje total en una polla
```typescript
const puntaje = PrediccionService.calcularPuntajeUsuario(1, 1);
// 15 (suma de todas las predicciones + globales)
```

---

### `crearPrediccionGlobal(usuarioId, pollaId): PrediccionGlobal`
Crear predicción global del torneo
```typescript
const predGlobal = PrediccionService.crearPrediccionGlobal(1, 1);
// { id, usuarioId, pollaId, bloqueada: false, ... }
```

---

### `obtenerPrediccionGlobal(usuarioId, pollaId): PrediccionGlobal | null`
```typescript
const predGlobal = PrediccionService.obtenerPrediccionGlobal(1, 1);
```

---

### `actualizarPrediccionGlobal(usuarioId, pollaId, campeonId?, subcampeonId?, maxGoleador?): PrediccionGlobal`
Actualizar predicción global (si no está bloqueada)
```typescript
const actualizada = PrediccionService.actualizarPrediccionGlobal(
  1,      // usuarioId
  1,      // pollaId
  1,      // campeonId (Argentina)
  2,      // subcampeonId (Francia)
  'Messi' // maxGoleador
);
```
**Lanza:** Error si bloqueada === true

---

### `bloquearPrediccionesGlobales(pollaId): void`
Bloquear todas las predicciones globales de una polla
```typescript
PrediccionService.bloquearPrediccionesGlobales(1);
// Se llama al iniciarse el primer partido
```

---

## 📢 NotificacionService - API Completa

### `crearNotificacion(usuarioId, mensaje, tipo?): Notificacion`
Enviar notificación
```typescript
const notif = NotificacionService.crearNotificacion(
  1,
  '¡Tu predicción fue exacta! +3 puntos',
  TipoNotificacion.PUSH  // PUSH | IN_APP | EMAIL
);
```

---

### `obtenerNotificacion(id): Notificacion | null`
```typescript
const notif = NotificacionService.obtenerNotificacion(1);
```

---

### `obtenerNotificacionesUsuario(usuarioId): Notificacion[]`
Todas las notificaciones de un usuario (ordenadas por fecha)
```typescript
const miNotificaciones = NotificacionService.obtenerNotificacionesUsuario(1);
```

---

### `obtenerNotificacionesNoLeidas(usuarioId): Notificacion[]`
Pendientes de lectura
```typescript
const pendientes = NotificacionService.obtenerNotificacionesNoLeidas(1);
```

---

### `obtenerNotificacionesPorTipo(usuarioId, tipo): Notificacion[]`
Filtrar por canal
```typescript
const pushes = NotificacionService.obtenerNotificacionesPorTipo(
  1,
  TipoNotificacion.PUSH
);
```

---

### `marcarComoLeida(id): Notificacion`
Marcar una notificación como leída
```typescript
const leida = NotificacionService.marcarComoLeida(1);
```

---

### `marcarTodasComoLeidas(usuarioId): void`
Marcar todas como leídas
```typescript
NotificacionService.marcarTodasComoLeidas(1);
```

---

### `eliminarNotificacion(id): void`
```typescript
NotificacionService.eliminarNotificacion(1);
```

---

### `eliminarNotificacionesLeidas(usuarioId): void`
Limpiar notificaciones leídas
```typescript
NotificacionService.eliminarNotificacionesLeidas(1);
```

---

### `obtenerContenoLeidas(usuarioId): number`
Contador de no leídas
```typescript
const pendientes = NotificacionService.obtenerContenoLeidas(1);
// 5 notificaciones sin leer
```

---

## 📋 Enumeraciones

### EstadoPartido
```typescript
export enum EstadoPartido {
  PROGRAMADO = "PROGRAMADO",   // Aún no empieza
  EN_CURSO = "EN_CURSO",       // En juego
  FINALIZADO = "FINALIZADO",   // Terminado
  SUSPENDIDO = "SUSPENDIDO",   // Cancelado
  POSPUESTO = "POSPUESTO"      // Reprogramado
}
```

### EstadoPrediccion
```typescript
export enum EstadoPrediccion {
  PENDIENTE = "PENDIENTE",   // Aún sin evaluar
  EXACTA = "EXACTA",         // Marcador exacto
  CORRECTA = "CORRECTA",     // Ganador correcto
  FALLIDA = "FALLIDA"        // Falló
}
```

### RolPolla
```typescript
export enum RolPolla {
  CREADOR = "CREADOR",              // Todos los permisos
  ADMINISTRADOR = "ADMINISTRADOR",  // Modificar reglas
  PARTICIPANTE = "PARTICIPANTE"     // Solo predecir
}
```

### TipoNotificacion
```typescript
export enum TipoNotificacion {
  PUSH = "PUSH",      // Service Worker
  IN_APP = "IN_APP",  // Toast/Banner
  EMAIL = "EMAIL"     // Correo
}
```

### VisibilidadPolla
```typescript
export enum VisibilidadPolla {
  PUBLICA = "PUBLICA",   // Listada públicamente
  PRIVADA = "PRIVADA"    // Solo con enlace
}
```

### EstadoPolla
```typescript
export enum EstadoPolla {
  ACTIVA = "ACTIVA",
  CERRADA = "CERRADA",
  ARCHIVADA = "ARCHIVADA"
}
```

### FasePartido
```typescript
export enum FasePartido {
  GRUPOS = "GRUPOS",
  DIECISEISAVOS = "DIECISEISAVOS",
  OCTAVOS = "OCTAVOS",
  CUARTOS = "CUARTOS",
  SEMIFINAL = "SEMIFINAL",
  FINAL = "FINAL"
}
```

---

## 🆘 Manejo de Errores Común

```typescript
try {
  const usuario = await UsuarioService.registrar(
    'email@example.com',
    'password',
    'nombre'
  );
} catch (error) {
  if (error.message.includes('ya está registrado')) {
    // Manejar duplicado de email
  } else {
    // Error genérico
  }
}
```

---

## 💡 Patrones Útiles

### Obtener ranking ordenado
```typescript
const participantes = PollaService.obtenerParticipantes(pollaId);
const ranking = participantes
  .sort((a, b) => b.puntajeTotal - a.puntajeTotal)
  .map((p, i) => ({ posicion: i + 1, ...p }));
```

### Evaluar todos los partidos finalizados
```typescript
const partidos = PartidoService.obtenerPartidosPorEstado(EstadoPartido.FINALIZADO);
const reglas = pollaService.obtenerReglas(pollaId);

partidos.forEach(partido => {
  const predicciones = PrediccionService.obtenerPrediccionesPartido(partido.id);
  predicciones.forEach(pred => {
    PrediccionService.evaluarPrediccion(
      pred.id,
      partido.golesLocal,
      partido.golesVisitante,
      reglas
    );
  });
});
```

### Obtener resumen de usuario en polla
```typescript
const usuario = UsuarioService.obtenerPorId(usuarioId);
const predicciones = PrediccionService.obtenerPrediccionesUsuario(usuarioId, pollaId);
const puntaje = PrediccionService.calcularPuntajeUsuario(usuarioId, pollaId);
const participacion = PollaService.obtenerParticipantes(pollaId)
  .find(p => p.usuarioId === usuarioId);

const resumen = {
  usuario: usuario.nombre,
  puntaje,
  posicion: participacion.posicionRanking,
  prediccionesTotales: predicciones.length,
  prediccionesExactas: predicciones.filter(p => p.estado === 'EXACTA').length,
  prediccionesCorrectas: predicciones.filter(p => p.estado === 'CORRECTA').length
};
```

