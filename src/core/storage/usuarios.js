import {
    guardarUsuario,
    obtenerTodosUsuarios,
    guardarTodosUsuarios,
} from './indexedDb.js'

// ── HELPERS INTERNOS ──────────────────────────────────────────────────────────
async function getUsuarios() {
    return obtenerTodosUsuarios()
}

async function saveUsuarios(usuarios) {
    return guardarTodosUsuarios(usuarios)
}

// ── API PÚBLICA ───────────────────────────────────────────────────────────────
export async function getUsuarioPorEmail(email) {
    const usuarios = await getUsuarios()
    return usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function getUsuarioPorId(id) {
    const usuarios = await getUsuarios()
    return usuarios.find((u) => u.id === id) ?? null
}

export async function registrarUsuario(nuevoUsuario) {
    const usuarios = await getUsuarios()
    const existe = usuarios.some((u) => u.email.toLowerCase() === nuevoUsuario.email.toLowerCase())
    if (existe) throw new Error('Ya existe un usuario con ese email')
    const conFecha = { ...nuevoUsuario, creadoEn: new Date().toISOString() }
    await saveUsuarios([...usuarios, conFecha])
    return conFecha
}

export async function actualizarUsuario(usuarioActualizado) {
    const usuarios = await getUsuarios()
    const nuevos = usuarios.map((u) =>
        u.id === usuarioActualizado.id ? { ...u, ...usuarioActualizado } : u
    )
    await saveUsuarios(nuevos)
    await guardarUsuario(usuarioActualizado)
    return usuarioActualizado
}