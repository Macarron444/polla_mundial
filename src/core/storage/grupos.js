const KEY = 'polla_mundial_grupos'

export function getGrupos() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function saveGrupos(grupos) {
    localStorage.setItem(KEY, JSON.stringify(grupos))
}

/** Crea un grupo nuevo. El creador queda como ADMIN. */
export function crearGrupo(nombre, descripcion, usuarioCreador) {
    const grupos = getGrupos()
    const nuevo = {
        id: Date.now(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        creadoPor: usuarioCreador.id,
        fechaCreacion: new Date().toISOString(),
        miembros: [
            {
                usuarioId: usuarioCreador.id,
                nombre: usuarioCreador.nombre,
                email: usuarioCreador.email,
                rol: 'ADMIN',
            },
        ],
    }
    saveGrupos([...grupos, nuevo])
    return nuevo
}

/** Agrega un miembro al grupo. Rol por defecto: PARTICIPANTE. */
export function agregarMiembro(grupoId, usuario, rol = 'PARTICIPANTE') {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    const yaEsta = grupo.miembros.some((m) => m.usuarioId === usuario.id)
    if (yaEsta) throw new Error('El usuario ya es miembro del grupo')
    grupo.miembros.push({ usuarioId: usuario.id, nombre: usuario.nombre, email: usuario.email, rol })
    saveGrupos(grupos)
    return grupo
}

/** Cambia el rol de un miembro. No se puede degradar al único ADMIN. */
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

/** Elimina un miembro. No se puede eliminar al único ADMIN. */
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

/** Elimina el grupo completo. Solo el ADMIN creador puede hacerlo. */
export function eliminarGrupo(grupoId, usuarioId) {
    const grupos = getGrupos()
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (grupo.creadoPor !== usuarioId) throw new Error('Solo el creador puede eliminar el grupo')
    saveGrupos(grupos.filter((g) => g.id !== grupoId))
}

/** Retorna solo los grupos donde el usuario es miembro. */
export function getGruposDeUsuario(usuarioId) {
    return getGrupos().filter((g) => g.miembros.some((m) => m.usuarioId === usuarioId))
}

/** Retorna el rol del usuario dentro de un grupo. */
export function getRolEnGrupo(grupo, usuarioId) {
    return grupo.miembros.find((m) => m.usuarioId === usuarioId)?.rol ?? null
}