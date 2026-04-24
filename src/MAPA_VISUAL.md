# 🗺️ Mapa Visual - Dónde Está Todo

## 📍 Localización de Archivos

```
📂 UPTC/ELECTIVA III/
│
├─ 📋 PUNTO DE ENTRADA
│  └─ README.md ⭐ ← COMIENZA AQUÍ (resumen ejecutivo)
│
├─ 📚 DOCUMENTACIÓN COMPLETA
│  ├─ INDICE_DOCUMENTACION.md ← Índice de toda la documentación
│  ├─ ESTRUCTURA_CLASES.md ← Arquitectura y diseño
│  ├─ RESUMEN_ARCHIVOS.md ← Inventario de archivos
│  ├─ DIAGRAMA_ARQUITECTURA.md ← Visuales y diagramas
│  └─ API_REFERENCIA.md ← Referencia rápida de métodos
│
├─ 🧪 CÓDIGO DE EJEMPLO
│  └─ ejemplos-uso.ts ← 6 ejemplos funcionales
│
├─ 📦 CONFIGURACIÓN (sin cambios)
│  ├─ enums.ts
│  └─ Interfaces.ts
│
├─ 👤 CONTEXTO: USUARIO (Autenticación)
│  ├─ usuario.ts (entidad)
│  └─ Usuario.service.ts (lógica de negocio)
│
├─ ⚽ CONTEXTO: TORNEO (Equipos y Partidos)
│  ├─ Equipo.ts (entidad)
│  ├─ Partido.ts (entidad)
│  └─ Partido.service.ts (lógica de negocio)
│
├─ 🎰 CONTEXTO: POLLAS (Gestión)
│  ├─ Polla.ts (entidad)
│  └─ Polla.service.ts (lógica de negocio)
│
├─ 🎯 CONTEXTO: PREDICCIONES
│  ├─ Prediccion.ts (entidad)
│  ├─ PrediccionGlobal.ts (entidad)
│  └─ Prediccion.service.ts (lógica de negocio)
│
├─ 📢 CONTEXTO: NOTIFICACIONES
│  ├─ Notificacion.ts (entidad)
│  └─ Notificacion.service.ts (lógica de negocio)
│
└─ 🎨 FRONTEND (sin cambios)
   ├─ polla_mundial_dashboard.jsx
   └─ polla_mundial_dashboard.html
```

---

## 🧭 Navegación por Caso de Uso

### 🔑 "Quiero entender la arquitectura"
```
1. Abre: README.md (5 min)
2. Luego: ESTRUCTURA_CLASES.md (20 min)
3. Luego: DIAGRAMA_ARQUITECTURA.md (15 min)
```

### 👤 "Quiero trabajar con Usuarios"
```
Archivos:
  ├─ usuario.ts
  └─ Usuario.service.ts

Documentación:
  ├─ ESTRUCTURA_CLASES.md → sección "Contexto Usuario"
  ├─ API_REFERENCIA.md → sección "UsuarioService"
  └─ ejemplos-uso.ts → función "ejemploRegistroYAutenticacion()"

Métodos disponibles:
  ✓ registrar()
  ✓ autenticar()
  ✓ obtenerPorId()
  ✓ actualizarPerfil()
  ✓ configurarNotificaciones()
```

### ⚽ "Quiero trabajar con Partidos"
```
Archivos:
  ├─ Equipo.ts
  ├─ Partido.ts
  └─ Partido.service.ts

Documentación:
  ├─ ESTRUCTURA_CLASES.md → sección "Contexto Torneo"
  ├─ API_REFERENCIA.md → sección "PartidoService"
  └─ ejemplos-uso.ts → función "ejemploCrearEquiposYPartidos()"

Métodos disponibles:
  ✓ registrarEquipo()
  ✓ obtenerEquipo()
  ✓ obtenerEquiposPorGrupo()
  ✓ crearPartido()
  ✓ obtenerPartido()
  ✓ registrarResultado()
```

### 🎰 "Quiero trabajar con Pollas"
```
Archivos:
  ├─ Polla.ts
  └─ Polla.service.ts

Documentación:
  ├─ ESTRUCTURA_CLASES.md → sección "Contexto Pollas"
  ├─ API_REFERENCIA.md → sección "PollaService"
  └─ ejemplos-uso.ts → función "ejemploCrearPollaYParticipantes()"

Métodos disponibles:
  ✓ crearPolla()
  ✓ obtenerPolla()
  ✓ agregarParticipante()
  ✓ actualizarReglas()
  ✓ cerrarPolla()
```

