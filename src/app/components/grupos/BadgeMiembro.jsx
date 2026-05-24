const ROL_META = {
    ADMIN: { label: 'ADMIN', icon: '🛡️', color: '#748ffc', bg: '#1a1e3a' },
    PARTICIPANTE: { label: 'PARTICIPANTE', icon: '👤', color: '#4a6fa5', bg: '#0d1628' },
}

function BadgeMiembro({ rol }) {
    const m = ROL_META[rol] ?? ROL_META.PARTICIPANTE
    return (
        <span style={{
            background: m.bg,
            border: `1px solid ${m.color}44`,
            color: m.color,
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 20,
            letterSpacing: '0.07em',
        }}>
            {m.icon} {m.label}
        </span>
    )
}

export default BadgeMiembro