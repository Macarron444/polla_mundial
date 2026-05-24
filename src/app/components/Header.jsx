import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus.js'
import { ConnectionToast } from '../../shared/ui/index.jsx'

function Header({ tab, setTab, usuario, onLogout }) {
    const tabs = ['Partidos', 'Gestionar Partidos', 'Ranking', 'Mis Predicciones', 'Mis Grupos']
    const { online, toast, dismissToast } = useOnlineStatus()

    const rolIcon =
        usuario?.rol === 'CREADOR' ? '👑' : usuario?.rol === 'ADMINISTRADOR' ? '🛡️' : '👤'

    return (
        <>
            <header className="header">
                <div className="header__inner">
                    <div className="header__brand">
                        <span className="header__logo">⚽</span>
                        <div>
                            <div className="header__title">Polla Mundial 2026</div>
                            <div className="header__subtitle">FIFA WORLD CUP · PWA</div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: online ? '#0d2010' : '#1a0d0d',
                                border: `1px solid ${online ? '#2f9e44' : '#c92a2a'}`,
                                borderRadius: 20,
                                padding: '4px 12px',
                                transition: 'all 0.4s ease',
                            }}
                        >
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    background: online ? '#69db7c' : '#ff6b6b',
                                    boxShadow: `0 0 ${online ? '6px #69db7c' : '6px #ff6b6b'}`,
                                    animation: online ? 'none' : 'pulse 1.2s infinite',
                                    transition: 'background 0.4s, box-shadow 0.4s',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '0.07em',
                                    color: online ? '#69db7c' : '#ff6b6b',
                                    transition: 'color 0.4s',
                                }}
                            >
                                {online ? 'EN LINEA' : 'SIN CONEXION'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <nav className="header__nav">
                            {tabs.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`nav-tab nav-tab--${tab === t ? 'active' : 'inactive'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </nav>

                        {usuario && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    borderLeft: '1px solid #1e2a45',
                                    paddingLeft: 12,
                                }}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>
                                        {rolIcon} {usuario.nombre}
                                    </div>
                                    <div style={{ fontSize: 9, color: '#4a6fa5', letterSpacing: '0.05em' }}>
                                        {usuario.rol}
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    title="Cerrar sesion"
                                    style={{
                                        background: '#1a0d0d',
                                        border: '1px solid #c92a2a44',
                                        color: '#ff8787',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: '5px 9px',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    ⏻
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {!online && (
                    <div className="offline-banner">
                        📡 Sin conexion — mostrando datos del cache del Service Worker
                    </div>
                )}
            </header>

            <ConnectionToast toast={toast} onDismiss={dismissToast} />
        </>
    )
}

export default Header