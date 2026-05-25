import { get, put } from './api.js'

export async function getComentarios(grupoId, partidoId) {
    return get(`/comentarios/${grupoId}/${partidoId}`)
}

export async function agregarComentario(grupoId, partidoId, usuario, texto) {
    if (!texto.trim()) return
    const comentarios = await getComentarios(grupoId, partidoId)
    comentarios.push({
        id: Date.now(),
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        texto: texto.trim(),
        fecha: new Date().toISOString(),
    })
    await put(`/comentarios/${grupoId}/${partidoId}`, comentarios)
}

export async function eliminarComentario(grupoId, partidoId, comentarioId, usuarioId) {
    const comentarios = await getComentarios(grupoId, partidoId)
    const filtrados   = comentarios.filter(
        (c) => !(c.id === comentarioId && c.usuarioId === usuarioId)
    )
    await put(`/comentarios/${grupoId}/${partidoId}`, filtrados)
}