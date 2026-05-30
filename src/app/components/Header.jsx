import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus.js'
import { useTheme } from '../../shared/hooks/useTheme.js'
import { ConnectionToast } from '../../shared/ui/index.jsx'

function Header({ tab, setTab, usuario, onLogout }) {
    const esAdmin = usuario?.rol === 'CREADOR' || usuario?.rol === 'ADMINISTRADOR'
    const tabs = [
        'Partidos',
        ...(esAdmin ? ['Gestionar Partidos'] : []),
        'Ranking',
        'Mis Predicciones',
        'Mis Grupos',
    ]
    const { online, toast, dismissToast } = useOnlineStatus()
    const { theme, toggleTheme } = useTheme()

    const rolIcon =
        usuario?.rol === 'CREADOR' ? '👑' : usuario?.rol === 'ADMINISTRADOR' ? '🛡️' : '👤'

    return (
        <>
            <header className="header">
                <div className="header__inner">
                    <div className="header__top">
                        <div className="header__brand">
                            <span className="header__logo">⚽</span>
                            <div>
                                <div className="header__title">Polla Mundial 2026</div>
                                <div className="header__subtitle">FIFA WORLD CUP · PWA</div>
                            </div>

                            <div
                                className={`status-badge ${online ? 'status-badge--online' : 'status-badge--offline'}`}
                            >
                                <span className="status-dot" />
                                <span className="status-text">
                                    {online ? 'EN LINEA' : 'SIN CONEXION'}
                                </span>
                            </div>
                        </div>

                        <div className="header__actions">
                            <button
                                className="theme-toggle"
                                onClick={toggleTheme}
                                aria-pressed={theme === 'dark'}
                                title="Cambiar tema"
                            >
                                <span className="theme-toggle__icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
                                <span className="theme-toggle__text">
                                    {theme === 'dark' ? 'Oscuro' : 'Claro'}
                                </span>
                            </button>

                            {usuario && (
                                <div className="user-panel">
                                    <div className="user-panel__text">
                                        <div className="user-panel__name">{rolIcon} {usuario.nombre}</div>
                                        <div className="user-panel__role">{usuario.rol}</div>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        title="Cerrar sesion"
                                        className="logout-btn"
                                    >
                                        ⏻
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

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