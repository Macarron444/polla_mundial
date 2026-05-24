import { useState, useEffect } from 'react'
import { actualizarConfigGrupo } from '../../../core/storage/grupos.js'
import { cargarDatosAPI } from '../../../core/api/footballDataApi.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function ConfigApuesta({ grupo, usuario, onActualizado }) {
    const esCreador = grupo.creadoPor === usuario.id
    const [monto, setMonto] = useState(grupo.montoApuesta ?? 0)
    const [premiacion, setPremiacion] = useState(grupo.premiacion ?? 'TODO_AL_PRIMERO')
    const [partidos, setPartidos] = useState([])
    const [seleccionados, setSeleccionados] = useState(
        new Set(grupo.partidosSeleccionados ?? [])
    )
    const [cargandoApi, setCargandoApi] = useState(false)
    const [equipos, setEquipos] = useState([])
    const [msg, setMsg] = useState('')
    const [error, setError] = useState('')

    // Cargar partidos automáticamente al abrir
    useEffect(() => {
        if (esCreador) cargarPartidos()
    }, [])

    const cargarPartidos = async () => {
        setCargandoApi(true)
        try {
            const { equipos: eq, partidos: ps } = await cargarDatosAPI()
            setEquipos(eq)
            setPartidos(ps)
            // Si el grupo ya tenía partidos seleccionados, mantenerlos
            // Si no, no preseleccionar nada — el admin elige
            if (grupo.partidosSeleccionados?.length > 0) {
                setSeleccionados(new Set(grupo.partidosSeleccionados))
            }
        } catch (e) {
            setError('No se pudo cargar la API. Verifica tu conexión.')
        }
        setCargandoApi(false)
    }

    // Vista para miembros (no creador)
    if (!esCreador) {
        const total = (grupo.montoApuesta ?? 0) * grupo.miembros.length
        const numPartidos = grupo.partidosSeleccionados?.length ?? 0
        return (
            <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                    💰 APUESTA DEL GRUPO
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                    {[
                        { label: 'APUESTA POR PERSONA', val: `$${(grupo.montoApuesta ?? 0).toLocaleString('es-CO')}`, color: '#ffd43b' },
                        { label: 'CAJA TOTAL',          val: `$${total.toLocaleString('es-CO')}`,                      color: '#69db7c' },
                        { label: 'PREMIACIÓN',          val: grupo.premiacion === 'TODO_AL_PRIMERO' ? '1er lugar' : 'Top 3', color: '#748ffc' },
                        { label: 'PARTIDOS',            val: numPartidos,                                              color: '#a9e34b' },
                    ].map((s) => (
                        <div key={s.label} style={{ flex: 1, minWidth: 120, background: '#0d1628', border: `1px solid ${s.color}33`, borderRadius: 10, padding: '14px 16px' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em' }}>{s.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const togglePartido = (id) => {
        const nuevo = new Set(seleccionados)
        if (nuevo.has(id)) nuevo.delete(id)
        else nuevo.add(id)
        setSeleccionados(nuevo)
    }

    const seleccionarTodos = () => setSeleccionados(new Set(partidos.map((p) => p.id)))
    const deseleccionarTodos = () => setSeleccionados(new Set())

    const handleGuardar = async () => {
        setError('')
        if (monto < 0) { setError('El monto no puede ser negativo'); return }
        if (seleccionados.size === 0) { setError('Selecciona al menos un partido'); return }
        try {
            await actualizarConfigGrupo(grupo.id, usuario.id, {
                montoApuesta: Number(monto),
                premiacion,
                partidosSeleccionados: [...seleccionados],
            })
            setMsg('✓ Configuración guardada')
            onActualizado()
            setTimeout(() => setMsg(''), 1500)
        } catch (e) { setError(e.message) }
    }

    const total = Number(monto) * grupo.miembros.length

    // Agrupar partidos por fase, con nombre del equipo en vez de ID
    const nombreEquipo = (id) => equipos.find((e) => e.id === id)?.nombre ?? `Equipo ${id}`

    const porFase = partidos.reduce((acc, p) => {
        const fase = p.fase || 'Sin fase'
        if (!acc[fase]) acc[fase] = []
        acc[fase].push(p)
        return acc
    }, {})

    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                💰 CONFIGURAR APUESTA
            </div>

            {/* Monto */}
            <div style={{ background: '#0d1628', border: '1px solid #3b5bdb44', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>
                        MONTO POR PERSONA (COP)
                    </label>
                    <input type="number" min="0" className="login-input"
                        placeholder="Ej: 10000"
                        value={monto} onChange={(e) => setMonto(e.target.value)} />
                    {monto > 0 && (
                        <div style={{ fontSize: 11, color: '#69db7c', marginTop: 6 }}>
                            Caja total con {grupo.miembros.length} miembros: <strong>${total.toLocaleString('es-CO')}</strong>
                        </div>
                    )}
                </div>

                {/* Premiación */}
                <div>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 8 }}>
                        DISTRIBUCIÓN DEL PREMIO
                    </label>
                    {[
                        { val: 'TODO_AL_PRIMERO', label: '🥇 Todo al 1er lugar', desc: `$${total.toLocaleString('es-CO')}` },
                        { val: 'TOP_3',           label: '🏆 Top 3',             desc: '60% / 30% / 10%' },
                    ].map((op) => (
                        <label key={op.val} style={{
                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10,
                            background: premiacion === op.val ? '#0f1e3a' : 'transparent',
                            border: `1px solid ${premiacion === op.val ? '#3b5bdb' : '#1e2a45'}`,
                            borderRadius: 8, padding: '10px 14px',
                        }}>
                            <input type="radio" name="premiacion" value={op.val}
                                checked={premiacion === op.val}
                                onChange={(e) => setPremiacion(e.target.value)} />
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{op.label}</div>
                                <div style={{ fontSize: 10, color: '#4a6fa5' }}>{op.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Selección de partidos */}
            <div style={{ background: '#0d1628', border: '1px solid #2f9e4444', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em' }}>
                        ⚽ PARTIDOS DEL GRUPO ({seleccionados.size}/{partidos.length})
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={cargarPartidos} disabled={cargandoApi}
                            style={{ ...btnStyle('#748ffc'), fontSize: 9, padding: '3px 8px', opacity: cargandoApi ? 0.5 : 1 }}>
                            {cargandoApi ? '⏳' : '🔄'}
                        </button>
                        <button onClick={seleccionarTodos}
                            style={{ ...btnStyle('#2f9e44'), fontSize: 9, padding: '3px 8px' }}>Todos</button>
                        <button onClick={deseleccionarTodos}
                            style={{ ...btnStyle('#c92a2a'), fontSize: 9, padding: '3px 8px' }}>Ninguno</button>
                    </div>
                </div>

                {cargandoApi && (
                    <div style={{ fontSize: 12, color: '#748ffc', padding: '12px 0' }}>
                        ⏳ Cargando partidos de la API…
                    </div>
                )}

                {!cargandoApi && partidos.length === 0 && (
                    <div style={{ fontSize: 12, color: '#ff8787' }}>
                        No se pudieron cargar los partidos. Haz clic en 🔄 para reintentar.
                    </div>
                )}

                {Object.entries(porFase).map(([fase, psFase]) => (
                    <div key={fase} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#748ffc', letterSpacing: '0.06em', marginBottom: 6 }}>
                            {fase}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {psFase.map((p) => {
                                const sel = seleccionados.has(p.id)
                                return (
                                    <label key={p.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '8px 12px', cursor: 'pointer',
                                        background: sel ? '#0f1e3a' : '#060c18',
                                        border: `1px solid ${sel ? '#3b5bdb' : '#1e2a45'}`,
                                        borderRadius: 8, transition: 'all 0.15s',
                                    }}>
                                        <input type="checkbox" checked={sel}
                                            onChange={() => togglePartido(p.id)}
                                            style={{ accentColor: '#3b5bdb' }} />
                                        <span style={{ fontSize: 12, color: '#e2e8f0', flex: 1 }}>
                                            {nombreEquipo(p.local)} vs {nombreEquipo(p.visitante)}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#4a6fa5' }}>{p.fecha}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {error && <div style={{ fontSize: 11, color: '#ff8787', marginBottom: 10 }}>⚠️ {error}</div>}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>Guardar configuración</button>
                {msg && <span style={{ fontSize: 11, color: '#69db7c' }}>{msg}</span>}
            </div>
        </div>
    )
}

export default ConfigApuesta