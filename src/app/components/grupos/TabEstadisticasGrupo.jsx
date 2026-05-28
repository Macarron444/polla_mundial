import { useEffect, useState } from 'react'
import { getPredicionesPorGrupo } from '../../../core/storage/prediccionesGrupo.js'
import { esSuperAdminPorEmail } from '../../../core/constants/superadmin.js'

function BarraProgreso({ valor, total, color }) {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 10, color, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
        </div>
    )
}

function TabEstadisticasGrupo({ grupo, usuario }) {
    const [preds, setPreds]       = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError]       = useState('')

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            setCargando(true); setError('')
            try {
                const datos = await getPredicionesPorGrupo(grupo.id)
                if (activo) setPreds(Array.isArray(datos) ? datos : [])
            } catch (e) {
                if (activo) { setPreds([]); setError(e.message) }
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [grupo.id])

    if (cargando) {
        return <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>Cargando estadísticas del grupo...</div>
    }

    if (error) {
        return (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 11, padding: '10px 14px', borderRadius: 8 }}>
                No se pudieron cargar las estadísticas: {error}
            </div>
        )
    }

    const resueltas = preds.filter((p) => p.estado !== 'PENDIENTE')

    // Excluir superadmin de la lista de miembros visible
    const miembros = (Array.isArray(grupo.miembros) ? grupo.miembros : [])
        .filter((m) => !esSuperAdminPorEmail(m.email))

    const statsPorUsuario = miembros.map((m) => {
        const mias        = preds.filter((p) => String(p.usuarioId) === String(m.usuarioId))
        const exactas     = mias.filter((p) => p.estado === 'EXACTA').length
        const correctas   = mias.filter((p) => p.estado === 'CORRECTA').length
        const fallidas    = mias.filter((p) => p.estado === 'FALLIDA').length
        const pendientes  = mias.filter((p) => p.estado === 'PENDIENTE').length
        const pts         = mias.reduce((s, p) => s + (p.pts ?? 0), 0)
        const total       = exactas + correctas + fallidas
        const efectividad = total > 0 ? Math.round(((exactas + correctas) / total) * 100) : 0
        const usaComodin  = mias.some((p) => p.usaComodin)
        return { ...m, exactas, correctas, fallidas, pendientes, pts, efectividad, total, usaComodin }
    }).sort((a, b) => b.efectividad - a.efectividad)

    const mejorExacto = statsPorUsuario.reduce((best, s)  => s.exactas  > (best?.exactas  ?? -1) ? s : best, null)
    const peorFallido = statsPorUsuario.reduce((worst, s) => s.fallidas > (worst?.fallidas ?? -1) ? s : worst, null)

    return (
        <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { label: 'PREDICCIONES', val: preds.length,                    color: '#3b5bdb' },
                    { label: 'RESUELTAS',    val: resueltas.length,                color: '#16a34a' },
                    { label: 'PENDIENTES',   val: preds.length - resueltas.length, color: '#d97706' },
                ].map((s) => (
                    <div key={s.label} style={{
                        flex: 1, minWidth: 100, background: '#ffffff',
                        border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em' }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                    </div>
                ))}
            </div>

            {mejorExacto?.exactas > 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#166534' }}>
                    🎯 Mejor marcador exacto: <strong>{mejorExacto.nombre}</strong> con {mejorExacto.exactas} exactas
                </div>
            )}
            {peorFallido?.fallidas > 0 && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 11, color: '#991b1b' }}>
                    😬 Más predicciones fallidas: <strong>{peorFallido.nombre}</strong> con {peorFallido.fallidas} fallidas
                </div>
            )}

            <div style={{ fontSize: 9, fontWeight: 700, color: '#3b5bdb', letterSpacing: '0.07em', marginBottom: 10 }}>
                ESTADÍSTICAS POR PARTICIPANTE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {statsPorUsuario.map((s) => {
                    const esMio = String(s.usuarioId) === String(usuario.id)
                    return (
                        <div key={s.usuarioId} style={{
                            background: esMio ? '#eef2ff' : '#ffffff',
                            border: `1px solid ${esMio ? '#c7d2fe' : '#e2e8f0'}`,
                            borderRadius: 12, padding: '14px 16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.nombre}</span>
                                    {esMio && <span style={{ fontSize: 10, color: '#3b5bdb', marginLeft: 6 }}>(tú)</span>}
                                    {s.usaComodin && <span style={{ fontSize: 10, color: '#d97706', marginLeft: 6 }}>⚡ comodín usado</span>}
                                </div>
                                <span style={{ fontSize: 20, fontWeight: 800, color: '#3b5bdb' }}>
                                    {s.pts} <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>pts</span>
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {[
                                    { label: 'Exactas',   val: s.exactas,   color: '#16a34a' },
                                    { label: 'Correctas', val: s.correctas, color: '#65a30d' },
                                    { label: 'Fallidas',  val: s.fallidas,  color: '#dc2626' },
                                ].map((row) => (
                                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 10, color: '#475569', width: 66 }}>{row.label} ({row.val})</span>
                                        <BarraProgreso valor={row.val} total={s.total} color={row.color} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 8 }}>
                                Efectividad: <strong style={{ color: s.efectividad >= 50 ? '#16a34a' : '#dc2626' }}>{s.efectividad}%</strong>
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