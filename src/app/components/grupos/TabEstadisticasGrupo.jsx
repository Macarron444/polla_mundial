import { useEffect, useState } from 'react'
import { getPredicionesPorGrupo } from '../../../core/storage/prediccionesGrupo.js'

function BarraProgreso({ valor, total, color }) {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: '#1e2a45', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 10, color, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
        </div>
    )
}

function TabEstadisticasGrupo({ grupo, usuario }) {
    const [preds, setPreds] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let activo = true

        const cargar = async () => {
            setCargando(true)
            setError('')
            try {
                const datos = await getPredicionesPorGrupo(grupo.id)
                if (activo) setPreds(Array.isArray(datos) ? datos : [])
            } catch (e) {
                if (activo) {
                    setPreds([])
                    setError(e.message)
                }
            } finally {
                if (activo) setCargando(false)
            }
        }

        cargar()
        return () => { activo = false }
    }, [grupo.id])

    if (cargando) {
        return (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#4a6fa5', fontSize: 13 }}>
                Cargando estadisticas del grupo...
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ background: '#2a0d0d', border: '1px solid #c92a2a44', color: '#ff8787', fontSize: 11, padding: '10px 14px', borderRadius: 8 }}>
                No se pudieron cargar las estadisticas: {error}
            </div>
        )
    }

    const resueltas = preds.filter((p) => p.estado !== 'PENDIENTE')
    const miembros = Array.isArray(grupo.miembros) ? grupo.miembros : []

    const statsPorUsuario = miembros.map((m) => {
        const mias = preds.filter((p) => String(p.usuarioId) === String(m.usuarioId))
        const exactas = mias.filter((p) => p.estado === 'EXACTA').length
        const correctas = mias.filter((p) => p.estado === 'CORRECTA').length
        const fallidas = mias.filter((p) => p.estado === 'FALLIDA').length
        const pendientes = mias.filter((p) => p.estado === 'PENDIENTE').length
        const pts = mias.reduce((s, p) => s + (p.pts ?? 0), 0)
        const total = exactas + correctas + fallidas
        const efectividad = total > 0 ? Math.round(((exactas + correctas) / total) * 100) : 0
        const usaComodin = mias.some((p) => p.usaComodin)
        return { ...m, exactas, correctas, fallidas, pendientes, pts, efectividad, total, usaComodin }
    }).sort((a, b) => b.efectividad - a.efectividad)

    const mejorExacto = statsPorUsuario.reduce((best, s) => s.exactas > (best?.exactas ?? -1) ? s : best, null)
    const peorFallido = statsPorUsuario.reduce((worst, s) => s.fallidas > (worst?.fallidas ?? -1) ? s : worst, null)

    return (
        <div>
            {/* Resumen global */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { label: 'PREDICCIONES', val: preds.length, color: '#748ffc' },
                    { label: 'RESUELTAS', val: resueltas.length, color: '#69db7c' },
                    { label: 'PENDIENTES', val: preds.length - resueltas.length, color: '#ffd43b' },
                ].map((s) => (
                    <div key={s.label} style={{
                        flex: 1, minWidth: 100, background: '#0d1628',
                        border: `1px solid ${s.color}33`, borderRadius: 10, padding: '12px 16px',
                    }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em' }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                    </div>
                ))}
            </div>

            {/* Curiosidades */}
            {mejorExacto?.exactas > 0 && (
                <div style={{
                    background: '#0a2010', border: '1px solid #2f9e4444',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#69db7c',
                }}>
                    🎯 Mejor marcador exacto: <strong>{mejorExacto.nombre}</strong> con {mejorExacto.exactas} exactas
                </div>
            )}
            {peorFallido?.fallidas > 0 && (
                <div style={{
                    background: '#1a0808', border: '1px solid #c92a2a44',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 11, color: '#ff8787',
                }}>
                    😬 Más predicciones fallidas: <strong>{peorFallido.nombre}</strong> con {peorFallido.fallidas} fallidas
                </div>
            )}

            {/* Stats por miembro */}
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                ESTADÍSTICAS POR PARTICIPANTE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {statsPorUsuario.map((s) => {
                    const esMio = String(s.usuarioId) === String(usuario.id)
                    return (
                        <div key={s.usuarioId} style={{
                            background: esMio ? '#0f1e3a' : '#0d1628',
                            border: `1px solid ${esMio ? '#3b5bdb55' : '#1e2a45'}`,
                            borderRadius: 12, padding: '14px 16px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{s.nombre}</span>
                                    {esMio && <span style={{ fontSize: 10, color: '#748ffc', marginLeft: 6 }}>(tú)</span>}
                                    {s.usaComodin && <span style={{ fontSize: 10, color: '#ffd43b', marginLeft: 6 }}>⚡ comodín usado</span>}
                                </div>
                                <span style={{ fontSize: 20, fontWeight: 800, color: '#748ffc' }}>{s.pts} <span style={{ fontSize: 10, color: '#4a6fa5', fontWeight: 400 }}>pts</span></span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {[
                                    { label: 'Exactas', val: s.exactas, color: '#69db7c' },
                                    { label: 'Correctas', val: s.correctas, color: '#a9e34b' },
                                    { label: 'Fallidas', val: s.fallidas, color: '#ff8787' },
                                ].map((row) => (
                                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 10, color: '#4a6fa5', width: 66 }}>{row.label} ({row.val})</span>
                                        <BarraProgreso valor={row.val} total={s.total} color={row.color} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: 10, color: '#4a6fa5', marginTop: 8 }}>
                                Efectividad: <strong style={{ color: s.efectividad >= 50 ? '#69db7c' : '#ff8787' }}>{s.efectividad}%</strong>
                                · Pendientes: {s.pendientes}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TabEstadisticasGrupo
