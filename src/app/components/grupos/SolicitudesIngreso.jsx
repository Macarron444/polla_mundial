import { useState } from 'react'
import { getSolicitudesPorGrupo, resolverSolicitud } from '../../../core/storage/solicitudes.js'
import { agregarMiembro } from '../../../core/storage/grupos.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function SolicitudesIngreso({ grupo, onCambio }) {
    const [solicitudes, setSolicitudes] = useState(() => getSolicitudesPorGrupo(grupo.id))
    const [error, setError] = useState('')

    const recargar = () => setSolicitudes(getSolicitudesPorGrupo(grupo.id))

    const handleResolver = (sol, decision) => {
        setError('')
        try {
            resolverSolicitud(sol.id, decision)
            if (decision === 'APROBADA') {
                agregarMiembro(grupo.id, { id: sol.usuarioId, nombre: sol.nombre, email: sol.email })
            }
            recargar()
            onCambio()
        } catch (e) { setError(e.message) }
    }

    if (solicitudes.length === 0) {
        return (
            <div style={{ fontSize: 11, color: '#2a3a5a', padding: '12px 0' }}>
                No hay solicitudes de ingreso pendientes.
            </div>
        )
    }

    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#ffd43b', letterSpacing: '0.07em', marginBottom: 10 }}>
                📬 SOLICITUDES PENDIENTES ({solicitudes.length})
            </div>
            {error && <div style={{ fontSize: 11, color: '#ff8787', marginBottom: 10 }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {solicitudes.map((s) => (
                    <div key={s.id} style={{
                        background: '#0d1628', border: '1px solid #ffd43b33',
                        borderRadius: 10, padding: '12px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{s.nombre}</div>
                            <div style={{ fontSize: 10, color: '#4a6fa5' }}>{s.email}</div>
                            <div style={{ fontSize: 9, color: '#2a3a5a', marginTop: 2 }}>
                                {new Date(s.fecha).toLocaleDateString('es-CO')}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleResolver(s, 'APROBADA')} style={btnStyle('#2f9e44')}>✓ Aprobar</button>
                            <button onClick={() => handleResolver(s, 'RECHAZADA')} style={btnStyle('#c92a2a')}>✕ Rechazar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SolicitudesIngreso