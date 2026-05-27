import { useEffect, useRef, useState } from 'react'
import { Dot, PRED_COLOR, StatCard, btnStyle } from '../../shared/ui/index.jsx'
import { getBetStatus, minutosRestantes } from '../../core/utils/betting.js'
import { getEquipo } from '../../core/utils/teams.js'
import { get, put } from '../../core/storage/httpClient.js'

function TabPredicciones({ usuario, partidos, equipos }) {
    const [preds, setPreds]               = useState([])
    const [editId, setEditId]             = useState(null)
    const [gl, setGl]                     = useState('')
    const [gv, setGv]                     = useState('')
    const [showAddForm, setShowAddForm]   = useState(false)
    const [newPartidoId, setNewPartidoId] = useState('')
    const [newGl, setNewGl]               = useState('0')
    const [newGv, setNewGv]               = useState('0')
    const [dbStatus, setDbStatus]         = useState('Cargando predicciones...')
    const hydratedRef = useRef(false)

    // Cargar predicciones personales del usuario desde el backend
    useEffect(() => {
        hydratedRef.current = false
        setDbStatus('Cargando predicciones...')
        if (!usuario?.id) return

        get('/predicciones-personales')
            .then((todas) => {
                const mias = todas.filter((p) => String(p.usuarioId) === String(usuario.id))
                setPreds(mias)
                setDbStatus(`${mias.length} predicciones cargadas`)
            })
            .catch(() => {
                setPreds([])
                setDbStatus('No se pudieron cargar las predicciones')
            })
            .finally(() => { hydratedRef.current = true })
    }, [usuario?.id])

    // Guardar predicciones cuando cambian
    useEffect(() => {
        if (!hydratedRef.current || !usuario?.id) return
        preds.forEach((p) => {
            put(`/predicciones-personales/${usuario.id}_${p.partidoId}`, { ...p, usuarioId: usuario.id })
                .catch(() => {})
        })
    }, [preds, usuario?.id])

    const partidosDisponibles = partidos.filter(
        (p) => getBetStatus(p) === 'ABIERTA' && !preds.some((pr) => pr.partidoId === p.id)
    )

    const agregarPrediccion = () => {
        const id = parseInt(newPartidoId, 10)
        if (!id) { alert('Selecciona un partido'); return }
        const partido = partidos.find((p) => p.id === id)
        if (!partido || getBetStatus(partido) !== 'ABIERTA') { alert('Este partido ya no acepta apuestas'); return }
        setPreds((prev) => [...prev, {
            partidoId: id,
            golesL: parseInt(newGl, 10) || 0,
            golesV: parseInt(newGv, 10) || 0,
            estado: 'PENDIENTE',
            pts: 0,
        }])
        setNewPartidoId(''); setNewGl('0'); setNewGv('0'); setShowAddForm(false)
    }

    const savePred = (partidoId) => {
        const partido = partidos.find((p) => p.id === partidoId)
        if (!partido || getBetStatus(partido) !== 'ABIERTA') {
            alert('Las apuestas para este partido ya están cerradas.')
            setEditId(null); return
        }
        setPreds((prev) => prev.map((p) =>
            p.partidoId === partidoId
                ? { ...p, golesL: parseInt(gl, 10) || 0, golesV: parseInt(gv, 10) || 0 }
                : p
        ))
        setEditId(null)
    }

    const totalPts = preds.reduce((a, p) => a + p.pts, 0)

    const scoreInputStyle = {
        width: 32, textAlign: 'center', background: '#1e2a45',
        border: '1px solid #3b5bdb', color: '#e2e8f0', borderRadius: 5,
        padding: '3px', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
    }

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="MIS PUNTOS"  value={totalPts} accent="#ffd43b" />
                <StatCard label="EXACTAS"    value={preds.filter((p) => p.estado === 'EXACTA').length}    accent="#69db7c" />
                <StatCard label="CORRECTAS"  value={preds.filter((p) => p.estado === 'CORRECTA').length}  accent="#a9e34b" />
                <StatCard label="FALLIDAS"   value={preds.filter((p) => p.estado === 'FALLIDA').length}   accent="#ff8787" />
            </div>

            <div className="offline-storage-note">{dbStatus}</div>

            <div style={{ marginBottom: 14 }}>
                {!showAddForm ? (
                    <button
                        onClick={() => setShowAddForm(true)}
                        disabled={partidosDisponibles.length === 0}
                        style={{
                            background: partidosDisponibles.length === 0 ? '#111' : '#1a2744',
                            border: `1px solid ${partidosDisponibles.length === 0 ? '#2a2a2a' : '#3b5bdb'}`,
                            color: partidosDisponibles.length === 0 ? '#444' : '#748ffc',
                            fontSize: 11, fontWeight: 700, padding: '8px 16px',
                            borderRadius: 8, cursor: partidosDisponibles.length === 0 ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.05em', fontFamily: 'inherit',
                        }}
                    >
                        {partidosDisponibles.length === 0
                            ? '⚽ Sin partidos disponibles para apostar'
                            : `+ Agregar Prediccion (${partidosDisponibles.length} disponible${partidosDisponibles.length > 1 ? 's' : ''})`}
                    </button>
                ) : (
                    <div style={{ background: '#0d1628', border: '1px solid #3b5bdb44', borderRadius: 10, padding: '16px 18px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, letterSpacing: '0.05em' }}>
                            ⚽ Nueva Prediccion
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                                <label style={{ fontSize: 9, color: '#4a6fa5', fontWeight: 700, letterSpacing: '0.07em' }}>PARTIDO</label>
                                <select value={newPartidoId} onChange={(e) => setNewPartidoId(e.target.value)} className="form-control--dark">
                                    <option value="">— Selecciona un partido —</option>
                                    {partidosDisponibles.map((p) => {
                                        const loc = getEquipo(equipos, p.local)
                                        const vis = getEquipo(equipos, p.visitante)
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {loc.flag} {loc.nombre} vs {vis.nombre} {vis.flag} · {p.fecha}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 9, color: '#4a6fa5', fontWeight: 700, letterSpacing: '0.07em' }}>MI PREDICCION</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input value={newGl} onChange={(e) => setNewGl(e.target.value)} type="number" min="0" max="20" style={{ ...scoreInputStyle, width: 38, fontSize: 16 }} />
                                    <span style={{ color: '#4a6fa5', fontWeight: 800, fontSize: 16 }}>–</span>
                                    <input value={newGv} onChange={(e) => setNewGv(e.target.value)} type="number" min="0" max="20" style={{ ...scoreInputStyle, width: 38, fontSize: 16 }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={agregarPrediccion} style={btnStyle('#2f9e44')}>✓ Guardar</button>
                                <button onClick={() => { setShowAddForm(false); setNewPartidoId(''); setNewGl('0'); setNewGv('0') }} style={btnStyle('#555')}>✕ Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {preds.map(({ golesL, golesV, estado, pts, partidoId }) => {
                    const partido = partidos.find((p) => p.id === partidoId)
                    if (!partido) return null
                    const loc = getEquipo(equipos, partido.local)
                    const vis = getEquipo(equipos, partido.visitante)
                    const c = PRED_COLOR[estado] || PRED_COLOR.PENDIENTE
                    const betStatus = getBetStatus(partido)
                    const editable = betStatus === 'ABIERTA'
                    const bloqueadoProximo = betStatus === 'BLOQUEADA_PRONTO'
                    const finalizado = betStatus === 'FINALIZADO'
                    const minsLeft = bloqueadoProximo ? minutosRestantes(partido) : null
                    const isEdit = editId === partidoId

                    return (
                        <div key={partidoId} style={{
                            background: finalizado ? '#0d1010' : bloqueadoProximo ? '#1a1500' : c.bg,
                            border: `1px solid ${finalizado ? '#33444422' : bloqueadoProximo ? '#e6770066' : c.dot + '44'}`,
                            borderRadius: 12, padding: '14px 18px',
                        }}>
                            {betStatus !== 'ABIERTA' && (
                                <div className={`pred-banner pred-banner--${finalizado ? 'finalizado' : 'bloqueado'}`}>
                                    <span style={{ fontSize: 13 }}>{finalizado ? '🏁' : '⏱️'}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: finalizado ? '#69db7c' : '#ffa94d', letterSpacing: '0.05em' }}>
                                        {finalizado
                                            ? `PARTIDO FINALIZADO · Resultado final: ${partido.golesL} – ${partido.golesV}`
                                            : bloqueadoProximo
                                                ? `APUESTAS CIERRAN EN ${minsLeft} MIN · El partido está por comenzar`
                                                : 'APUESTAS CERRADAS · Partido en curso'}
                                    </span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: c.text, minWidth: 80 }}>
                                    <Dot color={c.dot} />{estado}
                                </span>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 16 }}>{loc.flag}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{loc.nombre}</span>
                                    <span style={{ color: '#4a6fa5', fontSize: 12 }}>vs</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{vis.nombre}</span>
                                    <span style={{ fontSize: 16 }}>{vis.flag}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 11, color: '#4a6fa5' }}>Mi prediccion:</span>
                                    {isEdit ? (
                                        <>
                                            <input value={gl} onChange={(e) => setGl(e.target.value)} type="number" min="0" max="20" style={scoreInputStyle} />
                                            <span style={{ color: '#4a6fa5' }}>–</span>
                                            <input value={gv} onChange={(e) => setGv(e.target.value)} type="number" min="0" max="20" style={scoreInputStyle} />
                                            <button onClick={() => savePred(partidoId)} style={btnStyle('#2f9e44')}>✓</button>
                                            <button onClick={() => setEditId(null)} style={btnStyle('#555')}>✕</button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: c.text, letterSpacing: 3 }}>{golesL} – {golesV}</span>
                                            {editable && (
                                                <button onClick={() => { setEditId(partidoId); setGl(golesL); setGv(golesV) }} style={btnStyle('#4a6fa5')}>✎</button>
                                            )}
                                            {!editable && !finalizado && <span style={{ fontSize: 10, color: '#6b7280', fontStyle: 'italic' }}>🔒</span>}
                                        </>
                                    )}
                                </div>
                                {partido.golesL !== null && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 11, color: '#4a6fa5' }}>Real:</span>
                                        <span style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', letterSpacing: 3 }}>{partido.golesL} – {partido.golesV}</span>
                                    </div>
                                )}
                                <span style={{ fontSize: 18, fontWeight: 800, color: pts > 0 ? '#ffd43b' : '#4a6fa5', minWidth: 40, textAlign: 'right' }}>+{pts}pts</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TabPredicciones