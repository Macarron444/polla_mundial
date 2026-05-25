import { get, post } from './api.js'

export async function loginUsuario(email, password) {
    const usuarios = await get('/usuarios')
    const usuario = usuarios.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!usuario) throw new Error('Correo o contraseña incorrectos')
    return { usuario }
}

export async function registrarUsuario(nuevoUsuario) {
    const usuarios = await get('/usuarios')
    const existe = usuarios.find(
        (u) => u.email.toLowerCase() === nuevoUsuario.email.toLowerCase()
    )
    if (existe) throw new Error('Ya existe una cuenta con ese correo')
    return post('/usuarios', nuevoUsuario)
}

export async function getUsuarios() {
    return get('/usuarios')
}

export async function getUsuario(id) {
    const usuarios = await get('/usuarios')
    return usuarios.find((u) => String(u.id) === String(id)) ?? null
}