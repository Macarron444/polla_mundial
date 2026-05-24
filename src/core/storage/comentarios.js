import { obtenerComentarios, guardarComentarios } from './indexedDb.js'

export async function getComentarios(grupoId, partidoId) {
    return obtenerComentarios(grupoId, partidoId)
}

export async function agregarComentario(grupoId, partidoId, usuario, texto) {
    if (!texto.trim()) return
    const comentarios = await obtenerComentarios(grupoId, partidoId)
    comentarios.push({
        id: Date.now(),
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        texto: texto.trim(),
        fecha: new Date().toISOString(),
    })
    await guardarComentarios(grupoId, partidoId, comentarios)
}

export async function eliminarComentario(grupoId, partidoId, comentarioId, usuarioId) {
    const comentarios = await obtenerComentarios(grupoId, partidoId)
    const filtrados   = comentarios.filter(
        (c) => !(c.id === comentarioId && c.usuarioId === usuarioId)
    )
    await guardarComentarios(grupoId, partidoId, filtrados)
}