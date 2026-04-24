# Arquitectura del Sistema - Diagrama de Clases

## 🏗️ Vista General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         POLLA MUNDIAL 2026                          │
│                    Sistema de Predicciones Deportivas                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │  CAPA DE PRESENTACIÓN (React)                     │
        │  - polla_mundial_dashboard.jsx                    │
        │  - Componentes: Header, Partidos, Ranking, etc    │
        └──────────────────────┬──────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────────┐
        │  CAPA DE LÓGICA DE NEGOCIO (Services)            │
        │  - UsuarioService                                 │
        │  - PartidoService                                 │
        │  - PollaService                                   │
        │  - PrediccionService                              │
        │  - NotificacionService                            │
        └──────────────────────┬──────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────────┐
        │  CAPA DE DOMINIO (Entidades/Agregados)           │
        │  - Usuario                                        │
        │  - Equipo / Partido                               │
        │  - Polla                                          │
        │  - Prediccion / PrediccionGlobal                  │
        │  - Notificacion                                   │
        └──────────────────────┬──────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────────┐
        │  CAPA DE DATOS (Simulada - Map)                  │
        │  - Base de datos en memoria                       │
        │  - Reemplazar con ORM (Prisma, TypeORM)           │
        └───────────────────────────────────────────────────┘
```

---

## 📊 Diagrama de Clases Detallado

### Contexto: Usuario (Autenticación)

```
┌──────────────────────────┐
│      IUsuario            │
│  (Interface)             │
├──────────────────────────┤
│ - id: number             │
│ - email: string          │
│ - nombre: string         │
│ - passwordHash: string   │
│ - notifPushActiva: bool  │
│ - notifEmailActiva: bool │
│ - fechaRegistro: Date    │
└────────────┬─────────────┘
             △
             │ implements
             │
    ┌────────────────────────┐
    │     Usuario            │
    │  (Entidad de Dominio)  │
    ├────────────────────────┤
    │ - id: number           │
    │ - email: string        │
    │ - nombre: string       │
    │ ... [propiedades]      │
    ├────────────────────────┤
    │ + constructor()        │
    │ + actualizarPerfil()   │
    │ + configurarNotif...() │
    │ + toJSON()             │
    └────────────┬───────────┘
                 │ used by
                 ▼
    ┌────────────────────────┐
    │ UsuarioService         │
    │ (Lógica de Negocio)    │
    ├────────────────────────┤
    │ - db: Map<number,...>  │
    ├────────────────────────┤
    │ + static registrar()   │
    │ + static autenticar()  │
    │ + static obtenerPorId()│
    │ ... [más métodos]      │
    └────────────────────────┘
```

### Contexto: Torneo (Equipos y Partidos)

```
    ┌────────────────┐
    │   IEquipo      │
    │ (Interface)    │
    └────────┬───────┘
             △ implements
             │
    ┌────────────────┐     ┌────────────────┐
    │    Equipo      │     │   IPartido     │
    │  (Entidad)     │     │ (Interface)    │
    ├────────────────┤     └────────┬───────┘
    │ - id           │              △ implements
    │ - nombre       │              │
    │ - grupo        │     ┌────────────────┐
    │ - codigoPais   │     │    Partido     │
    ├────────────────┤     │  (Entidad)     │
    │ + obtenerNom..│     ├────────────────┤
    │ + pertenecer..│     │ - id           │
    └────────┬──────┘     │ - equipoLocal..│
             │            │ - golesLocal   │
             │            │ - estado       │
             │            │ - fase         │
             │            ├────────────────┤
             │            │ + avanzarEsta..│
             │            │ + registrar... │
             └─────┬──────┴─────┬──────────┘
                   │            │ used by
                   ▼            ▼
        ┌──────────────────────────────────┐
        │  PartidoService                  │
        │  (Lógica de Negocio)             │
        ├──────────────────────────────────┤
        │ - db: Map<number, IPartido>      │
        │ - equipos: Map<number, IEquipo>  │
        ├──────────────────────────────────┤
        │ + static registrarEquipo()       │
        │ + static crearPartido()          │
        │ + static obtenerEquiposPorGrupo()│
        │ + static registrarResultado()    │
        └──────────────────────────────────┘
