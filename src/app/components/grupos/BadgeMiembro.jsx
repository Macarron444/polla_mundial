const ROL_META = {
    ADMIN:        { label: 'ADMIN',        icon: '🛡️', color: '#3b5bdb', bg: '#eef2ff', border: '#c7d2fe' },
    PARTICIPANTE: { label: 'PARTICIPANTE', icon: '👤', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
}

function BadgeMiembro({ rol }) {
    const m = ROL_META[rol] ?? ROL_META.PARTICIPANTE
    return (
        <span style={{
            background: m.bg,
            border: `1px solid ${m.border}`,
            color: m.color,
            fontSize: 9,
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: 20,
            letterSpacing: '0.07em',
        }}>
            {m.icon} {m.label}
        </span>
    )
}

export default BadgeMiembro