### 🎯 "Quiero trabajar con Predicciones"
```
Archivos:
  ├─ Prediccion.ts
  ├─ PrediccionGlobal.ts
  └─ Prediccion.service.ts

Documentación:
  ├─ ESTRUCTURA_CLASES.md → sección "Contexto Predicciones"
  ├─ API_REFERENCIA.md → sección "PrediccionService"
  └─ ejemplos-uso.ts → funciones "ejemploHacerPredicciones()" y "ejemploRegistrarResultadosYEvaluar()"

Métodos disponibles:
  ✓ crearPrediccion()
  ✓ evaluarPrediccion()
  ✓ calcularPuntajeUsuario()
  ✓ crearPrediccionGlobal()
  ✓ actualizarPrediccionGlobal()
```

### 📢 "Quiero trabajar con Notificaciones"
```
Archivos:
  ├─ Notificacion.ts
  └─ Notificacion.service.ts

Documentación:
  ├─ ESTRUCTURA_CLASES.md → sección "Contexto Notificaciones"
  ├─ API_REFERENCIA.md → sección "NotificacionService"
  └─ ejemplos-uso.ts → función "ejemploGestionarNotificaciones()"

Métodos disponibles:
  ✓ crearNotificacion()
  ✓ obtenerNotificacionesUsuario()
  ✓ marcarComoLeida()
  ✓ obtenerNotificacionesPorTipo()
```

---

## 🎯 Flujos Comunes

### Flujo 1: Crear usuario y polla
```
1. UsuarioService.registrar()         → usuario.ts
2. PollaService.crearPolla()          → Polla.ts
3. PollaService.agregarParticipante() → Polla.ts
4. NotificacionService.crear...()     → Notificacion.ts
```

### Flujo 2: Crear partido y hacer predicción
```
1. PartidoService.registrarEquipo()   → Equipo.ts
2. PartidoService.crearPartido()      → Partido.ts
3. PrediccionService.crear...()       → Prediccion.ts
4. PrediccionService.crear...Global() → PrediccionGlobal.ts
```

### Flujo 3: Finalizar partido y evaluar
```
1. PartidoService.registrarResultado() → Partido.ts
2. PrediccionService.evaluar...()      → Prediccion.ts
3. PrediccionService.calcularPuntaje() → calcula score
4. NotificacionService.crear...()      → Notificacion.ts
```

---

## 📚 Cómo Leer la Documentación

### Lectura Rápida (15 minutos)
```
1. README.md (este punto)
2. API_REFERENCIA.md → busca tu método
3. ejemplos-uso.ts → copia y adapta
```

### Lectura Profunda (1 hora)
```
1. INDICE_DOCUMENTACION.md
2. ESTRUCTURA_CLASES.md
3. DIAGRAMA_ARQUITECTURA.md
4. API_REFERENCIA.md (completo)
5. ejemplos-uso.ts (todo)
```

### Lectura de Arquitecto (2 horas)
```
1. README.md
2. ESTRUCTURA_CLASES.md (completo)
3. DIAGRAMA_ARQUITECTURA.md (todos los diagramas)
4. RESUMEN_ARCHIVOS.md
5. ejemplos-uso.ts (todos los ejemplos)
6. Revisar código TypeScript de cada Service
```

---

## 🔍 Buscar por Requisito Funcional

### RF-01: Registro y Autenticación
```
Archivos: usuario.ts, Usuario.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-01
Métodos: registrar(), autenticar()
Ejemplo: ejemplos-uso.ts → ejemploRegistroYAutenticacion()
```

### RF-02: Crear y Gestionar Pollas
```
Archivos: Polla.ts, Polla.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-02
Métodos: crearPolla(), obtenerPolla()
Ejemplo: ejemplos-uso.ts → ejemploCrearPollaYParticipantes()
```

### RF-03: Participación en Pollas
```
Archivos: Polla.ts, Polla.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-03
Métodos: agregarParticipante(), eliminarParticipante()
Ejemplo: ejemplos-uso.ts → ejemploCrearPollaYParticipantes()
```

