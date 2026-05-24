import BadgeMiembro from './BadgeMiembro.jsx'
import { getRolEnGrupo } from '../../../core/storage/grupos.js'

function CardGrupo({ grupo, usuario, onAbrir }) {
    const rolActual = getRolEnGrupo(grupo, usuario.id)
    const esAdmin = rolActual === 'ADMIN'
    const fecha = new Date(grupo.fechaCreacion).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
    })

    return (
        <div
            onClick={onAbrir}
            style={{
                background: '#0d1628',
                border: `1px solid ${esAdmin ? '#3b5bdb55' : '#1e2a45'}`,
                borderRadius: 12,
                padding: '16px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = esAdmin ? '#3b5bdb' : '#2a3a5a')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = esAdmin ? '#3b5bdb55' : '#1e2a45')}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 10, fontSize: 20,
                    background: esAdmin ? '#1a1e3a' : '#0d1628',
                    border: `1px solid ${esAdmin ? '#3b5bdb' : '#1e2a45'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    🏆
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0' }}>{grupo.nombre}</div>
                    {grupo.descripcion && (
                        <div style={{ fontSize: 10, color: '#4a6fa5', marginTop: 2 }}>{grupo.descripcion}</div>
                    )}
                    <div style={{ fontSize: 10, color: '#2a3a5a', marginTop: 4 }}>Creado el {fecha}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <BadgeMiembro rol={rolActual} />
                <div style={{ fontSize: 10, color: '#4a6fa5' }}>
                    👥 {grupo.miembros.length} {grupo.miembros.length === 1 ? 'miembro' : 'miembros'}
                </div>
            </div>
        </div>
    )
}

export default CardGrupo