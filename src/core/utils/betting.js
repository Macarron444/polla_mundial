export function getBetStatus(partido) {
    if (partido.estado === 'FINALIZADO') return 'FINALIZADO'
    if (partido.estado === 'EN_CURSO') return 'BLOQUEADA'
    if (!partido.fechaISO) return 'ABIERTA'
    const ms = new Date(partido.fechaISO) - new Date()
    if (ms <= 0) return 'BLOQUEADA'
    if (ms <= 15 * 60000) return 'BLOQUEADA_PRONTO'
    return 'ABIERTA'
}

export function minutosRestantes(partido) {
    if (!partido.fechaISO) return null
    const ms = new Date(partido.fechaISO) - new Date()
    return Math.max(0, Math.floor(ms / 60000))
}
