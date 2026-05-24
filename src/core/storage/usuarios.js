const KEY = 'polla_mundial_usuarios'

export function getUsuarios() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function saveUsuarios(usuarios) {
    localStorage.setItem(KEY, JSON.stringify(usuarios))
}

export function getUsuarioPorEmail(email) {
    return getUsuarios().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function getUsuarioPorId(id) {
    return getUsuarios().find((u) => u.id === id) ?? null
}