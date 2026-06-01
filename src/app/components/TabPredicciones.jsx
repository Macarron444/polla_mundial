import { useEffect, useRef, useState } from 'react'
import { PRED_COLOR, StatCard, btnStyle, BadgeEstado } from '../../shared/ui/index.jsx'
import { getBetStatus, minutosRestantes } from '../../core/utils/betting.js'
import { getEquipo } from '../../core/utils/teams.js'
import { get, put } from '../../core/storage/httpClient.js'
import { resolverPrediccionGlobalPersonal } from '../../core/storage/puntuacion.js'

// ── Tarjeta individual por partido ───────────────────────────────────────────
function CardPartidoPersonal({ partido, equipos, predInicial, onGuardado }) {
    const [golesL, setGolesL] = useState(predInicial?.golesL ?? '')
    const [golesV, setGolesV] = useState(predInicial?.golesV ?? '')
    const [msg, setMsg] = useState('')
    const pred = predInicial

    useEffect(() => {
        setGolesL(predInicial?.golesL ?? '')
        setGolesV(predInicial?.golesV ?? '')
    }, [predInicial?.golesL, predInicial?.golesV])

    const local = equipos.find((e) => e.id === partido.local)
    const visitante = equipos.find((e) => e.id === partido.visitante)
    const betStatus = getBetStatus(partido)
    const bloqueado = betStatus !== 'ABIERTA'
    const bloqueadoProximo = betStatus === 'BLOQUEADA_PRONTO'
    const finalizado = betStatus === 'FINALIZADO'
    const minsLeft = bloqueadoProximo ? minutosRestantes(partido) : null
    const col = PRED_COLOR[pred?.estado ?? 'PENDIENTE']

    const inputStyle = (dis) => ({
        width: 36, textAlign: 'center',
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
        <div
            className="partido-card"
            style={{
                background: finalizado ? '#f8fafc' : bloqueadoProximo ? '#fffbeb' : '#ffffff',
                border: `1px solid ${finalizado ? '#e2e8f0' : bloqueadoProximo ? '#fde68a' : pred ? '#c7d2fe' : '#e2e8f0'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
        >
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
            <div className="partido-card__teams" style={{ marginBottom: 14 }}>
                <div className="partido-card__team-line">
                    <span className="partido-card__score-chip">
                        <input
                            type="number"
                            min="0"
                            max="20"
                            value={golesL}
                            disabled={bloqueado}
                            onChange={(e) => setGolesL(e.target.value)}
                            style={inputStyle(bloqueado)}
                        />
                    </span>
                    <span className="partido-card__flag">{local?.flag}</span>
                    <span className="partido-card__team-name">{local?.nombre}</span>
                </div>

                <div className="partido-card__team-line">
                    <span className="partido-card__score-chip">
                        <input
                            type="number"
                            min="0"
                            max="20"
                            value={golesV}
                            disabled={bloqueado}
                            onChange={(e) => setGolesV(e.target.value)}
                            style={inputStyle(bloqueado)}
                        />
                    </span>
                    <span className="partido-card__flag">{visitante?.flag}</span>
                    <span className="partido-card__team-name">{visitante?.nombre}</span>
                </div>
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

// ── Predicción global personal ────────────────────────────────────────────────
// Campeón acertado: +5 pts | Goleador acertado: +3 pts
function PrediccionGlobalPersonal({ usuario, equipos, partidos }) {
    const [campeon, setCampeon]   = useState('')
    const [goleador, setGoleador] = useState('')
    const [pred, setPred]         = useState(null)
    const [msg, setMsg]           = useState('')
    const [abierta, setAbierta]   = useState(false)
    const [cargando, setCargando] = useState(true)

    // Determinar si todos los partidos de la final han finalizado
    const torneoFinalizado = partidos.length > 0 && partidos.every((p) => p.estado === 'FINALIZADO')

    useEffect(() => {
        get(`/prediccion-global-personal/${usuario.id}`)
            .then((d) => {
                setPred(d ?? null)
                setCampeon(d?.campeon ?? '')
                setGoleador(d?.goleador ?? '')
            })
            .catch(() => {})
            .finally(() => setCargando(false))
    }, [usuario.id])

    // Resolver puntos automáticamente cuando el torneo finalice
    useEffect(() => {
        if (!torneoFinalizado || !pred || pred.resuelta) return
        // El campeón real es el equipo que ganó la Final
        const finalPartido = partidos.find((p) => p.fase?.toLowerCase().includes('final') && p.estado === 'FINALIZADO')
        if (!finalPartido) return
        const campeonReal = finalPartido.golesL > finalPartido.golesV
            ? equipos.find((e) => e.id === finalPartido.local)?.nombre
            : equipos.find((e) => e.id === finalPartido.visitante)?.nombre
        if (!campeonReal) return
        // goleadorReal lo debe ingresar el admin — por ahora se resuelve solo con campeón
        resolverPrediccionGlobalPersonal(campeonReal, null)
            .then(() => get(`/prediccion-global-personal/${usuario.id}`))
            .then((d) => setPred(d ?? null))
            .catch(() => {})
    }, [torneoFinalizado, pred?.resuelta])

    const handleGuardar = async () => {
        if (!campeon.trim() || !goleador.trim()) { setMsg('Completa ambos campos'); return }
        if (pred?.resuelta) { setMsg('El torneo ya finalizó, no puedes modificar tu predicción'); return }
        const nueva = {
            usuarioId: usuario.id, campeon: campeon.trim(), goleador: goleador.trim(),
            fecha: new Date().toISOString(), resuelta: false, ptsGlobal: 0,
        }
        await put(`/prediccion-global-personal/${usuario.id}`, nueva)
        setPred(nueva)
        setMsg('✓ Guardado')
        setTimeout(() => setMsg(''), 1500)
    }

    const yaCompletada   = campeon && goleador
    const bloqueada      = pred?.resuelta
    const ptsGlobal      = pred?.ptsGlobal ?? 0
    const campeonAcert   = pred?.campeonAcertado
    const goleadorAcert  = pred?.goleadorAcertado

    return (
        <div style={{ marginBottom: 20 }}>
            <button
                onClick={() => setAbierta(!abierta)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: bloqueada ? (ptsGlobal > 0 ? '#f0fdf4' : '#fff1f2') : yaCompletada ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${bloqueada ? (ptsGlobal > 0 ? '#bbf7d0' : '#fecdd3') : yaCompletada ? '#bbf7d0' : '#fde68a'}`,
                    borderRadius: abierta ? '10px 10px 0 0' : 10,
                    padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                <span style={{ fontSize: 11, fontWeight: 700, color: bloqueada ? (ptsGlobal > 0 ? '#166534' : '#9f1239') : yaCompletada ? '#166534' : '#92400e' }}>
                    🌍 PREDICCIÓN GLOBAL DEL TORNEO
                    {bloqueada && <span style={{ marginLeft: 8, fontSize: 10 }}>· {ptsGlobal} pts</span>}
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
                    {/* Resumen de puntos si ya se resolvió */}
                    {bloqueada && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                            {[
                                { label: 'CAMPEÓN', ok: campeonAcert, pts: 5 },
                                { label: 'GOLEADOR', ok: goleadorAcert, pts: 3 },
                            ].map((item) => (
                                <div key={item.label} style={{
                                    flex: 1, minWidth: 100, padding: '10px 14px', borderRadius: 8,
                                    background: item.ok ? '#f0fdf4' : '#fff1f2',
                                    border: `1px solid ${item.ok ? '#bbf7d0' : '#fecdd3'}`,
                                }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em' }}>{item.label}</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: item.ok ? '#16a34a' : '#dc2626', marginTop: 2 }}>
                                        {item.ok ? `✓ +${item.pts} pts` : '✗ 0 pts'}
                                    </div>
                                </div>
                            ))}
                            <div style={{
                                flex: 1, minWidth: 100, padding: '10px 14px', borderRadius: 8,
                                background: '#eef2ff', border: '1px solid #c7d2fe',
                            }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em' }}>TOTAL</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#3b5bdb', marginTop: 2 }}>{ptsGlobal} pts</div>
                            </div>
                        </div>
                    )}

                    {!bloqueada && (
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
                            Acertar el campeón suma <strong>+5 pts</strong> y el goleador <strong>+3 pts</strong>. Los puntos se calculan automáticamente al finalizar el torneo.
                        </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', marginBottom: 6 }}>
                            🏆 CAMPEÓN DEL MUNDIAL
                        </label>
                        <select
                            value={campeon}
                            onChange={(e) => setCampeon(e.target.value)}
                            disabled={bloqueada}
                            style={{ width: '100%', background: bloqueada ? '#f8fafc' : '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: 13, padding: '8px 10px', borderRadius: 8, fontFamily: 'inherit', cursor: bloqueada ? 'default' : 'pointer', opacity: bloqueada ? 0.7 : 1 }}
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
                            disabled={bloqueada}
                            style={{ opacity: bloqueada ? 0.7 : 1 }}
                        />
                    </div>

                    {!bloqueada && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>
                                {yaCompletada ? 'Actualizar predicción global' : 'Guardar predicción global'}
                            </button>
                            {msg && <span style={{ fontSize: 11, color: msg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>{msg}</span>}
                        </div>
                    )}
                    {bloqueada && (
                        <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                            🔒 El torneo ha finalizado. Tu predicción global está cerrada.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Componente principal ──────────────────────────────────────────────────────
function TabPredicciones({ usuario, partidos, equipos }) {
    const [preds, setPreds] = useState([])
    const [dbStatus, setDbStatus] = useState('Cargando predicciones...')
    const hydratedRef = useRef(false)
    const [openGroup, setOpenGroup] = useState('Grupo A')
    const [openSub, setOpenSub] = useState({})

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

    const faseLabel = {
        GRUPOS: 'Fase de Grupos',
        DIECISEISAVOS: 'Dieciseisavos de Final',
        OCTAVOS: 'Octavos de Final',
        CUARTOS: 'Cuartos',
        SEMIFINAL: 'Semifinal',
        FINAL: 'Final',
        TERCER_PUESTO: 'Tercer Puesto',
        ELIMINATORIAS: 'Eliminatorias',
    }

    const getGrupoPartido = (p) => {
        const loc = getEquipo(equipos, p.local)
        const vis = getEquipo(equipos, p.visitante)
        return p.grupo || loc?.grupo || vis?.grupo || null
    }

    const partidosValidos = (partidos || []).filter(Boolean)

    const partidosPorGrupo = partidosValidos.reduce((acc, p) => {
        const grupo = getGrupoPartido(p)
        const isGrupo = p.fase === 'GRUPOS' && grupo
        const key = isGrupo ? `Grupo ${grupo}` : 'Eliminatorias'
        if (!acc[key]) acc[key] = []
        acc[key].push(p)
        return acc
    }, {})

    Object.keys(partidosPorGrupo).forEach((key) => {
        partidosPorGrupo[key].sort((a, b) => {
            const aTime = a.fechaISO ? new Date(a.fechaISO).getTime() : 0
            const bTime = b.fechaISO ? new Date(b.fechaISO).getTime() : 0
            return aTime - bTime
        })
    })

    const ordenGrupos = Object.keys(partidosPorGrupo).sort((a, b) => {
        if (a === 'Eliminatorias') return 1
        if (b === 'Eliminatorias') return -1
        return a.localeCompare(b, 'es', { numeric: true })
    })

    const faseOrdenElim = ['DIECISEISAVOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'TERCER_PUESTO', 'FINAL']

    const isGroupOpen = (key) => openGroup === key
    const toggleGroup = (key) => {
        setOpenGroup((prev) => (prev === key ? null : key))
    }

    const isSubOpen = (key) => openSub[key] !== false
    const toggleSub = (key) => {
        setOpenSub((prev) => ({ ...prev, [key]: !isSubOpen(key) }))
    }

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="MIS PUNTOS" value={totalPts} accent="#d97706" />
                <StatCard label="EXACTAS" value={preds.filter((p) => p.estado === 'EXACTA').length} accent="#16a34a" />
                <StatCard label="CORRECTAS" value={preds.filter((p) => p.estado === 'CORRECTA').length} accent="#65a30d" />
                <StatCard label="FALLIDAS" value={preds.filter((p) => p.estado === 'FALLIDA').length} accent="#dc2626" />
            </div>

            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 16 }}>{dbStatus}</div>

            {/* Predicción global colapsable */}
            <PrediccionGlobalPersonal usuario={usuario} equipos={equipos} partidos={partidos} />

            {/* Info */}
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Predice el marcador exacto para ganar <strong style={{ color: '#3b5bdb' }}>3 pts</strong>, o solo el ganador para <strong style={{ color: '#3b5bdb' }}>1 pt</strong>.
            </div>

            {/* Partidos por grupo colapsables */}
            {ordenGrupos.map((grupoKey) => (
                <div key={grupoKey} style={{ marginBottom: 16 }}>
                    <button
                        onClick={() => toggleGroup(grupoKey)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: isGroupOpen(grupoKey) ? '10px 10px 0 0' : 10,
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: '#3b5bdb',
                            textTransform: 'uppercase',
                        }}>
                            {grupoKey === 'Grupo ?' ? 'Grupo sin definir' : grupoKey}
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{isGroupOpen(grupoKey) ? '▲' : '▼'}</span>
                    </button>

                    {isGroupOpen(grupoKey) && (
                        <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 12px 2px' }}>
                            {grupoKey === 'Eliminatorias' ? (
                                faseOrdenElim
                                    .filter((f) => partidosPorGrupo[grupoKey].some((p) => p.fase === f))
                                    .map((faseKey) => {
                                        const faseLabelText = faseLabel[faseKey] || faseKey
                                        const sectionKey = `${grupoKey}:${faseKey}`
                                        const partidosFase = partidosPorGrupo[grupoKey].filter((p) => p.fase === faseKey)
                                        return (
                                            <div key={sectionKey} style={{ marginBottom: 12 }}>
                                                <button
                                                    onClick={() => toggleSub(sectionKey)}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        background: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: isSubOpen(sectionKey) ? '10px 10px 0 0' : 10,
                                                        padding: '8px 14px',
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                    }}
                                                >
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{faseLabelText}</span>
                                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{isSubOpen(sectionKey) ? '▲' : '▼'}</span>
                                                </button>

                                                {isSubOpen(sectionKey) && (
                                                    <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '10px 10px 2px' }}>
                                                        <div className="matches-grid">
                                                            {partidosFase.map((p) => (
                                                                <CardPartidoPersonal
                                                                    key={p.id}
                                                                    partido={p}
                                                                    equipos={equipos}
                                                                    predInicial={preds.find((pr) => String(pr.partidoId) === String(p.id)) ?? null}
                                                                    onGuardado={handleGuardado}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                            ) : (
                                <div className="matches-grid">
                                    {partidosPorGrupo[grupoKey].map((p) => (
                                        <CardPartidoPersonal
                                            key={p.id}
                                            partido={p}
                                            equipos={equipos}
                                            predInicial={preds.find((pr) => String(pr.partidoId) === String(p.id)) ?? null}
                                            onGuardado={handleGuardado}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
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