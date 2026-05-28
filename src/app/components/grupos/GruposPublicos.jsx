import { useState, useEffect } from 'react'
import { getGruposPublicos, agregarMiembro, getRolEnGrupo } from '../../../core/storage/grupos.js'
import { getSolicitudDeUsuario, crearSolicitud } from '../../../core/storage/solicitudes.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function GruposPublicos({ usuario, onCambio }) {
    const [grupos, setGrupos]     = useState([])
    const [estados, setEstados]   = useState({})
    const [error, setError]       = useState('')
    const [msgs, setMsgs]         = useState({})
    const [cargando, setCargando] = useState(true)

    const recargar = async () => {
        setCargando(true)
        try {
            const gs = await getGruposPublicos()
            setGrupos(gs)
            const map = {}
            await Promise.all(gs.map(async (g) => {
                const solicitud   = await getSolicitudDeUsuario(g.id, usuario.id)
                const yaEsMiembro = getRolEnGrupo(g, usuario.id)
                map[g.id] = { solicitud, yaEsMiembro }
            }))
            setEstados(map)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => { recargar() }, [])

    const handleSolicitar = async (grupo) => {
        setError('')
        try {
            const rol = getRolEnGrupo(grupo, usuario.id)
            if (rol) { setError('Ya eres miembro de este grupo'); return }
            await crearSolicitud(grupo.id, usuario)
            setMsgs((m) => ({ ...m, [grupo.id]: '✓ Solicitud enviada, espera aprobación del admin' }))
            await recargar()
            onCambio()
        } catch (e) { setError(e.message) }
    }

    if (cargando) {
        return <div style={{ fontSize: 11, color: '#64748b', padding: '12px 0' }}>Cargando grupos públicos…</div>
    }

    if (grupos.length === 0) {
        return (
            <div style={{ fontSize: 11, color: '#94a3b8', padding: '12px 0' }}>
                No hay grupos públicos disponibles en este momento.
            </div>
        )
    }

    return (
        <div>
            <div className="g-label g-label--blue" style={{ marginBottom: 12 }}>
                🌐 GRUPOS PÚBLICOS
            </div>
            {error && <div className="g-alert g-alert--error" style={{ marginBottom: 10 }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grupos.map((g) => {
                    const { yaEsMiembro, solicitud } = estados[g.id] ?? {}
                    return (
                        <div key={g.id} className="g-public-card">
                            <div>
                                <div className="g-public-card__name">🏆 {g.nombre}</div>
                                {g.descripcion && <div className="g-public-card__desc">{g.descripcion}</div>}
                                <div className="g-public-card__meta">
                                    👥 {g.miembros.length} miembro{g.miembros.length !== 1 ? 's' : ''}
                                    {g.montoApuesta > 0 && ` · 💰 $${g.montoApuesta.toLocaleString('es-CO')}/persona`}
                                </div>
                            </div>
                            <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                {yaEsMiembro ? (
                                    <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>✓ Ya eres miembro</span>
                                ) : solicitud?.estado === 'PENDIENTE' ? (
                                    <span style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>⏳ Solicitud pendiente</span>
                                ) : solicitud?.estado === 'RECHAZADA' ? (
                                    <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>✕ Solicitud rechazada</span>
                                ) : (
                                    <button onClick={() => handleSolicitar(g)} style={btnStyle('#3b5bdb')}>
                                        Solicitar ingreso
                                    </button>
                                )}
                                {msgs[g.id] && <div style={{ fontSize: 10, color: '#16a34a', marginTop: 4 }}>{msgs[g.id]}</div>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default GruposPublicos