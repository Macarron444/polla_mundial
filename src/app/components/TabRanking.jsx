import { useState, useEffect } from 'react'
import { StatCard } from '../../shared/ui/index.jsx'
import { obtenerTodosUsuarios } from '../../core/storage/usuarios.js'
import { get } from '../../core/storage/httpClient.js'

const MEDALLAS = ['🥇', '🥈', '🥉']

function TabRanking({ usuario }) {
    const [ranking, setRanking]   = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => { cargarRankingGlobal() }, [])

    const cargarRankingGlobal = async () => {
        setCargando(true)
        try {
            const [usuarios, todasPreds] = await Promise.all([
                obtenerTodosUsuarios(),
                get('/predicciones'),
            ])

            const filas = usuarios.map((u) => {
                let pts = 0, exactas = 0, correctas = 0, fallidas = 0, pendientes = 0
                const predsUsuario = todasPreds.filter((p) => String(p.usuarioId) === String(u.id))
                predsUsuario.forEach((p) => {
                    pts += p.pts ?? 0
                    if      (p.estado === 'EXACTA')   exactas++
                    else if (p.estado === 'CORRECTA') correctas++
                    else if (p.estado === 'FALLIDA')  fallidas++
                    else                              pendientes++
                })
                return { id: u.id, nombre: u.nombre, email: u.email, pts, exactas, correctas, fallidas, pendientes, esMio: String(u.id) === String(usuario.id) }
            })

            setRanking(filas.sort((a, b) => b.pts - a.pts || b.exactas - a.exactas || b.correctas - a.correctas))
        } catch (e) {
            console.error('Error cargando ranking global:', e)
        }
        setCargando(false)
    }

    const maxPts   = ranking.length > 0 ? ranking[0].pts : 0
    const total    = ranking.reduce((s, r) => s + r.pts, 0)
    const promedio = ranking.length > 0 ? Math.round(total / ranking.length) : 0
    const miPos    = ranking.findIndex((r) => r.esMio) + 1

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="JUGADORES"   value={ranking.length}    accent="#748ffc" />
                <StatCard label="TU POSICIÓN" value={miPos || '—'}      sub={miPos ? `de ${ranking.length}` : ''} accent="#ffd43b" />
                <StatCard label="PROMEDIO"    value={promedio}           sub="pts" accent="#69db7c" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em' }}>
                    🌍 RANKING GLOBAL — TODOS LOS JUGADORES
                </div>
                <button onClick={cargarRankingGlobal}
                    style={{ fontSize: 10, background: 'transparent', border: '1px solid #1e2a45', color: '#4a6fa5', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🔄 Actualizar
                </button>
            </div>

            {cargando && <div style={{ padding: '30px 0', textAlign: 'center', color: '#4a6fa5', fontSize: 13 }}>Cargando ranking…</div>}
            {!cargando && ranking.length === 0 && <div style={{ padding: '30px 0', textAlign: 'center', color: '#4a6fa5', fontSize: 13 }}>Aún no hay predicciones registradas.</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ranking.map((r, i) => {
                    const pos      = i + 1
                    const posColor = pos === 1 ? '#ffd43b' : pos === 2 ? '#adb5bd' : pos === 3 ? '#cd7f32' : '#4a6fa5'
                    const pct      = maxPts > 0 ? Math.round((r.pts / maxPts) * 100) : 0
                    return (
                        <div key={r.id} style={{
                            background: r.esMio ? '#0f1e3a' : '#0d1628',
                            border: `1px solid ${r.esMio ? '#3b5bdb66' : pos === 1 ? '#ffd43b33' : '#1e2a45'}`,
                            borderRadius: 10, padding: '12px 16px',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <div style={{ fontSize: pos <= 3 ? 22 : 13, width: 30, textAlign: 'center', flexShrink: 0, color: posColor, fontWeight: 800 }}>
                                {MEDALLAS[i] ?? `#${pos}`}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {r.nombre} {r.esMio && <span style={{ fontSize: 10, color: '#748ffc' }}>(tú)</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Exactas',   val: r.exactas,    color: '#69db7c' },
                                        { label: 'Correctas', val: r.correctas,  color: '#a9e34b' },
                                        { label: 'Fallidas',  val: r.fallidas,   color: '#ff8787' },
                                        { label: 'Pend.',     val: r.pendientes, color: '#748ffc' },
                                    ].map((s) => (
                                        <span key={s.label} style={{ fontSize: 10, color: '#4a6fa5' }}>
                                            <span style={{ color: s.color, fontWeight: 700 }}>{s.val}</span> {s.label}
                                        </span>
                                    ))}
                                </div>
                                <div style={{ height: 3, background: '#1e2a45', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: pos === 1 ? '#ffd43b' : '#3b5bdb', borderRadius: 4, transition: 'width 0.4s' }} />
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: pos === 1 ? '#ffd43b' : '#e2e8f0' }}>{r.pts}</div>
                                <div style={{ fontSize: 9, color: '#4a6fa5' }}>pts</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{ marginTop: 20, padding: '12px 16px', background: '#0d1628', border: '1px solid #1e2a45', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#4a6fa5', lineHeight: 1.6 }}>
                    ℹ️ El ranking global muestra los puntos acumulados de cada jugador en <strong style={{ color: '#748ffc' }}>todas sus predicciones</strong>, independiente de los grupos.
                </div>
            </div>
        </div>
    )
}

export default TabRanking