### RF-04: Predicciones
```
Archivos: Prediccion.ts, Prediccion.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-04
Métodos: crearPrediccion(), evaluarPrediccion()
Ejemplo: ejemplos-uso.ts → ejemploHacerPredicciones()
```

### RF-05: Equipos y Partidos
```
Archivos: Equipo.ts, Partido.ts, Partido.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-05
Métodos: registrarEquipo(), crearPartido()
Ejemplo: ejemplos-uso.ts → ejemploCrearEquiposYPartidos()
```

### RF-07: Cálculo de Puntajes
```
Archivos: Prediccion.ts, Prediccion.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-07
Métodos: evaluarPrediccion(), calcularPuntajeUsuario()
Ejemplo: ejemplos-uso.ts → ejemploRegistrarResultadosYEvaluar()
```

### RF-09: Notificaciones
```
Archivos: Notificacion.ts, Notificacion.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-09
Métodos: crearNotificacion(), marcarComoLeida()
Ejemplo: ejemplos-uso.ts → ejemploGestionarNotificaciones()
```

### RF-10: Estados de Pollas
```
Archivos: Polla.ts, Polla.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-10
Métodos: cerrarPolla(), archivarPolla()
Ejemplo: ejemplos-uso.ts → ejemploCrearPollaYParticipantes()
```

### RF-12: Reglas de Puntuación
```
Archivos: Polla.ts, Polla.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-12
Métodos: actualizarReglas(), bloquearReglas()
Ejemplo: ejemplos-uso.ts → ejemploCrearPollaYParticipantes()
```

### RF-14: Predicción Global
```
Archivos: PrediccionGlobal.ts, Prediccion.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-14
Métodos: crearPrediccionGlobal(), actualizarPrediccionGlobal()
Ejemplo: ejemplos-uso.ts → ejemploHacerPredicciones()
```

### RF-15: Ciclo de Vida Partidos
```
Archivos: Partido.ts, Partido.service.ts
Documentación: ESTRUCTURA_CLASES.md → RF-15
Métodos: avanzarEstado(), registrarResultado()
Ejemplo: ejemplos-uso.ts → ejemploRegistrarResultadosYEvaluar()
```

### RF-17: Roles en Pollas
```
Archivos: Polla.ts, Polla.service.ts, enums.ts
Documentación: ESTRUCTURA_CLASES.md → RF-17
Métodos: agregarParticipante()
Enum: RolPolla
Ejemplo: ejemplos-uso.ts → ejemploCrearPollaYParticipantes()
```

---

## 🎨 Diseño Visual del Sistema

```
┌──────────────────────────────────────────────┐
│          Usuario (Autenticación)             │
│  usuario.ts + Usuario.service.ts             │
└────────────────┬─────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
  ┌──────────────┐  ┌──────────────┐
  │    Polla     │  │  Notificación│
  │              │  │              │
  │ Polla.ts     │  │ Notificacion │
  │ Polla.svc.ts │  │    .ts/.svc  │
  └──────────────┘  └──────────────┘
        │
        ▼
  ┌──────────────┐
  │  Predicción  │
  │              │
  │ Prediccion.ts│
  │ Prediccion   │
  │  .svc.ts     │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │    Partido   │
  │              │
  │ Partido.ts   │
  │ Partido.svc  │
  │ Equipo.ts    │
  └──────────────┘
```

---

## ✅ Checklist de Verificación

Al abrir el proyecto:

- [ ] ¿Veo 12 archivos .ts principales?
- [ ] ¿Veo 5 servicios (.service.ts)?
- [ ] ¿Veo 6 documentos .md?
- [ ] ¿Veo el archivo ejemplos-uso.ts?
- [ ] ¿README.md está presente?
- [ ] ¿Puedo leer el código sin errores?
- [ ] ¿Los nombres de archivos son claros?
- [ ] ¿Hay documentación disponible?

**Si respondiste ✅ a todo: ¡Todo listo!**

---

## 🚀 Tu Primer Paso

```bash
# Opción 1: Leer documentación
abre README.md

# Opción 2: Ver ejemplos
abre ejemplos-uso.ts

# Opción 3: Consultar referencia rápida
abre API_REFERENCIA.md

# Opción 4: Entender arquitectura
abre DIAGRAMA_ARQUITECTURA.md
```

---

**Documentación última:** Abril 2026
**Versión:** 1.0
**Status:** ✅ Completado

