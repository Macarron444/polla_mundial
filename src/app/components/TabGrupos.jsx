import { useState, useEffect, useCallback } from 'react'
import CardGrupo from './grupos/CardGrupo.jsx'
import FormCrearGrupo from './grupos/FormCrearGrupo.jsx'
import VistaGrupo from './grupos/VistaGrupo.jsx'
import GruposPublicos from './grupos/GruposPublicos.jsx'
import { btnStyle, StatCard } from '../../shared/ui/index.jsx'
import { getGruposDeUsuario, getGrupoPorToken, agregarMiembro, getRolEnGrupo } from '../../core/storage/grupos.js'

function TabGrupos({ usuario, partidos, equipos }) {
    const [grupos, setGrupos]           = useState([])
    const [vistaDetalle, setVistaDetalle] = useState(null)
    const [creando, setCreando]         = useState(false)
    const [verPublicos, setVerPublicos] = useState(false)
    const [cargando, setCargando]       = useState(true)

    // ── Unirse por token ──────────────────────────────────────────────────────
    const [token, setToken]     = useState('')
    const [tokenMsg, setTokenMsg] = useState('')
    const [tokenError, setTokenError] = useState('')
    const [verToken, setVerToken] = useState(false)

    const recargar = useCallback(async () => {
        setCargando(true)
        try {
            const actualizados = await getGruposDeUsuario(usuario.id)
            setGrupos(actualizados)
            if (vistaDetalle) {
                const grupoActualizado = actualizados.find((g) => g.id === vistaDetalle.id)
                setVistaDetalle(grupoActualizado ?? null)
            }
        } finally {
            setCargando(false)
        }
    }, [usuario.id, vistaDetalle])

    useEffect(() => { recargar() }, [])

    // Leer token de la URL al cargar (flujo de invitación por enlace)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const tokenUrl = params.get('token')
        if (tokenUrl) {
            setToken(tokenUrl.toUpperCase())
            setVerToken(true)
        }
    }, [])

    const handleCreado = async (grupo) => {
        setCreando(false)
        await recargar()
        setVistaDetalle(grupo)
    }

    const handleUnirseToken = async () => {
        setTokenMsg('')
        setTokenError('')
        const t = token.trim().toUpperCase()
        if (!t) { setTokenError('Ingresa un código de invitación'); return }
        try {
            const grupo = await getGrupoPorToken(t)
            if (!grupo) { setTokenError('Código inválido — no se encontró ningún grupo'); return }
            const rol = getRolEnGrupo(grupo, usuario.id)
            if (rol) { setTokenError('Ya eres miembro de este grupo'); return }
            await agregarMiembro(grupo.id, usuario)
            setTokenMsg(`✅ Te uniste a "${grupo.nombre}" correctamente`)
            setToken('')
            setVerToken(false)
            await recargar()
        } catch (e) { setTokenError(e.message) }
    }

    const gruposComoAdmin        = grupos.filter((g) => g.miembros.some((m) => m.usuarioId === usuario.id && m.rol === 'ADMIN'))
    const gruposComoParticipante = grupos.filter((g) => g.miembros.some((m) => m.usuarioId === usuario.id && m.rol !== 'ADMIN'))

    if (vistaDetalle) {
        return (
            <div className="tab-section">
                <VistaGrupo
                    grupo={vistaDetalle} usuario={usuario}
                    partidos={partidos} equipos={equipos}
                    onVolver={() => { setVistaDetalle(null); recargar() }}
                    onCambio={recargar}
                />
            </div>
        )
    }

    if (creando) {
        return (
            <div className="tab-section">
                <FormCrearGrupo usuario={usuario} onCreado={handleCreado} onCancelar={() => setCreando(false)} />
            </div>
        )
    }

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="MIS GRUPOS"       value={grupos.length}               accent="#748ffc" />
                <StatCard label="SOY ADMIN"         value={gruposComoAdmin.length}       accent="#ffd43b" />
                <StatCard label="SOY PARTICIPANTE"  value={gruposComoParticipante.length} accent="#69db7c" />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <button onClick={() => setCreando(true)} style={btnStyle('#3b5bdb')}>+ Crear grupo</button>
                <button onClick={() => { setVerToken(!verToken); setTokenMsg(''); setTokenError('') }} style={btnStyle(verToken ? '#748ffc' : '#2a3a5a')}>
                    🔑 {verToken ? 'Ocultar' : 'Unirse con código'}
                </button>
                <button onClick={() => setVerPublicos(!verPublicos)} style={btnStyle(verPublicos ? '#748ffc' : '#2a3a5a')}>
                    🌐 {verPublicos ? 'Ocultar públicos' : 'Ver grupos públicos'}
                </button>
            </div>

            {verToken && (
                <div style={{
                    background: '#0d1628', border: '1px solid #3b5bdb44',
                    borderRadius: 12, padding: '16px 18px', marginBottom: 20,
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#748ffc', marginBottom: 12, letterSpacing: '0.05em' }}>
                        🔑 UNIRSE A UN GRUPO PRIVADO
                    </div>
                    <div style={{ fontSize: 10, color: '#4a6fa5', marginBottom: 12 }}>
                        Ingresa el código que te compartió el administrador del grupo.
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnirseToken()}
                            placeholder="Ej: AB12CD34"
                            maxLength={10}
                            style={{
                                flex: 1, minWidth: 160,
                                background: '#060c18', border: '1px solid #3b5bdb55',
                                borderRadius: 8, padding: '8px 14px',
                                color: '#748ffc', fontSize: 18, fontWeight: 800,
                                letterSpacing: '0.15em', textTransform: 'uppercase',
                                fontFamily: 'inherit',
                            }}
                        />
                        <button onClick={handleUnirseToken} style={btnStyle('#2f9e44')}>✓ Unirse</button>
                        <button onClick={() => { setVerToken(false); setToken(''); setTokenMsg(''); setTokenError('') }} style={btnStyle('#555')}>✕</button>
                    </div>
                    {tokenError && <div style={{ fontSize: 11, color: '#ff8787', marginTop: 10 }}>⚠️ {tokenError}</div>}
                    {tokenMsg   && <div style={{ fontSize: 11, color: '#69db7c', marginTop: 10 }}>{tokenMsg}</div>}
                </div>
            )}

            {tokenMsg && !verToken && (
                <div style={{ fontSize: 11, color: '#69db7c', marginBottom: 14 }}>{tokenMsg}</div>
            )}

            {/* Grupos públicos */}
            {verPublicos && (
                <div style={{ marginBottom: 24 }}>
                    <GruposPublicos usuario={usuario} onCambio={recargar} />
                </div>
            )}

            {!cargando && grupos.length === 0 && !verPublicos && !verToken && (
                <div style={{
                    background: '#0d1628', border: '1px solid #1e2a45',
                    borderRadius: 12, padding: '36px 24px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Aún no tienes grupos</div>
                    <div style={{ fontSize: 11, color: '#4a6fa5', marginBottom: 16 }}>Crea uno, únete con un código o busca grupos públicos.</div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => setCreando(true)} style={btnStyle('#3b5bdb')}>+ Crear grupo</button>
                        <button onClick={() => setVerToken(true)} style={btnStyle('#748ffc')}>🔑 Tengo un código</button>
                        <button onClick={() => setVerPublicos(true)} style={btnStyle('#2a3a5a')}>🌐 Ver públicos</button>
                    </div>
                </div>
            )}

            {gruposComoAdmin.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>GRUPOS QUE ADMINISTRO</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {gruposComoAdmin.map((g) => (
                            <CardGrupo key={g.id} grupo={g} usuario={usuario} onAbrir={() => setVistaDetalle(g)} />
                        ))}
                    </div>
                </>
            )}

            {gruposComoParticipante.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>GRUPOS EN LOS QUE PARTICIPO</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {gruposComoParticipante.map((g) => (
                            <CardGrupo key={g.id} grupo={g} usuario={usuario} onAbrir={() => setVistaDetalle(g)} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default TabGrupos