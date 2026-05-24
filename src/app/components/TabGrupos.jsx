import { useState, useCallback } from 'react'
import CardGrupo from './grupos/CardGrupo.jsx'
import FormCrearGrupo from './grupos/FormCrearGrupo.jsx'
import VistaGrupo from './grupos/VistaGrupo.jsx'
import { btnStyle, StatCard } from '../../shared/ui/index.jsx'
import { getGruposDeUsuario } from '../../core/storage/grupos.js'

function TabGrupos({ usuario }) {
    const [grupos, setGrupos] = useState(() => getGruposDeUsuario(usuario.id))
    const [vistaDetalle, setVistaDetalle] = useState(null)
    const [creando, setCreando] = useState(false)

    const recargar = useCallback(() => {
        const actualizados = getGruposDeUsuario(usuario.id)
        setGrupos(actualizados)
        if (vistaDetalle) {
            const grupoActualizado = actualizados.find((g) => g.id === vistaDetalle.id)
            setVistaDetalle(grupoActualizado ?? null)
        }
    }, [usuario.id, vistaDetalle])

    const handleCreado = (grupo) => {
        setCreando(false)
        recargar()
        setVistaDetalle(grupo)
    }

    const gruposComoAdmin = grupos.filter((g) =>
        g.miembros.some((m) => m.usuarioId === usuario.id && m.rol === 'ADMIN')
    )
    const gruposComoParticipante = grupos.filter((g) =>
        g.miembros.some((m) => m.usuarioId === usuario.id && m.rol === 'PARTICIPANTE')
    )

    if (vistaDetalle) {
        return (
            <div className="tab-section">
                <VistaGrupo
                    grupo={vistaDetalle}
                    usuario={usuario}
                    onVolver={() => { setVistaDetalle(null); recargar() }}
                    onCambio={recargar}
                />
            </div>
        )
    }

    if (creando) {
        return (
            <div className="tab-section">
                <FormCrearGrupo
                    usuario={usuario}
                    onCreado={handleCreado}
                    onCancelar={() => setCreando(false)}
                />
            </div>
        )
    }

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="MIS GRUPOS" value={grupos.length} accent="#748ffc" />
                <StatCard label="SOY ADMIN" value={gruposComoAdmin.length} accent="#ffd43b" />
                <StatCard label="SOY PARTICIPANTE" value={gruposComoParticipante.length} accent="#69db7c" />
            </div>

            <button onClick={() => setCreando(true)} style={{ ...btnStyle('#3b5bdb'), marginBottom: 22 }}>
                + Crear grupo de apuestas
            </button>

            {grupos.length === 0 && (
                <div style={{
                    background: '#0d1628', border: '1px solid #1e2a45',
                    borderRadius: 12, padding: '36px 24px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                        Aún no tienes grupos
                    </div>
                    <div style={{ fontSize: 11, color: '#4a6fa5' }}>
                        Crea tu primer grupo para hacer apuestas privadas con tus amigos.
                    </div>
                </div>
            )}

            {gruposComoAdmin.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                        GRUPOS QUE ADMINISTRO
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {gruposComoAdmin.map((g) => (
                            <CardGrupo key={g.id} grupo={g} usuario={usuario} onAbrir={() => setVistaDetalle(g)} />
                        ))}
                    </div>
                </>
            )}

            {gruposComoParticipante.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                        GRUPOS EN LOS QUE PARTICIPO
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {gruposComoParticipante.map((g) => (
                            <CardGrupo key={g.id} grupo={g} usuario={usuario} onAbrir={() => setVistaDetalle(g)} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default TabGrupos