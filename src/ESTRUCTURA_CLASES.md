# Reorganización de Clases TypeScript - Polla Mundial Dashboard

## Estructura de Clases por Contexto de Dominio

### 📦 Contexto: Usuario (Autenticación y Perfil)
**Archivos:**
- `usuario.ts` - Clase `Usuario` (Entidad de dominio)
- `Usuario.service.ts` - Clase `UsuarioService` (Lógica de negocio)

**Responsabilidades:**
- RF-01: Registro, autenticación, y gestión de perfil
- RNF-03: Seguridad con bcrypt y JWT
- RF-09: Configuración de canales de notificación

**Métodos principales:**
- `UsuarioService.registrar()` - Crear nuevo usuario
- `UsuarioService.autenticar()` - Validar credenciales y generar JWT
- `UsuarioService.obtenerPorId()` - Recuperar datos de perfil
- `UsuarioService.actualizarPerfil()` - Modificar información
- `UsuarioService.configurarNotificaciones()` - Preferencias de notificación

---

### ⚽ Contexto: Torneo (Equipos y Partidos)
**Archivos:**
- `Equipo.ts` - Clase `Equipo` (Entidad de dominio)
- `Partido.ts` - Clase `Partido` (Entidad de dominio)
- `Partido.service.ts` - Clase `PartidoService` (Lógica de negocio)

**Responsabilidades:**
- RF-05: Gestión de equipos y partidos
- RF-15: Ciclo de vida de partidos (PROGRAMADO → EN_CURSO → FINALIZADO)

**Métodos principales (PartidoService):**
- `PartidoService.registrarEquipo()` - Agregar equipo
- `PartidoService.obtenerEquiposPorGrupo()` - Filtrar por grupo
- `PartidoService.crearPartido()` - Crear nuevo partido
- `PartidoService.obtenerPartidosPorFase()` - Filtrar por fase
- `PartidoService.registrarResultado()` - Guardar resultado final

---

### 🎰 Contexto: Pollas (Gestión de Pollas)
**Archivos:**
- `Polla.ts` - Clase `Polla` (Entidad de dominio)
- `Polla.service.ts` - Clase `PollaService` (Lógica de negocio)

**Responsabilidades:**
- RF-02: Crear y gestionar pollas
- RF-03: Participación en pollas
- RF-10: Estados de pollas (ACTIVA, CERRADA, ARCHIVADA)
- RF-12: Reglas de puntuación personalizables
- RF-17: Roles de participantes (CREADOR, ADMINISTRADOR, PARTICIPANTE)

**Métodos principales (PollaService):**
- `PollaService.crearPolla()` - Crear nueva polla
- `PollaService.obtenerPollasPublicas()` - Listar pollas públicas
- `PollaService.agregarParticipante()` - Añadir usuario a polla
- `PollaService.actualizarReglas()` - Modificar reglas de puntuación
- `PollaService.cerrarPolla()` - Cerrar participación
- `PollaService.archivarPolla()` - Archivar polla completada

---

### 🎯 Contexto: Predicciones (Predicciones de Partidos)
**Archivos:**
- `Prediccion.ts` - Clase `Prediccion` (Entidad de dominio)
- `PrediccionGlobal.ts` - Clase `PrediccionGlobal` (Entidad de dominio)
- `Prediccion.service.ts` - Clase `PrediccionService` (Lógica de negocio)

**Responsabilidades:**
- RF-04: Crear y gestionar predicciones de partidos
- RF-07: Cálculo automático de puntajes
- RF-14: Predicción global del torneo (campeón, subcampeón, goleador)

**Métodos principales (PrediccionService):**
- `PrediccionService.crearPrediccion()` - Crear predicción de partido
- `PrediccionService.evaluarPrediccion()` - Evaluar contra resultado real
- `PrediccionService.calcularPuntajeUsuario()` - Sumar puntos totales
- `PrediccionService.crearPrediccionGlobal()` - Crear predicción global
- `PrediccionService.bloquearPrediccionesGlobales()` - Bloquear al inicio del torneo

---

### 📢 Contexto: Notificaciones (Canales de Comunicación)
**Archivos:**
- `Notificacion.ts` - Clase `Notificacion` (Entidad de dominio)
- `Notificacion.service.ts` - Clase `NotificacionService` (Lógica de negocio)

**Responsabilidades:**
- RF-09: Gestión de notificaciones por múltiples canales
  - PUSH (Service Worker + VAPID)
  - IN_APP (Toast/Banner)
  - EMAIL (SendGrid/SMTP)

**Métodos principales (NotificacionService):**
- `NotificacionService.crearNotificacion()` - Enviar notificación
- `NotificacionService.obtenerNotificacionesNoLeidas()` - Filtrar por estado
- `NotificacionService.obtenerNotificacionesPorTipo()` - Filtrar por canal
- `NotificacionService.marcarComoLeida()` - Marcar como visto
- `NotificacionService.marcarTodasComoLeidas()` - Marcar múltiples

