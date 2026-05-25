// ── CLIENTE DE BASE DE DATOS (reemplaza IndexedDB) ────────────────────────────
// Este archivo reemplaza src/core/storage/indexedDb.js
// En vez de guardar en el navegador, llama al backend Express

const BASE = '/db'

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json()
}

// ── USUARIOS ──────────────────────────────────────────────────────────────────
export async function guardarUsuario(usuario) {
  if (!usuario?.id) return
  return req('POST', '/usuarios', usuario)
}

export async function obtenerUsuario(id) {
  const todos = await obtenerTodosUsuarios()
  return todos.find(u => u.id === id) ?? null
}

export async function obtenerTodosUsuarios() {
  return req('GET', '/usuarios/todos')
}

export async function guardarTodosUsuarios(usuarios) {
  for (const u of usuarios) await req('POST', '/usuarios', u)
}

// ── GRUPOS ────────────────────────────────────────────────────────────────────
export async function obtenerTodosGrupos() {
  return req('GET', '/grupos')
}

export async function guardarGrupo(grupo) {
  return req('PUT', `/grupos/${grupo.id}`, grupo)
}

export async function guardarTodosGrupos(grupos) {
  for (const g of grupos) await req('PUT', `/grupos/${g.id}`, g)
}

export async function eliminarGrupoDb(grupoId) {
  return req('DELETE', `/grupos/${grupoId}`)
}

// ── PREDICCIONES GRUPO ────────────────────────────────────────────────────────
export async function obtenerTodasPrediccionesGrupo() {
  return req('GET', '/predicciones')
}

export async function guardarPrediccionGrupo(prediccion) {
  const key = `${prediccion.grupoId}_${prediccion.usuarioId}_${prediccion.partidoId}`
  return req('PUT', `/predicciones/${key}`, { ...prediccion, key })
}

export async function guardarTodasPrediccionesGrupo(predicciones) {
  return req('POST', '/predicciones/bulk', predicciones)
}

// ── COMENTARIOS ───────────────────────────────────────────────────────────────
export async function obtenerComentarios(grupoId, partidoId) {
  return req('GET', `/comentarios/${grupoId}/${partidoId}`)
}

export async function guardarComentarios(grupoId, partidoId, comentarios) {
  return req('PUT', `/comentarios/${grupoId}/${partidoId}`, comentarios)
}

// ── SOLICITUDES ───────────────────────────────────────────────────────────────
export async function obtenerTodasSolicitudes() {
  return req('GET', '/solicitudes')
}

export async function guardarSolicitud(solicitud) {
  return req('PUT', `/solicitudes/${solicitud.id}`, solicitud)
}

export async function actualizarSolicitud(solicitud) {
  return req('PUT', `/solicitudes/${solicitud.id}`, solicitud)
}

export async function guardarTodasSolicitudes(solicitudes) {
  for (const s of solicitudes) await req('PUT', `/solicitudes/${s.id}`, s)
}

// ── RANKING HISTORIAL ─────────────────────────────────────────────────────────
export async function obtenerHistorialRankingGrupo(grupoId) {
  return req('GET', `/ranking/${grupoId}`)
}

export async function guardarSnapshotRanking(grupoId, snapshot) {
  return req('POST', `/ranking/${grupoId}`, snapshot)
}

// ── PREDICCIONES USUARIO (legacy - no usado en nuevo storage) ─────────────────
export async function guardarPrediccionesUsuario() { return }
export async function obtenerPrediccionesUsuario() { return null }