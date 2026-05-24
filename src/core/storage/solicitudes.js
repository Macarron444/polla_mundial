const KEY = 'polla_mundial_solicitudes'

function getTodos() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function saveTodos(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

export function getSolicitudesPorGrupo(grupoId) {
    return getTodos().filter((s) => s.grupoId === grupoId && s.estado === 'PENDIENTE')
}

export function getSolicitudDeUsuario(grupoId, usuarioId) {
    return getTodos().find((s) => s.grupoId === grupoId && s.usuarioId === usuarioId) ?? null
}

export function crearSolicitud(grupoId, usuario) {
    const todas = getTodos()
    const yaExiste = todas.find((s) => s.grupoId === grupoId && s.usuarioId === usuario.id)
    if (yaExiste) throw new Error('Ya tienes una solicitud pendiente para este grupo')
    todas.push({
        id: Date.now(),
        grupoId,
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        estado: 'PENDIENTE',
        fecha: new Date().toISOString(),
    })
    saveTodos(todas)
}

export function resolverSolicitud(solicitudId, decision) {
    const todas = getTodos()
    const s = todas.find((x) => x.id === solicitudId)
    if (!s) throw new Error('Solicitud no encontrada')
    s.estado = decision // 'APROBADA' | 'RECHAZADA'
    saveTodos(todas)
    return s
}