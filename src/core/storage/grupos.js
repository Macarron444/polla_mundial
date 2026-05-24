const KEY = 'polla_mundial_grupos'

export function getGrupos() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function saveGrupos(grupos) { localStorage.setItem(KEY, JSON.stringify(grupos)) }

export function crearGrupo(nombre, descripcion, usuarioCreador, opciones = {}) {
    const grupos = getGrupos()
    const nuevo = {
        id: Date.now(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        creadoPor: usuarioCreador.id,
        fechaCreacion: new Date().toISOString(),
        esPublico: opciones.esPublico ?? false,
        montoApuesta: opciones.montoApuesta ?? 0,
        premiacion: opciones.premiacion ?? 'TODO_AL_PRIMERO', // 'TODO_AL_PRIMERO' | 'TOP_3'
        token: Math.random().toString(36).slice(2, 10).toUpperCase(),
        prediccionGlobal: { campeon: null, goleador: null },
        miembros: [{
            usuarioId: usuarioCreador.id,
            nombre: usuarioCreador.nombre,
            email: usuarioCreador.email,
            rol: 'ADMIN',
        }],
    }
    saveGrupos([...grupos, nuevo])
    return nuevo
}

export function agregarMiembro(grupoId, usuario, rol = 'PARTICIPANTE') {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (grupo.miembros.some((m) => m.usuarioId === usuario.id))
        throw new Error('El usuario ya es miembro del grupo')
    grupo.miembros.push({ usuarioId: usuario.id, nombre: usuario.nombre, email: usuario.email, rol })
    saveGrupos(grupos)
    return grupo
}

export function cambiarRol(grupoId, usuarioId, nuevoRol) {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    const admins = grupo.miembros.filter((m) => m.rol === 'ADMIN')
    const miembro = grupo.miembros.find((m) => m.usuarioId === usuarioId)
    if (!miembro) throw new Error('Miembro no encontrado')
    if (miembro.rol === 'ADMIN' && admins.length === 1 && nuevoRol !== 'ADMIN')
        throw new Error('El grupo debe tener al menos un administrador')
    miembro.rol = nuevoRol
    saveGrupos(grupos)
    return grupo
}

export function eliminarMiembro(grupoId, usuarioId) {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    const admins = grupo.miembros.filter((m) => m.rol === 'ADMIN')
    const miembro = grupo.miembros.find((m) => m.usuarioId === usuarioId)
    if (miembro?.rol === 'ADMIN' && admins.length === 1)
        throw new Error('No puedes eliminar al único administrador')
    grupo.miembros = grupo.miembros.filter((m) => m.usuarioId !== usuarioId)
    saveGrupos(grupos)
    return grupo
}

export function eliminarGrupo(grupoId, usuarioId) {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (grupo.creadoPor !== usuarioId) throw new Error('Solo el creador puede eliminar el grupo')
    saveGrupos(grupos.filter((g) => g.id !== grupoId))
}

export function actualizarConfigGrupo(grupoId, usuarioId, cambios) {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (grupo.creadoPor !== usuarioId) throw new Error('Solo el creador puede editar la configuración')
    Object.assign(grupo, cambios)
    saveGrupos(grupos)
    return grupo
}

export function getGruposDeUsuario(usuarioId) {
    return getGrupos().filter((g) => g.miembros.some((m) => m.usuarioId === usuarioId))
}

export function getGruposPublicos() {
    return getGrupos().filter((g) => g.esPublico)
}

export function getGrupoPorToken(token) {
    return getGrupos().find((g) => g.token === token.toUpperCase()) ?? null
}

export function getRolEnGrupo(grupo, usuarioId) {
    return grupo.miembros.find((m) => m.usuarioId === usuarioId)?.rol ?? null
}

export function guardarPrediccionGlobal(grupoId, usuarioId, campeon, goleador) {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (!grupo.prediccionesGlobales) grupo.prediccionesGlobales = {}
    grupo.prediccionesGlobales[usuarioId] = { campeon, goleador, fecha: new Date().toISOString() }
    saveGrupos(grupos)
}

export function getPrediccionGlobal(grupoId, usuarioId) {
    const grupo = getGrupos().find((g) => g.id === grupoId)
    return grupo?.prediccionesGlobales?.[usuarioId] ?? null
}