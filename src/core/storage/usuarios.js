import { get, post } from './httpClient.js'

export async function getUsuarioPorEmail(email) {
    const todos = await get('/usuarios/todos')
    return todos.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function getUsuarioPorId(id) {
    const todos = await get('/usuarios/todos')
    return todos.find((u) => String(u.id) === String(id)) ?? null
}

export async function obtenerTodosUsuarios() {
    return get('/usuarios/todos')
}

export async function registrarUsuario(nuevoUsuario) {
    const todos  = await get('/usuarios/todos')
    const existe = todos.some((u) => u.email.toLowerCase() === nuevoUsuario.email.toLowerCase())
    if (existe) throw new Error('Ya existe un usuario con ese email')
    const conFecha = { ...nuevoUsuario, creadoEn: new Date().toISOString() }
    await post('/usuarios', conFecha)
    return conFecha
}

export async function actualizarUsuario(usuario) {
    await post('/usuarios', usuario)
    return usuario
}

export async function loginUsuario(email, password) {
    return post('/usuarios/login', { email, password })
}