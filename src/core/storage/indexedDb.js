import { guardarUsuario, obtenerTodosUsuarios } from './usuarios.js'

const PREFIX = 'polla_mundial:predicciones_usuario:'

export { guardarUsuario, obtenerTodosUsuarios }

export async function obtenerPrediccionesUsuario(usuarioId) {
    if (!usuarioId) return null
    const raw = localStorage.getItem(`${PREFIX}${usuarioId}`)
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export async function guardarPrediccionesUsuario(usuarioId, predicciones) {
    const registro = {
        usuarioId,
        predicciones,
        actualizadoEn: new Date().toISOString(),
    }
    localStorage.setItem(`${PREFIX}${usuarioId}`, JSON.stringify(registro))
    return registro
}