```

### Contexto: Pollas (Gestión)

```
    ┌────────────────────┐
    │     IPolla         │
    │   (Interface)      │
    └────────┬───────────┘
             △ implements
             │
    ┌────────────────────┐
    │      Polla         │
    │   (Entidad)        │
    ├────────────────────┤
    │ - id: number       │
    │ - nombre: string   │
    │ - estado: Enum     │
    │ - visibilidad: Enum│
    │ - reglas: {ptr}    │◄─── IReglaPuntuacion
    │ - participantes: {} │◄─── Map<id, ParticipacionPolla>
    ├────────────────────┤
    │ + agregarPartici..│
    │ + eliminarPartici..│
    │ + actualizarReglas│
    │ + cerrar()        │
    │ + obtenerParti...│
    └────────┬──────────┘
             │ used by
             ▼
    ┌────────────────────┐
    │  PollaService      │
    │ (Lógica de Negocio)│
    ├────────────────────┤
    │ - db: Map<...>     │
    │ - reglas: Map<...> │
    │ - participaciones: │
    ├────────────────────┤
    │ + crearPolla()     │
    │ + agregarParticip..│
    │ + cerrarPolla()    │
    │ + actualizarReglas│
    └────────────────────┘
```

### Contexto: Predicciones

```
    ┌─────────────────────┐
    │  IPrediccion        │
    │  (Interface)        │
    └──────────┬──────────┘
               △ implements
               │
    ┌──────────────────────┐       ┌────────────────────┐
    │   Prediccion         │       │ IPrediccionGlobal  │
    │  (Entidad)           │       │  (Interface)       │
    ├──────────────────────┤       └──────────┬─────────┘
    │ - id: number         │                  △ implements
    │ - usuarioId: number  │                  │
    │ - partidoId: number  │       ┌──────────────────────┐
    │ - pollaId: number    │       │ PrediccionGlobal     │
    │ - golesLocalPred...  │       │ (Entidad)            │
    │ - estado: Enum       │       ├──────────────────────┤
    │ - puntosObtenidos    │       │ - id: number         │
    ├──────────────────────┤       │ - usuarioId: number  │
    │ + evaluar()          │       │ - pollaId: number    │
    │ + obtenerGanadorPred│       │ - campeonId?: number │
    │ + estaFinalizada()   │       │ - maxGoleador: string│
    └──────────┬───────────┘       │ - bloqueada: boolean │
               │                   ├──────────────────────┤
               │                   │ + bloquear()         │
               │                   │ + actualizar()       │
               └──────────┬────────┴──────────┬───────────┘
                          │                   │ used by
                          ▼                   ▼
            ┌──────────────────────────────────────────┐
            │    PrediccionService                     │
            │    (Lógica de Negocio)                   │
            ├──────────────────────────────────────────┤
            │ - predicciones: Map<number, IPrediccion> │
            │ - predGlobales: Map<number, IPredGlobal> │
            ├──────────────────────────────────────────┤
            │ + crearPrediccion()                      │
            │ + evaluarPrediccion()                    │
            │ + calcularPuntajeUsuario()               │
            │ + actualizarPrediccionGlobal()           │
            │ + bloquearPrediccionesGlobales()         │
            └──────────────────────────────────────────┘
```

### Contexto: Notificaciones

```
    ┌──────────────────────┐
    │   INotificacion      │
    │   (Interface)        │
    └────────────┬─────────┘
                 △ implements
                 │
    ┌────────────────────────┐
    │   Notificacion         │
    │   (Entidad)            │
    ├────────────────────────┤
    │ - id: number           │
    │ - usuarioId: number    │
    │ - mensaje: string      │
    │ - tipo: TipoNotif (Enum)
    │ - leida: boolean       │
    │ - fechaEnvio: Date     │
    ├────────────────────────┤
    │ + marcarComoLeida()    │
    │ + esPush() / esInApp() │
    │ + esEmail()            │
    │ + obtenerTiempoTrans..│
    └────────────┬───────────┘
                 │ used by
                 ▼
    ┌──────────────────────────────┐
    │  NotificacionService         │
    │  (Lógica de Negocio)         │
    ├──────────────────────────────┤
    │ - notificaciones: Map<...>   │
    ├──────────────────────────────┤
    │ + crearNotificacion()        │
    │ + obtenerNoLeidas()          │
    │ + obtenerPorTipo()           │
    │ + marcarComoLeida()          │
    │ + marcarTodasComoLeidas()    │
    │ + eliminarNotificacion()     │
    └──────────────────────────────┘
