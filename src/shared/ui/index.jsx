export const ESTADOS_COLOR = {
    PROGRAMADO: { bg: '#1a2744', border: '#3b5bdb', text: '#748ffc', label: 'Programado' },
    EN_CURSO: { bg: '#1a3320', border: '#2f9e44', text: '#69db7c', label: 'En Curso' },
    FINALIZADO: { bg: '#1a1a1a', border: '#555', text: '#aaa', label: 'Finalizado' },
    SUSPENDIDO: { bg: '#2d1a00', border: '#e67700', text: '#ffa94d', label: 'Suspendido' },
    POSPUESTO: { bg: '#2a1a2a', border: '#9c36b5', text: '#da77f2', label: 'Pospuesto' },
}

export const PRED_COLOR = {
    PENDIENTE: { bg: '#1a2744', text: '#748ffc', dot: '#3b5bdb' },
    EXACTA: { bg: '#0d2b1a', text: '#69db7c', dot: '#2f9e44' },
    CORRECTA: { bg: '#1a2744', text: '#a9e34b', dot: '#74b816' },
    FALLIDA: { bg: '#2a0d0d', text: '#ff8787', dot: '#c92a2a' },
}

export function btnStyle(color) {
    return {
        background: `${color}22`,
        border: `1px solid ${color}66`,
        color,
        fontSize: 10,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 6,
        cursor: 'pointer',
        letterSpacing: '0.05em',
        fontFamily: 'inherit',
    }
}

export function Dot({ color }) {
    return (
        <span
            style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: color,
                marginRight: 5,
                flexShrink: 0,
            }}
        />
    )
}

export function StatCard({ label, value, sub, accent }) {
    return (
        <div className="stat-card" style={{ borderTopColor: accent }}>
            <div className="stat-card__label">{label}</div>
            <div className="stat-card__value">
                {value}
            </div>
            {sub && <div className="stat-card__sub">{sub}</div>}
        </div>
    )
}

export function BadgeEstado({ estado }) {
    const c = ESTADOS_COLOR[estado] || ESTADOS_COLOR.PROGRAMADO
    return (
        <span
            className="badge"
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.text,
            }}
        >
            <Dot color={c.border} />
            {c.label}
        </span>
    )
}

export function BadgeRol({ rol }) {
    const map = {
        CREADOR: { bg: '#1a1260', color: '#a5b4fc' },
        ADMINISTRADOR: { bg: '#12261a', color: '#6ee7b7' },
        PARTICIPANTE: { bg: '#1a1a1a', color: '#9ca3af' },
    }
    const s = map[rol] || map.PARTICIPANTE
    return (
        <span className="badge-rol" style={{ background: s.bg, color: s.color }}>
            {rol}
        </span>
    )
}

export function ConnectionToast({ toast, onDismiss }) {
    if (!toast) return null
    const isOnline = toast.type === 'online'
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: isOnline ? '#0d2010' : '#1a0d0d',
                border: `1px solid ${isOnline ? '#2f9e44' : '#c92a2a'}`,
                borderRadius: 12,
                padding: '10px 18px',
                boxShadow: `0 4px 24px ${isOnline ? '#2f9e4433' : '#c92a2a33'}`,
                animation: 'toastIn 0.3s ease',
                minWidth: 220,
            }}
        >
            <span
                style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isOnline ? '#69db7c' : '#ff6b6b',
                    boxShadow: `0 0 8px ${isOnline ? '#69db7c' : '#ff6b6b'}`,
                    animation: isOnline ? 'none' : 'pulse 1.2s infinite',
                }}
            />
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: isOnline ? '#69db7c' : '#ff8787',
                    flex: 1,
                }}
            >
                {isOnline ? '🌐 ' : '📡 '}
                {toast.msg}
            </span>
            <button
                onClick={onDismiss}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#4a6fa5',
                    fontSize: 14,
                    cursor: 'pointer',
                    lineHeight: 1,
                    padding: '0 2px',
                    fontFamily: 'inherit',
                }}
            >
                ✕
            </button>
        </div>
    )
}