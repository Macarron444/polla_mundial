import { useState } from 'react'
import { getGruposPublicos, agregarMiembro, getRolEnGrupo } from '../../../core/storage/grupos.js'
import { getSolicitudDeUsuario, crearSolicitud } from '../../../core/storage/solicitudes.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function GruposPublicos({ usuario, onCambio }) {
    const [grupos, setGrupos] = useState(() => getGruposPublicos())
    const [error, setError] = useState('')
    const [msgs, setMsgs] = useState({})

    const recargar = () => setGrupos(getGruposPublicos())

    const handleSolicitar = (grupo) => {
        setError('')
        try {
            const yaEsMiembro = getRolEnGrupo(grupo, usuario.id)
            if (yaEsMiembro) { setError('Ya eres miembro de este grupo'); return }
            crearSolicitud(grupo.id, usuario)
            setMsgs((m) => ({ ...m, [grupo.id]: '✓ Solicitud enviada' }))
            recargar()
            onCambio()
        } catch (e) { setError(e.message) }
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
                    const yaEsMiembro = getRolEnGrupo(g, usuario.id)
                    const solicitud = getSolicitudDeUsuario(g.id, usuario.id)
                    return (
                        <div key={g.id} style={{ background: '#0d1628', border: '1px solid #1e2a45', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>🏆 {g.nombre}</div>
                                {g.descripcion && <div style={{ fontSize: 10, color: '#4a6fa5', marginTop: 2 }}>{g.descripcion}</div>}
                                <div style={{ fontSize: 10, color: '#2a3a5a', marginTop: 4 }}>
                                    👥 {g.miembros.length} miembros
                                    {g.montoApuesta > 0 && ` · 💰 $${g.montoApuesta.toLocaleString('es-CO')}/persona`}
                                </div>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                                {yaEsMiembro ? (
                                    <span style={{ fontSize: 10, color: '#69db7c' }}>✓ Ya eres miembro</span>
                                ) : solicitud ? (
                                    <span style={{ fontSize: 10, color: '#ffd43b' }}>⏳ Solicitud enviada</span>
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