```

---

## 🔗 Relaciones entre Contextos

```
┌─────────────┐
│   Usuario   │─────┐
└─────────────┘     │
                    ▼
┌─────────────┐   ┌──────────────────┐
│   Polla     │◄──┤ Participación    │
└─────────────┘   │  (muchos a muchos)
       │          └──────────────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
    ┌────────────┐  ┌──────────────┐
    │ Predicción │  │ Pred. Global │
    └────────────┘  └──────────────┘
         │
         └──────────┬──────────┐
                    ▼          ▼
              ┌─────────┐  ┌────────┐
              │ Partido │  │ Equipo │
              └─────────┘  └────────┘

Flujo de Notificaciones:
┌─────────────────────────────────────────────┐
│ Evento (partido finalizado, predicción eval)│
└──────────────────┬──────────────────────────┘
                   ▼
        ┌─────────────────────┐
        │ NotificacionService │
        │ crearNotificacion() │
        └──────────────────────┘
```

---

## 📈 Flujo de Datos Típico

### Caso de Uso 1: Registrar y Participar en Polla

```
1. Usuario registra
   UsuarioService.registrar() → Usuario + JWT

2. Usuario crea polla
   PollaService.crearPolla() → Polla

3. Usuario invita a amigos
   PollaService.agregarParticipante() → ParticipacionPolla

4. Se notifica a participantes
   NotificacionService.crearNotificacion(TipoNotificacion.EMAIL)
```

### Caso de Uso 2: Hacer Predicción y Evaluar

```
1. Partidos existen (creados por admin)
   PartidoService.crearPartido() → Partido

2. Usuario hace predicción
   PrediccionService.crearPrediccion() → Prediccion (PENDIENTE)

3. Partido termina
   PartidoService.registrarResultado() → Partido (FINALIZADO)

4. Sistema evalúa predicción
   PrediccionService.evaluarPrediccion() → Prediccion (EXACTA/CORRECTA/FALLIDA)

5. Se calcula puntaje
   PrediccionService.calcularPuntajeUsuario() → number

6. Se notifica resultado
   NotificacionService.crearNotificacion(TipoNotificacion.PUSH)
```

---

## 🎯 Patrón de Inyección de Dependencias Simulado

Aunque no usamos inyección explícita, el patrón es:

```typescript
// En un Service que usa otro Service:

class PollaService {
  static agregarParticipante(pollaId, usuarioId) {
    // Depende de UsuarioService para validar usuario
    const usuario = UsuarioService.obtenerPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no existe");
    
    // Luego hace su lógica
    ...
  }
}
```

---

## 🔄 Ciclos de Vida de Entidades Principales

### Ciclo Usuario
```
REGISTRADO → AUTENTICADO → ACTIVO → SUSPENDIDO/INACTIVO
```

### Ciclo Partido
```
PROGRAMADO → EN_CURSO → FINALIZADO
   ↓              ↓
SUSPENDIDO    SUSPENDIDO
   ↓              ↓
POSPUESTO
```

### Ciclo Predicción
```
PENDIENTE → EXACTA      (+3 pts)
         → CORRECTA     (+1 pts)
         → FALLIDA      (+0 pts)
```

### Ciclo Polla
```
ACTIVA → CERRADA → ARCHIVADA
  ↓
(participantes pueden predecir)
```

---

## 📋 Matriz de Métodos por Responsabilidad

| Responsabilidad | Service | Método |
|---|---|---|
| Autenticación | UsuarioService | autenticar() |
| Gestión de Perfil | UsuarioService | actualizarPerfil() |
| Crear Polla | PollaService | crearPolla() |
| Agregar Participante | PollaService | agregarParticipante() |
| Crear Partido | PartidoService | crearPartido() |
| Registrar Resultado | PartidoService | registrarResultado() |
| Hacer Predicción | PrediccionService | crearPrediccion() |
| Evaluar Predicción | PrediccionService | evaluarPrediccion() |
| Calcular Puntaje | PrediccionService | calcularPuntajeUsuario() |
| Crear Notificación | NotificacionService | crearNotificacion() |
| Marcar como Leída | NotificacionService | marcarComoLeida() |

