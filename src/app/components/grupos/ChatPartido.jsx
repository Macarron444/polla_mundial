import { useState } from 'react'
import { getComentarios, agregarComentario, eliminarComentario } from '../../../core/storage/comentarios.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function ChatPartido({ grupoId, partidoId, usuario }) {
    const [comentarios, setComentarios] = useState(() => getComentarios(grupoId, partidoId))
    const [texto, setTexto] = useState('')

    const recargar = () => setComentarios(getComentarios(grupoId, partidoId))

    const handleEnviar = () => {
        if (!texto.trim()) return
        agregarComentario(grupoId, partidoId, usuario, texto)
        setTexto('')
        recargar()
    }

    const handleEliminar = (id) => {
        eliminarComentario(grupoId, partidoId, id, usuario.id)
        recargar()
    }

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                💬 CHAT DEL PARTIDO ({comentarios.length})
            </div>

            {comentarios.length === 0 && (
                <div style={{ fontSize: 11, color: '#2a3a5a', marginBottom: 12 }}>
                    Sé el primero en comentar.
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, maxHeight: 260, overflowY: 'auto' }}>
                {comentarios.map((c) => {
                    const esMio = c.usuarioId === usuario.id
                    const fecha = new Date(c.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                    return (
                        <div key={c.id} style={{
                            background: esMio ? '#0f1e3a' : '#0d1628',
                            border: `1px solid ${esMio ? '#3b5bdb44' : '#1e2a45'}`,
                            borderRadius: 10, padding: '8px 12px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: esMio ? '#748ffc' : '#4a6fa5' }}>
                                    {c.nombre} {esMio && '(tú)'}
                                </span>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontSize: 9, color: '#2a3a5a' }}>{fecha}</span>
                                    {esMio && (
                                        <button onClick={() => handleEliminar(c.id)}
                                            style={{ background: 'none', border: 'none', color: '#c92a2a', cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: 'inherit' }}>
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>{c.texto}</div>
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    className="login-input"
                    placeholder="Escribe un comentario..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
                    style={{ flex: 1, marginBottom: 0 }}
                />
                <button onClick={handleEnviar} style={btnStyle('#3b5bdb')}>Enviar</button>
            </div>
        </div>
    )
}

export default ChatPartido