export function getEquipo(equipos, id) {
    const fallbackNombre = id ? `Equipo ${id}` : 'Equipo ?'
    return equipos.find((e) => e.id === id) || { nombre: fallbackNombre, flag: '', grupo: null }
}
