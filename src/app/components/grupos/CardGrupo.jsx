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
                background: '#ffffff',
                border: `1px solid ${esAdmin ? '#c7d2fe' : '#e2e8f0'}`,
                borderRadius: 12,
                padding: '16px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                transition: 'box-shadow 0.2s, border-color 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = esAdmin ? '#818cf8' : '#c7d2fe'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,91,219,0.1)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = esAdmin ? '#c7d2fe' : '#e2e8f0'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 10, fontSize: 20,
                    background: esAdmin ? '#eef2ff' : '#f8fafc',
                    border: `1px solid ${esAdmin ? '#c7d2fe' : '#e2e8f0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    🏆
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{grupo.nombre}</div>
                    {grupo.descripcion && (
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{grupo.descripcion}</div>
                    )}
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Creado el {fecha}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <BadgeMiembro rol={rolActual} />
                <div style={{ fontSize: 10, color: '#64748b' }}>
                    👥 {grupo.miembros.length} {grupo.miembros.length === 1 ? 'miembro' : 'miembros'}
                </div>
            </div>
        </div>
    )
}

export default CardGrupo