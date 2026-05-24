import { useState, useEffect } from 'react'
import { getGruposPublicos, agregarMiembro, getRolEnGrupo } from '../../../core/storage/grupos.js'
import { getSolicitudDeUsuario, crearSolicitud } from '../../../core/storage/solicitudes.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function GruposPublicos({ usuario, onCambio }) {
    const [grupos, setGrupos]   = useState([])
    const [estados, setEstados] = useState({})   // { [grupoId]: { solicitud, yaEsMiembro } }
    const [error, setError]     = useState('')
    const [msgs, setMsgs]       = useState({})
    const [cargando, setCargando] = useState(true)

    const recargar = async () => {
        setCargando(true)
        try {
            const gs = await getGruposPublicos()
            setGrupos(gs)
            const map = {}
            await Promise.all(gs.map(async (g) => {
                const solicitud    = await getSolicitudDeUsuario(g.id, usuario.id)
                const yaEsMiembro  = getRolEnGrupo(g, usuario.id)
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
        return <div style={{ fontSize: 11, color: '#4a6fa5', padding: '12px 0' }}>Cargando grupos públicos…</div>
    }

    if (grupos.length === 0) {
        return (
            <div style={{ fontSize: 11, color: '#2a3a5a', padding: '12px 0' }}>
                No hay grupos públicos disponibles en este momento.
            </div>
        )
    }

    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 12 }}>
                🌐 GRUPOS PÚBLICOS
            </div>
            {error && <div style={{ fontSize: 11, color: '#ff8787', marginBottom: 10 }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grupos.map((g) => {
                    const { yaEsMiembro, solicitud } = estados[g.id] ?? {}
                    return (
                        <div key={g.id} style={{
                            background: '#0d1628', border: '1px solid #1e2a45',
                            borderRadius: 12, padding: '14px 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>🏆 {g.nombre}</div>
                                {g.descripcion && <div style={{ fontSize: 10, color: '#4a6fa5', marginTop: 2 }}>{g.descripcion}</div>}
                                <div style={{ fontSize: 10, color: '#2a3a5a', marginTop: 4 }}>
                                    👥 {g.miembros.length} miembro{g.miembros.length !== 1 ? 's' : ''}
                                    {g.montoApuesta > 0 && ` · 💰 $${g.montoApuesta.toLocaleString('es-CO')}/persona`}
                                </div>
                            </div>
                            <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                {yaEsMiembro ? (
                                    <span style={{ fontSize: 10, color: '#69db7c' }}>✓ Ya eres miembro</span>
                                ) : solicitud?.estado === 'PENDIENTE' ? (
                                    <span style={{ fontSize: 10, color: '#ffd43b' }}>⏳ Solicitud pendiente</span>
                                ) : solicitud?.estado === 'RECHAZADA' ? (
                                    <span style={{ fontSize: 10, color: '#ff8787' }}>✕ Solicitud rechazada</span>
                                ) : (
                                    <button onClick={() => handleSolicitar(g)} style={btnStyle('#3b5bdb')}>
                                        Solicitar ingreso
                                    </button>
                                )}
                                {msgs[g.id] && <div style={{ fontSize: 10, color: '#69db7c', marginTop: 4 }}>{msgs[g.id]}</div>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default GruposPublicos