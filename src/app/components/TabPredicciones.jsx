import { useEffect, useRef, useState } from 'react'
import { PRED_COLOR, StatCard, btnStyle, BadgeEstado } from '../../shared/ui/index.jsx'
import { getBetStatus, minutosRestantes } from '../../core/utils/betting.js'
import { getEquipo } from '../../core/utils/teams.js'
import { get, put } from '../../core/storage/httpClient.js'

// ── Tarjeta individual por partido ───────────────────────────────────────────
function CardPartidoPersonal({ partido, equipos, predInicial, onGuardado }) {
    const [golesL, setGolesL] = useState(predInicial?.golesL ?? '')
    const [golesV, setGolesV] = useState(predInicial?.golesV ?? '')
    const [msg, setMsg]       = useState('')
    const pred                = predInicial

    const local     = equipos.find((e) => e.id === partido.local)
    const visitante = equipos.find((e) => e.id === partido.visitante)
    const betStatus        = getBetStatus(partido)
    const bloqueado        = betStatus !== 'ABIERTA'
    const bloqueadoProximo = betStatus === 'BLOQUEADA_PRONTO'
    const finalizado       = betStatus === 'FINALIZADO'
    const minsLeft         = bloqueadoProximo ? minutosRestantes(partido) : null
    const col              = PRED_COLOR[pred?.estado ?? 'PENDIENTE']

    const inputStyle = (dis) => ({
        width: 48, textAlign: 'center',
        background: dis ? '#f1f5f9' : '#ffffff',
        border: `1px solid ${dis ? '#e2e8f0' : '#c7d2fe'}`,
        color: '#1e293b', fontSize: 18, fontWeight: 800,
        borderRadius: 8, padding: '6px 0',
        fontFamily: 'inherit', opacity: dis ? 0.6 : 1,
    })

    const handleGuardar = async () => {
        if (golesL === '' || golesV === '') { setMsg('Ingresa ambos marcadores'); return }
        await onGuardado(partido.id, Number(golesL), Number(golesV))
        setMsg('✓ Guardado')
        setTimeout(() => setMsg(''), 1200)
    }

    return (
        <div style={{
            background: finalizado ? '#f8fafc' : bloqueadoProximo ? '#fffbeb' : '#ffffff',
            border: `1px solid ${finalizado ? '#e2e8f0' : bloqueadoProximo ? '#fde68a' : pred ? '#c7d2fe' : '#e2e8f0'}`,
            borderRadius: 12, padding: '16px 18px', marginBottom: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            {/* Banner de estado */}
            {bloqueado && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: finalizado ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${finalizado ? '#bbf7d0' : '#fde68a'}`,
                    borderRadius: 8, padding: '6px 12px', marginBottom: 12,
                }}>
                    <span style={{ fontSize: 13 }}>{finalizado ? '🏁' : '⏱️'}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: finalizado ? '#166534' : '#92400e' }}>
                        {finalizado
                            ? `FINALIZADO · Resultado: ${partido.golesL} – ${partido.golesV}`
                            : bloqueadoProximo
                                ? `CIERRAN EN ${minsLeft} MIN`
                                : 'APUESTAS CERRADAS'}
                    </span>
                </div>
            )}

            {/* Cabecera fecha/fase + badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>{partido.fecha} · {partido.fase}</div>
                <BadgeEstado estado={partido.estado} />
            </div>

            {/* Equipos + inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                    {local?.flag} {local?.nombre}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="number" min="0" max="20" value={golesL} disabled={bloqueado}
                        onChange={(e) => setGolesL(e.target.value)} style={inputStyle(bloqueado)} />
                    <span style={{ color: '#94a3b8', fontWeight: 700 }}>–</span>
                    <input type="number" min="0" max="20" value={golesV} disabled={bloqueado}
                        onChange={(e) => setGolesV(e.target.value)} style={inputStyle(bloqueado)} />
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {visitante?.flag} {visitante?.nombre}
                </span>
            </div>

            {/* Footer */}
            {!bloqueado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>
                        {pred ? 'Actualizar predicción' : 'Guardar predicción'}
                    </button>
                    {msg && <span style={{ fontSize: 11, color: msg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>{msg}</span>}
                </div>
            )}

            {bloqueado && pred && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: col.bg, borderRadius: 8, padding: '8px 12px',
                }}>
                    <span style={{ fontSize: 11, color: col.text, fontWeight: 700 }}>
                        {pred.estado} · Mi predicción: {pred.golesL} – {pred.golesV}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: pred.pts > 0 ? '#d97706' : '#94a3b8' }}>
                        +{pred.pts ?? 0} pts
                    </span>
                </div>
            )}
            {bloqueado && !pred && (
                <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                    No predijiste este partido
                </div>
            )}
        </div>
    )
}

// ── Sección colapsable por fase ───────────────────────────────────────────────
function SeccionFase({ fase, partidos, equipos, preds, onGuardado }) {
    const [abierta, setAbierta] = useState(fase === 'GRUPOS')
    const predsFase = partidos.filter((p) => preds.some((pr) => pr.partidoId === p.id)).length

    return (
        <div style={{ marginBottom: 12 }}>
            <button
                onClick={() => setAbierta(!abierta)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: abierta ? '10px 10px 0 0' : 10,
                    padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#3b5bdb', letterSpacing: '0.05em' }}>
                    {fase} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({partidos.length} partidos)</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {predsFase > 0 && (
                        <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>
                            ✓ {predsFase}/{partidos.length} predichas
                        </span>
                    )}
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{abierta ? '▲' : '▼'}</span>
                </div>
            </button>
            {abierta && (
                <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 12px 2px' }}>
                    {partidos.map((p) => (
                        <CardPartidoPersonal
                            key={p.id}
                            partido={p}
                            equipos={equipos}
                            predInicial={preds.find((pr) => pr.partidoId === p.id) ?? null}
                            onGuardado={onGuardado}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Predicción global personal ────────────────────────────────────────────────
function PrediccionGlobalPersonal({ usuario, equipos }) {
    const [campeon, setCampeon]   = useState('')
    const [goleador, setGoleador] = useState('')
    const [msg, setMsg]           = useState('')
    const [abierta, setAbierta]   = useState(false)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        get(`/prediccion-global-personal/${usuario.id}`)
            .then((d) => { setCampeon(d?.campeon ?? ''); setGoleador(d?.goleador ?? '') })
            .catch(() => {})
            .finally(() => setCargando(false))
    }, [usuario.id])

    const handleGuardar = async () => {
        if (!campeon.trim() || !goleador.trim()) { setMsg('Completa ambos campos'); return }
        await put(`/prediccion-global-personal/${usuario.id}`, {
            usuarioId: usuario.id, campeon: campeon.trim(), goleador: goleador.trim(),
            fecha: new Date().toISOString(),
        })
        setMsg('✓ Guardado')
        setTimeout(() => setMsg(''), 1500)
    }

    const yaCompletada = campeon && goleador

    return (
        <div style={{ marginBottom: 20 }}>
            <button
                onClick={() => setAbierta(!abierta)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: yaCompletada ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${yaCompletada ? '#bbf7d0' : '#fde68a'}`,
                    borderRadius: abierta ? '10px 10px 0 0' : 10,
                    padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                <span style={{ fontSize: 11, fontWeight: 700, color: yaCompletada ? '#166534' : '#92400e' }}>
                    🌍 PREDICCIÓN GLOBAL DEL TORNEO
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {yaCompletada && (
                        <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>
                            🏆 {campeon} · 👟 {goleador}
                        </span>
                    )}
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{abierta ? '▲' : '▼'}</span>
                </div>
            </button>

            {abierta && (
                <div style={{
                    border: '1px solid #e2e8f0', borderTop: 'none',
                    borderRadius: '0 0 10px 10px', padding: '16px 18px',
                    background: '#ffffff',
                }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
                        Tu apuesta personal sobre el resultado final del torneo. No afecta puntos automáticamente.
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', marginBottom: 6 }}>
                            🏆 CAMPEÓN DEL MUNDIAL
                        </label>
                        <select
                            value={campeon}
                            onChange={(e) => setCampeon(e.target.value)}
                            style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: 13, padding: '8px 10px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                            <option value="">Selecciona un equipo...</option>
                            {equipos.map((e) => (
                                <option key={e.id} value={e.nombre}>{e.flag} {e.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', marginBottom: 6 }}>
                            👟 GOLEADOR DEL TORNEO
                        </label>
                        <input
                            className="login-input"
                            placeholder="Nombre del jugador..."
                            value={goleador}
                            onChange={(e) => setGoleador(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>
                            {yaCompletada ? 'Actualizar predicción global' : 'Guardar predicción global'}
                        </button>
                        {msg && <span style={{ fontSize: 11, color: msg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>{msg}</span>}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Componente principal ──────────────────────────────────────────────────────
function TabPredicciones({ usuario, partidos, equipos }) {
    const [preds, setPreds]       = useState([])
    const [dbStatus, setDbStatus] = useState('Cargando predicciones...')
    const hydratedRef             = useRef(false)

    useEffect(() => {
        hydratedRef.current = false
        setDbStatus('Cargando...')
        if (!usuario?.id) return
        get('/predicciones-personales')
            .then((todas) => {
                const mias = todas.filter((p) => String(p.usuarioId) === String(usuario.id))
                setPreds(mias)
                setDbStatus(`${mias.length} predicciones cargadas`)
            })
            .catch(() => { setPreds([]); setDbStatus('No se pudieron cargar las predicciones') })
            .finally(() => { hydratedRef.current = true })
    }, [usuario?.id])

    const handleGuardado = async (partidoId, golesL, golesV) => {
        const nueva = { partidoId, golesL, golesV, estado: 'PENDIENTE', pts: 0, usuarioId: usuario.id }
        await put(`/predicciones-personales/${usuario.id}_${partidoId}`, nueva)
        setPreds((prev) => {
            const existe = prev.some((p) => p.partidoId === partidoId)
            return existe
                ? prev.map((p) => p.partidoId === partidoId ? { ...p, golesL, golesV } : p)
                : [...prev, nueva]
        })
    }

    const totalPts = preds.reduce((a, p) => a + (p.pts ?? 0), 0)

    // Agrupar partidos por fase
    const faseOrden = ['GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL']
    const porFase   = partidos.reduce((acc, p) => {
        const f = p.fase || 'OTROS'
        if (!acc[f]) acc[f] = []
        acc[f].push(p)
        return acc
    }, {})
    const fases = [...faseOrden.filter((f) => porFase[f]), ...Object.keys(porFase).filter((f) => !faseOrden.includes(f))]

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="MIS PUNTOS" value={totalPts}                                                      accent="#d97706" />
                <StatCard label="EXACTAS"    value={preds.filter((p) => p.estado === 'EXACTA').length}    accent="#16a34a" />
                <StatCard label="CORRECTAS"  value={preds.filter((p) => p.estado === 'CORRECTA').length}  accent="#65a30d" />
                <StatCard label="FALLIDAS"   value={preds.filter((p) => p.estado === 'FALLIDA').length}   accent="#dc2626" />
            </div>

            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 16 }}>{dbStatus}</div>

            {/* Predicción global colapsable */}
            <PrediccionGlobalPersonal usuario={usuario} equipos={equipos} />

            {/* Info */}
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Predice el marcador exacto para ganar <strong style={{ color: '#3b5bdb' }}>3 pts</strong>, o solo el ganador para <strong style={{ color: '#3b5bdb' }}>1 pt</strong>.
            </div>

            {/* Partidos por fase colapsables */}
            {fases.map((fase) => (
                <SeccionFase
                    key={fase}
                    fase={fase}
                    partidos={porFase[fase]}
                    equipos={equipos}
                    preds={preds}
                    onGuardado={handleGuardado}
                />
            ))}

            {partidos.length === 0 && (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                    No hay partidos disponibles aún.
                </div>
            )}
        </div>
    )
}

export default TabPredicciones