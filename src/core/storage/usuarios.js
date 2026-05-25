import { get, put } from './api.js'

export async function obtenerTodosUsuarios() {
    return get('/usuarios')
}

export async function guardarUsuario(usuario) {
    const usuarios = await obtenerTodosUsuarios()
    const existente = usuarios.find((u) => String(u.id) === String(usuario.id))
    await put(`/usuarios/${usuario.id}`, { ...existente, ...usuario })
}

export async function registrarUsuario(usuario) {
    const usuarios = await obtenerTodosUsuarios()
    const email = usuario.email.toLowerCase().trim()
    if (usuarios.some((u) => u.email?.toLowerCase() === email)) {
        throw new Error('Ya existe una cuenta con este correo')
    }
    const nuevo = { ...usuario, email }
    await put(`/usuarios/${nuevo.id}`, nuevo)
    return nuevo
}

export async function loginUsuario(email, password) {
    const usuarios = await obtenerTodosUsuarios()
    const usuario = usuarios.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!usuario || usuario.password !== password) {
        throw new Error('Correo o contraseña incorrectos')
    }
    return { usuario }
}
