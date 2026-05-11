export function getEquipo(equipos, id) {
    return equipos.find((e) => e.id === id) || { nombre: '?', flag: '' }
}
