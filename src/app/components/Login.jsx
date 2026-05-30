import { useState } from 'react'
import { loginUsuario, registrarUsuario } from '../../core/storage/usuarios.js'
import { useTheme } from '../../shared/hooks/useTheme.js'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@(gmail|hotmail|outlook|yahoo|live|icloud)\.(com|es|co|net|org|com\.co)$/i

function Login({ onLogin }) {
    const [modo, setModo] = useState('login')
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [error, setError] = useState('')
    const [exito, setExito] = useState('')
    const [loading, setLoading] = useState(false)
    const { theme, toggleTheme } = useTheme()

    const resetForm = () => {
        setNombre(''); setEmail(''); setPassword('')
        setConfirmar(''); setError(''); setExito('')
    }

    const cambiarModo = (nuevoModo) => { setModo(nuevoModo); resetForm() }

    /* ── LOGIN ── */
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) { setError('Ingresa tu correo y contraseña'); return }
        setLoading(true); setError('')
        try {
            const { usuario } = await loginUsuario(email.trim(), password)
            onLogin(usuario)
        } catch (e) {
            setError(e.message)
        }
        setLoading(false)
    }

    /* ── REGISTRO ── */
    const handleRegistro = async () => {
        setError(''); setExito('')
        if (!nombre.trim() || !email.trim() || !password.trim() || !confirmar.trim()) {
            setError('Todos los campos son obligatorios'); return
        }
        if (!EMAIL_REGEX.test(email.trim())) {
            setError('Usa un correo real: Gmail, Hotmail, Outlook, Yahoo, etc.'); return
        }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
        if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }

        setLoading(true)
        try {
            const nuevoUsuario = {
                id: Date.now(),
                nombre: nombre.trim(),
                email: email.toLowerCase().trim(),
                password,
                rol: 'PARTICIPANTE',
                fechaRegistro: new Date().toISOString(),
            }
            await registrarUsuario(nuevoUsuario)
            setExito(`✅ ¡Listo, ${nuevoUsuario.nombre}! Ya puedes iniciar sesión.`)
            setTimeout(() => { cambiarModo('login'); setEmail(nuevoUsuario.email) }, 1800)
        } catch (e) {
            setError(e.message)
        }
        setLoading(false)
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <button
                    className="theme-toggle theme-toggle--floating"
                    onClick={toggleTheme}
                    aria-pressed={theme === 'dark'}
                    title="Cambiar tema"
                >
                    <span className="theme-toggle__icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
                    <span className="theme-toggle__text">
                        {theme === 'dark' ? 'Oscuro' : 'Claro'}
                    </span>
                </button>

                <div className="login-logo">
                    <div className="login-logo__icon">⚽</div>
                    <div className="login-logo__title">Polla Mundial 2026</div>
                    <div className="login-logo__subtitle">FIFA WORLD CUP · PWA</div>
                </div>

                {modo === 'login' && (
                    <>
                        <div className="login-field">
                            <label className="login-label">CORREO ELECTRÓNICO</label>
                            <input type="email" className="login-input" placeholder="tu@correo.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                autoComplete="email" />
                        </div>
                        <div className="login-field">
                            <label className="login-label">CONTRASEÑA</label>
                            <input type="password" className="login-input" placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                autoComplete="current-password" />
                        </div>
                        <button className="login-btn" onClick={handleLogin} disabled={loading}>
                            {loading ? '⏳ Verificando...' : 'Ingresar →'}
                        </button>
                        {error && <div className="login-error">⚠️ {error}</div>}
                        <div className="login-hint">
                            ¿No tienes cuenta?{' '}
                            <strong style={{ color: '#748ffc', cursor: 'pointer' }} onClick={() => cambiarModo('registro')}>
                                Regístrate aquí
                            </strong>
                        </div>
                    </>
                )}

                {modo === 'registro' && (
                    <>
                        <div className="login-field">
                            <label className="login-label">NOMBRE COMPLETO</label>
                            <input type="text" className="login-input" placeholder="Juan Pérez"
                                value={nombre} onChange={(e) => setNombre(e.target.value)}
                                autoComplete="name" />
                        </div>
                        <div className="login-field">
                            <label className="login-label">CORREO ELECTRÓNICO</label>
                            <input type="email" className="login-input" placeholder="tu@gmail.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email" />
                        </div>
                        <div className="login-field">
                            <label className="login-label">CONTRASEÑA</label>
                            <input type="password" className="login-input" placeholder="Mínimo 6 caracteres"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password" />
                        </div>
                        <div className="login-field">
                            <label className="login-label">CONFIRMAR CONTRASEÑA</label>
                            <input type="password" className="login-input" placeholder="Repite tu contraseña"
                                value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRegistro()}
                                autoComplete="new-password" />
                        </div>
                        <button className="login-btn" onClick={handleRegistro} disabled={loading}>
                            {loading ? '⏳ Registrando...' : 'Crear cuenta →'}
                        </button>
                        {error && <div className="login-error">⚠️ {error}</div>}
                        {exito && <div className="login-success">{exito}</div>}
                        <div className="login-hint">
                            ¿Ya tienes cuenta?{' '}
                            <strong style={{ color: '#748ffc', cursor: 'pointer' }} onClick={() => cambiarModo('login')}>
                                Inicia sesión
                            </strong>
                        </div>
                        <div className="login-note">
                            📧 Correos aceptados: Gmail, Hotmail, Outlook, Yahoo, Live, iCloud
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Login