import { get, put } from './httpClient.js'

export async function getSolicitudesPorGrupo(grupoId) {
    const todas = await get('/solicitudes')
    return todas.filter((s) => s.grupoId === grupoId && s.estado === 'PENDIENTE')
}

export async function getSolicitudDeUsuario(grupoId, usuarioId) {
    const todas = await get('/solicitudes')
    return todas.find((s) => s.grupoId === grupoId && s.usuarioId === usuarioId) ?? null
}

export async function crearSolicitud(grupoId, usuario) {
    const todas    = await get('/solicitudes')
    const yaExiste = todas.find((s) => s.grupoId === grupoId && s.usuarioId === usuario.id && s.estado === 'PENDIENTE')
    if (yaExiste) throw new Error('Ya tienes una solicitud pendiente para este grupo')
    const nueva = {
        id: Date.now(),
        grupoId,
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        estado: 'PENDIENTE',
        fecha: new Date().toISOString(),
    }
    await put(`/solicitudes/${nueva.id}`, nueva)
    return nueva
}

export async function resolverSolicitud(solicitudId, decision) {
    const todas = await get('/solicitudes')
    const s     = todas.find((x) => x.id === solicitudId)
    if (!s) throw new Error('Solicitud no encontrada')
    s.estado = decision
    await put(`/solicitudes/${solicitudId}`, s)
    return s
}