---

### 📋 Archivos Compartidos
**Archivos:**
- `enums.ts` - Enumeraciones globales
- `Interfaces.ts` - Interfaces TypeScript

**Contenido de enums:**
- `EstadoPartido` - PROGRAMADO, EN_CURSO, FINALIZADO, SUSPENDIDO, POSPUESTO
- `FasePartido` - GRUPOS, DIECISEISAVOS, OCTAVOS, CUARTOS, SEMIFINAL, FINAL
- `EstadoPrediccion` - PENDIENTE, EXACTA, CORRECTA, FALLIDA
- `RolPolla` - CREADOR, ADMINISTRADOR, PARTICIPANTE
- `TipoNotificacion` - PUSH, IN_APP, EMAIL
- `VisibilidadPolla` - PUBLICA, PRIVADA
- `EstadoPolla` - ACTIVA, CERRADA, ARCHIVADA

---

## Patrones de Diseño Implementados

### 1. **Entity Pattern** 
Clases que implementan interfaces y contienen lógica de dominio:
- `Usuario`, `Equipo`, `Partido`, `Prediccion`, `PrediccionGlobal`, `Polla`, `Notificacion`

### 2. **Service Pattern**
Clases con métodos estáticos que manejan:
- Persistencia de datos (Maps simuladas)
- Lógica de negocio compleja
- Coordinar múltiples entidades

### 3. **Repository Pattern** (Simulado)
Cada Service actúa como repositorio:
- `new Map<id, Data>()` simula base de datos
- Métodos CRUD básicos
- Búsquedas y filtrados

### 4. **Factory Pattern**
Métodos estáticos para crear instancias:
- `UsuarioService.registrar()`
- `PollaService.crearPolla()`
- `PrediccionService.crearPrediccion()`

### 5. **Validation Pattern**
Validación integrada en métodos:
- Verificar existencia antes de actualizar
- Validar estados permitidos
- Lanzar errores descriptivos

---

## Instrucciones de Uso

### Crear un Usuario
```typescript
const usuario = await UsuarioService.registrar("user@example.com", "password123", "Juan");
const token = await UsuarioService.autenticar("user@example.com", "password123");
```

### Crear una Polla
```typescript
const polla = PollaService.crearPolla("Polla Amigos", VisibilidadPolla.PRIVADA);
PollaService.agregarParticipante(polla.id, usuarioId, RolPolla.PARTICIPANTE);
```

### Registrar Resultado de Partido
```typescript
const partido = PartidoService.crearPartido(1, 2, new Date(), FasePartido.GRUPOS);
const resultado = PartidoService.registrarResultado(partido.id, 2, 1);
```

### Evaluar Predicción
```typescript
const prediccion = PrediccionService.crearPrediccion(usuarioId, partidoId, pollaId, 2, 1);
const evaluada = PrediccionService.evaluarPrediccion(
  prediccion.id,
  2, // goles reales local
  1, // goles reales visitante
  reglas
);
```

---

## Requisitos Funcionales Cubiertos

| RF | Descripción | Clase/Service |
|----|-------------|---|
| RF-01 | Registro, autenticación, perfil | `Usuario`, `UsuarioService` |
| RF-02 | Crear y gestionar pollas | `Polla`, `PollaService` |
| RF-03 | Participación en pollas | `PollaService.agregarParticipante()` |
| RF-04 | Predicciones de partidos | `Prediccion`, `PrediccionService` |
| RF-05 | Equipos y partidos | `Equipo`, `Partido`, `PartidoService` |
| RF-07 | Cálculo de puntajes | `PrediccionService.evaluarPrediccion()` |
| RF-09 | Notificaciones multicanal | `Notificacion`, `NotificacionService` |
| RF-10 | Estados de pollas | `Polla`, `PollaService` |
| RF-12 | Reglas de puntuación | `Polla.actualizarReglas()` |
| RF-14 | Predicción global | `PrediccionGlobal`, `PrediccionService` |
| RF-15 | Ciclo de vida partidos | `Partido.avanzarEstado()` |
| RF-17 | Roles en pollas | `RolPolla`, `PollaService` |
| RF-18 | Historial de predicciones | Implementable con `PrediccionService.obtenerPrediccionesUsuario()` |

---

## Próximos Pasos

1. **Persistencia Real**: Reemplazar `Map` con Prisma, TypeORM u otro ORM
2. **Middleware**: Implementar autenticación JWT en rutas
3. **Validación**: Agregar librería como Zod o Yup
4. **Testing**: Crear test unitarios para cada Service
5. **API REST**: Crear endpoints en Express/Fastify
6. **UI React**: Conectar `polla_mundial_dashboard.jsx` con Services

