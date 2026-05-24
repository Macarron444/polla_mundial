import {
    obtenerTodosGrupos,
    guardarGrupo,
    guardarTodosGrupos,
    eliminarGrupoDb,
} from './indexedDb.js'

// ── HELPERS ───────────────────────────────────────────────────────────────────
async function getGrupos() {
    return obtenerTodosGrupos()
}

async function saveGrupos(grupos) {
    return guardarTodosGrupos(grupos)
}

// ── API PÚBLICA ───────────────────────────────────────────────────────────────
export async function crearGrupo(nombre, descripcion, usuarioCreador, opciones = {}) {
    const grupos = await getGrupos()
    const nuevo = {
        id: Date.now(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        creadoPor: usuarioCreador.id,
        fechaCreacion: new Date().toISOString(),
        esPublico: opciones.esPublico ?? false,
        montoApuesta: opciones.montoApuesta ?? 0,
        premiacion: opciones.premiacion ?? 'TODO_AL_PRIMERO',
        token: Math.random().toString(36).slice(2, 10).toUpperCase(),
        prediccionGlobal: { campeon: null, goleador: null },
        prediccionesGlobales: {},
        miembros: [{
            usuarioId: usuarioCreador.id,
            nombre: usuarioCreador.nombre,
            email: usuarioCreador.email,
            rol: 'ADMIN',
        }],
    }
    await guardarGrupo(nuevo)
    return nuevo
}

export async function agregarMiembro(grupoId, usuario, rol = 'PARTICIPANTE') {
    const grupos = await getGrupos()
    const grupo  = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (grupo.miembros.some((m) => m.usuarioId === usuario.id))
        throw new Error('El usuario ya es miembro del grupo')
    grupo.miembros.push({ usuarioId: usuario.id, nombre: usuario.nombre, email: usuario.email, rol })
    await guardarGrupo(grupo)
    return grupo
}

export async function cambiarRol(grupoId, usuarioId, nuevoRol) {
    const grupos = await getGrupos()
    const grupo  = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    const admins  = grupo.miembros.filter((m) => m.rol === 'ADMIN')
    const miembro = grupo.miembros.find((m) => m.usuarioId === usuarioId)
    if (!miembro) throw new Error('Miembro no encontrado')
    if (miembro.rol === 'ADMIN' && admins.length === 1 && nuevoRol !== 'ADMIN')
        throw new Error('El grupo debe tener al menos un administrador')
    miembro.rol = nuevoRol
    await guardarGrupo(grupo)
    return grupo
}

export async function eliminarMiembro(grupoId, usuarioId) {
    const grupos = await getGrupos()
    const grupo  = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    const admins  = grupo.miembros.filter((m) => m.rol === 'ADMIN')
    const miembro = grupo.miembros.find((m) => m.usuarioId === usuarioId)
    if (miembro?.rol === 'ADMIN' && admins.length === 1)
        throw new Error('No puedes eliminar al único administrador')
    grupo.miembros = grupo.miembros.filter((m) => m.usuarioId !== usuarioId)
    await guardarGrupo(grupo)
    return grupo
}

export async function eliminarGrupo(grupoId, usuarioId) {
    const grupos = await getGrupos()
    const grupo  = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (grupo.creadoPor !== usuarioId) throw new Error('Solo el creador puede eliminar el grupo')
    await eliminarGrupoDb(grupoId)
}

export async function actualizarConfigGrupo(grupoId, usuarioId, cambios) {
    const grupos = await getGrupos()
    const grupo  = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (grupo.creadoPor !== usuarioId) throw new Error('Solo el creador puede editar la configuración')
    Object.assign(grupo, cambios)
    await guardarGrupo(grupo)
    return grupo
}

export async function getGruposDeUsuario(usuarioId) {
    const grupos = await getGrupos()
    return grupos.filter((g) => g.miembros.some((m) => m.usuarioId === usuarioId))
}

export async function getGruposPublicos() {
    const grupos = await getGrupos()
    return grupos.filter((g) => g.esPublico)
}

export async function getGrupoPorToken(token) {
    const grupos = await getGrupos()
    return grupos.find((g) => g.token === token.toUpperCase()) ?? null
}

export function getRolEnGrupo(grupo, usuarioId) {
    return (grupo?.miembros ?? []).find((m) => m.usuarioId === usuarioId)?.rol ?? null
}

export async function guardarPrediccionGlobalGrupo(grupoId, usuarioId, campeon, goleador) {
    const grupos = await getGrupos()
    const grupo  = grupos.find((g) => g.id === grupoId)
    if (!grupo) throw new Error('Grupo no encontrado')
    if (!grupo.prediccionesGlobales) grupo.prediccionesGlobales = {}
    grupo.prediccionesGlobales[usuarioId] = { campeon, goleador, fecha: new Date().toISOString() }
    await guardarGrupo(grupo)
}

export async function getPrediccionGlobal(grupoId, usuarioId) {
    const grupos = await getGrupos()
    const grupo  = grupos.find((g) => g.id === grupoId)
    return grupo?.prediccionesGlobales?.[usuarioId] ?? null
}