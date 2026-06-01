import { useState, useEffect, useRef } from 'react'
import { getComentarios, agregarComentario, eliminarComentario } from '../../../core/storage/comentarios.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function ChatPartido({ grupoId, partidoId, usuario }) {
    const [comentarios, setComentarios] = useState([])
    const [texto, setTexto] = useState('')
    const [enviando, setEnviando] = useState(false)
    const bottomRef = useRef(null)
    const pollingRef = useRef(null)

    const recargar = async () => {
        try {
            const data = await getComentarios(grupoId, partidoId)
            setComentarios(Array.isArray(data) ? data : [])
        } catch {
            setComentarios([])
        }
    }

    // Carga inicial + polling cada 5 segundos para que todos los miembros vean mensajes nuevos
    useEffect(() => {
        recargar()
        pollingRef.current = setInterval(recargar, 5000)
        return () => clearInterval(pollingRef.current)
    }, [grupoId, partidoId])

    // Scroll automático al último mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comentarios])

    // Recarga también cuando se recupera conexión
    useEffect(() => {
        const handleOnline = () => recargar()
        window.addEventListener('online', handleOnline)
        window.addEventListener('polla_mundial:storage-change', handleOnline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('polla_mundial:storage-change', handleOnline)
        }
    }, [grupoId, partidoId])

    const handleEnviar = async () => {
        if (!texto.trim() || enviando) return
        setEnviando(true)
        try {
            await agregarComentario(grupoId, partidoId, usuario, texto.trim())
            setTexto('')
            await recargar()
        } finally {
            setEnviando(false)
        }
    }

    const handleEliminar = async (id) => {
        await eliminarComentario(grupoId, partidoId, id, usuario.id)
        await recargar()
    }

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#3b5bdb', letterSpacing: '0.07em', marginBottom: 10 }}>
                💬 CHAT DEL GRUPO ({comentarios.length})
            </div>

            {comentarios.length === 0 && (
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
                    Sé el primero en comentar.
                </div>
            )}

            <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                marginBottom: 12, maxHeight: 320, overflowY: 'auto',
                padding: '4px 2px',
            }}>
                {comentarios.map((c) => {
                    const esMio = String(c.usuarioId) === String(usuario.id)
                    const fecha = new Date(c.fecha).toLocaleString('es-CO', {
                        day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                    })
                    return (
                        <div key={c.id} style={{
                            background: esMio ? '#eef2ff' : '#f8fafc',
                            border: `1px solid ${esMio ? '#c7d2fe' : '#e2e8f0'}`,
                            borderRadius: esMio ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                            padding: '8px 12px',
                            alignSelf: esMio ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: esMio ? '#3b5bdb' : '#475569' }}>
                                    {esMio ? 'Tú' : c.nombre}
                                </span>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap' }}>{fecha}</span>
                                    {esMio && (
                                        <button onClick={() => handleEliminar(c.id)}
                                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: 'inherit', lineHeight: 1 }}>
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.5, wordBreak: 'break-word' }}>{c.texto}</div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    className="login-input"
                    placeholder="Escribe un mensaje..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEnviar()}
                    style={{ flex: 1, marginBottom: 0 }}
                    disabled={enviando}
                />
                <button onClick={handleEnviar} style={{ ...btnStyle('#3b5bdb'), opacity: enviando ? 0.6 : 1 }} disabled={enviando}>
                    {enviando ? '...' : 'Enviar'}
                </button>
            </div>
        </div>
    )
}

export default ChatPartido