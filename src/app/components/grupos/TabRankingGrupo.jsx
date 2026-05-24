import { useState, useEffect } from 'react'
import { calcularRanking, getHistorialRanking } from '../../../core/storage/puntuacion.js'

const MEDALLAS = ['🥇', '🥈', '🥉']

function TabRankingGrupo({ grupo, usuario }) {
    const [ranking, setRanking] = useState([])
    const [historial, setHistorial] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargar()
    }, [grupo.id])

    const cargar = async () => {
        setCargando(true)
        try {
            const [r, h] = await Promise.all([
                calcularRanking(grupo),
                getHistorialRanking(grupo.id),
            ])
            setRanking(r)
            setHistorial(h)
        } catch (e) {
            console.error('Error cargando ranking del grupo:', e)
        }
        setCargando(false)
    }

    const hayHistorial = historial.length > 1

    if (cargando) return (
        <div style={{ padding: '30px 0', textAlign: 'center', color: '#4a6fa5', fontSize: 13 }}>
            Cargando ranking del grupo…
        </div>
    )

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em' }}>
                    POSICIONES ACTUALES — GRUPO
                </div>
                <button onClick={cargar} style={{
                    fontSize: 10, background: 'transparent', border: '1px solid #1e2a45',
                    color: '#4a6fa5', padding: '4px 10px', borderRadius: 6,
                    cursor: 'pointer', fontFamily: 'inherit',
                }}>🔄</button>
            </div>

            {ranking.length === 0 && (
                <div style={{ fontSize: 12, color: '#4a6fa5', padding: '24px 0' }}>
                    Aún no hay predicciones en este grupo.
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {ranking.map((r, i) => {
                    const esMio = r.usuarioId === usuario.id
                    return (
                        <div key={r.usuarioId} style={{
                            background: esMio ? '#0f1e3a' : '#0d1628',
                            border: `1px solid ${esMio ? '#3b5bdb66' : '#1e2a45'}`,
                            borderRadius: 10, padding: '12px 16px',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <div style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>
                                {MEDALLAS[i] ?? <span style={{ fontSize: 12, color: '#4a6fa5', fontWeight: 700 }}>#{i + 1}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                                    {r.nombre} {esMio && <span style={{ fontSize: 10, color: '#748ffc' }}>(tú)</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                    {[
                                        { label: 'Exactas',    val: r.exactas,    color: '#69db7c' },
                                        { label: 'Correctas',  val: r.correctas,  color: '#a9e34b' },
                                        { label: 'Fallidas',   val: r.fallidas,   color: '#ff8787' },
                                        { label: 'Pendientes', val: r.pendientes, color: '#748ffc' },
                                    ].map((s) => (
                                        <span key={s.label} style={{ fontSize: 10, color: '#4a6fa5' }}>
                                            <span style={{ color: s.color, fontWeight: 700 }}>{s.val}</span> {s.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: i === 0 ? '#ffd43b' : '#748ffc', flexShrink: 0 }}>
                                {r.pts}
                                <span style={{ fontSize: 10, fontWeight: 400, color: '#4a6fa5', marginLeft: 2 }}>pts</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {hayHistorial && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                        EVOLUCIÓN DEL RANKING
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {historial.slice(-5).reverse().map((snap, i) => (
                            <div key={i} style={{
                                background: '#0d1628', border: '1px solid #1e2a45',
                                borderRadius: 10, padding: '10px 14px',
                            }}>
                                <div style={{ fontSize: 10, color: '#4a6fa5', marginBottom: 6 }}>
                                    {new Date(snap.fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    {snap.ranking.slice(0, 5).map((r, j) => (
                                        <span key={r.usuarioId} style={{ fontSize: 11, color: r.usuarioId === usuario.id ? '#748ffc' : '#4a6fa5' }}>
                                            {MEDALLAS[j] ?? `#${j + 1}`} {r.nombre.split(' ')[0]} · <strong>{r.pts}pts</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default TabRankingGrupo