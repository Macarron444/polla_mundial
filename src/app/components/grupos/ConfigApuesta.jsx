import { useState, useEffect } from 'react'
import { actualizarConfigGrupo } from '../../../core/storage/grupos.js'
import { cargarDatosAPI } from '../../../core/api/footballDataApi.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function ConfigApuesta({ grupo, usuario, partidos: partidosProp = [], equipos: equiposProp = [], onActualizado }) {
    const esAdmin = grupo.miembros.some((m) => String(m.usuarioId) === String(usuario.id) && m.rol === 'ADMIN')
        || String(grupo.creadoPor) === String(usuario.id)
    const [monto, setMonto] = useState(grupo.montoApuesta ?? 0)
    const [premiacion, setPremiacion] = useState(grupo.premiacion ?? 'TODO_AL_PRIMERO')
    const [partidos, setPartidos] = useState(partidosProp)
    const [seleccionados, setSeleccionados] = useState(new Set(grupo.partidosSeleccionados ?? []))
    const [faseActiva, setFaseActiva] = useState('')
    const [cargandoApi, setCargandoApi] = useState(false)
    const [equipos, setEquipos] = useState(equiposProp.length > 0 ? equiposProp : [])
    const [msg, setMsg] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!esAdmin) return
        if (partidosProp.length > 0) {
            setPartidos(partidosProp)
            if (equiposProp.length > 0) setEquipos(equiposProp)
        } else {
            cargarPartidos()
        }
    }, [])

    useEffect(() => {
        if (partidosProp.length > 0) setPartidos(partidosProp)
        if (equiposProp.length > 0) setEquipos(equiposProp)
    }, [partidosProp, equiposProp])

    useEffect(() => {
        const fasesDisponibles = [...new Set(partidos.map((p) => p.fase || 'Sin fase'))]
        if (fasesDisponibles.length === 0) {
            if (faseActiva) setFaseActiva('')
            return
        }
        if (!fasesDisponibles.includes(faseActiva)) setFaseActiva(fasesDisponibles[0])
    }, [partidos, faseActiva])

    const cargarPartidos = async () => {
        setCargandoApi(true)
        try {
            const { equipos: eq, partidos: ps } = await cargarDatosAPI()
            setEquipos(eq)
            setPartidos(ps)
            if (grupo.partidosSeleccionados?.length > 0) {
                setSeleccionados(new Set(grupo.partidosSeleccionados))
            }
        } catch (e) {
            setError('No se pudo cargar la API. Verifica tu conexion.')
        }
        setCargandoApi(false)
    }

    if (!esAdmin) {
        const total = (grupo.montoApuesta ?? 0) * grupo.miembros.length
        const numPartidos = grupo.partidosSeleccionados?.length ?? 0
        return (
            <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                    APUESTA DEL GRUPO
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                    {[
                        { label: 'APUESTA POR PERSONA', val: `$${(grupo.montoApuesta ?? 0).toLocaleString('es-CO')}`, color: '#ffd43b' },
                        { label: 'CAJA TOTAL',          val: `$${total.toLocaleString('es-CO')}`,                      color: '#69db7c' },
                        { label: 'PREMIACION',          val: grupo.premiacion === 'TODO_AL_PRIMERO' ? '1er lugar' : 'Top 3', color: '#748ffc' },
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
            setMsg('Configuracion guardada')
            onActualizado()
            setTimeout(() => setMsg(''), 1500)
        } catch (e) { setError(e.message) }
    }

    const total = Number(monto) * grupo.miembros.length
    const nombreEquipo = (id) => equipos.find((e) => e.id === id)?.nombre ?? `Equipo ${id}`

    const porFase = partidos.reduce((acc, p) => {
        const fase = p.fase || 'Sin fase'
        if (!acc[fase]) acc[fase] = []
        acc[fase].push(p)
        return acc
    }, {})
    const fases = Object.keys(porFase)
    const faseActual = fases.includes(faseActiva) ? faseActiva : fases[0] ?? ''
    const partidosFase = porFase[faseActual] ?? []
    const seleccionadosFase = partidosFase.filter((p) => seleccionados.has(p.id)).length

    const seleccionarFase = () => {
        const nuevo = new Set(seleccionados)
        partidosFase.forEach((p) => nuevo.add(p.id))
        setSeleccionados(nuevo)
    }

    const deseleccionarFase = () => {
        const nuevo = new Set(seleccionados)
        partidosFase.forEach((p) => nuevo.delete(p.id))
        setSeleccionados(nuevo)
    }

    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                CONFIGURAR APUESTA
            </div>

            <div className="apuesta-grid">
                <div className="apuesta-panel">
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

                    <div>
                        <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 8 }}>
                            DISTRIBUCION DEL PREMIO
                        </label>
                        {[
                            { val: 'TODO_AL_PRIMERO', label: 'Todo al 1er lugar', desc: `$${total.toLocaleString('es-CO')}` },
                            { val: 'TOP_3',           label: 'Top 3',             desc: '60% / 30% / 10%' },
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

                <div className="apuesta-panel apuesta-panel--partidos">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em' }}>
                            PARTIDOS DEL GRUPO ({seleccionados.size}/{partidos.length})
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button onClick={cargarPartidos} disabled={cargandoApi}
                                style={{ ...btnStyle('#748ffc'), fontSize: 9, padding: '3px 8px', opacity: cargandoApi ? 0.5 : 1 }}>
                                {cargandoApi ? '...' : 'Actualizar'}
                            </button>
                            <button onClick={seleccionarTodos}
                                style={{ ...btnStyle('#2f9e44'), fontSize: 9, padding: '3px 8px' }}>Todos</button>
                            <button onClick={deseleccionarTodos}
                                style={{ ...btnStyle('#c92a2a'), fontSize: 9, padding: '3px 8px' }}>Ninguno</button>
                        </div>
                    </div>

                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>
                        FASE
                    </label>
                    <select className="apuesta-select" value={faseActual} onChange={(e) => setFaseActiva(e.target.value)} disabled={fases.length === 0}>
                        {fases.map((fase) => (
                            <option key={fase} value={fase}>{fase} ({porFase[fase].length})</option>
                        ))}
                    </select>

                    {faseActual && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '12px 0 10px', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 10, color: '#748ffc', fontWeight: 700 }}>
                                {faseActual}: {seleccionadosFase}/{partidosFase.length} seleccionados
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={seleccionarFase}
                                    style={{ ...btnStyle('#2f9e44'), fontSize: 9, padding: '3px 8px' }}>Marcar fase</button>
                                <button onClick={deseleccionarFase}
                                    style={{ ...btnStyle('#c92a2a'), fontSize: 9, padding: '3px 8px' }}>Limpiar fase</button>
                            </div>
                        </div>
                    )}

                    {cargandoApi && (
                        <div style={{ fontSize: 12, color: '#748ffc', padding: '12px 0' }}>
                            Cargando partidos de la API...
                        </div>
                    )}

                    {!cargandoApi && partidos.length === 0 && (
                        <div style={{ fontSize: 12, color: '#ff8787', marginTop: 12 }}>
                            No se pudieron cargar los partidos. Haz clic en Actualizar para reintentar.
                        </div>
                    )}

                    {!cargandoApi && partidosFase.length > 0 && (
                        <div className="partidos-lista-compacta">
                            {partidosFase.map((p) => {
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
                    )}
                </div>
            </div>

            {error && <div style={{ fontSize: 11, color: '#ff8787', marginTop: 12, marginBottom: 10 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', marginTop: 16, flexWrap: 'wrap' }}>
                <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>Guardar configuracion</button>
                {msg && <span style={{ fontSize: 11, color: '#69db7c' }}>{msg}</span>}
            </div>
        </div>
    )
}

export default ConfigApuesta
