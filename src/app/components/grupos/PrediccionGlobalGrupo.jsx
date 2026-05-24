import { useState } from 'react'
import { guardarPrediccionGlobalGrupo as guardarPrediccionGlobal, getPrediccionGlobal } from '../../../core/storage/grupos.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function PrediccionGlobalGrupo({ grupo, usuario, equipos }) {
    const pred = getPrediccionGlobal(grupo.id, usuario.id)
    const [campeon, setCampeon] = useState(pred?.campeon ?? '')
    const [goleador, setGoleador] = useState(pred?.goleador ?? '')
    const [msg, setMsg] = useState('')

    const handleGuardar = () => {
        if (!campeon.trim() || !goleador.trim()) { setMsg('Completa ambos campos'); return }
        guardarPrediccionGlobal(grupo.id, usuario.id, campeon.trim(), goleador.trim())
        setMsg('✓ Guardado')
        setTimeout(() => setMsg(''), 1500)
    }

    const prediccionesGlobales = Object.entries(grupo.prediccionesGlobales ?? {}).map(([uid, p]) => {
        const miembro = grupo.miembros.find((m) => m.usuarioId === Number(uid))
        return { ...p, nombre: miembro?.nombre ?? 'Usuario' }
    })

    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                🌍 PREDICCIÓN GLOBAL DEL TORNEO
            </div>

            <div style={{
                background: '#0d1628', border: '1px solid #3b5bdb44',
                borderRadius: 12, padding: '18px 20px', marginBottom: 20,
            }}>
                <div style={{ fontSize: 12, color: '#4a6fa5', marginBottom: 16 }}>
                    Tu predicción para todo el torneo. Estas no cambian puntos automáticamente — el admin del grupo decide si otorga puntos al final.
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>
                        🏆 CAMPEÓN DEL MUNDIAL
                    </label>
                    <select value={campeon} onChange={(e) => setCampeon(e.target.value)}
                        style={{ width: '100%', background: '#060c18', border: '1px solid #1e2a45', color: '#e2e8f0', fontSize: 13, padding: '8px 10px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer' }}>
                        <option value="">Selecciona un equipo...</option>
                        {equipos.map((e) => (
                            <option key={e.id} value={e.nombre}>{e.flag} {e.nombre}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>
                        👟 GOLEADOR DEL TORNEO
                    </label>
                    <input className="login-input" placeholder="Nombre del jugador..."
                        value={goleador} onChange={(e) => setGoleador(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>Guardar predicción global</button>
                    {msg && <span style={{ fontSize: 11, color: '#69db7c' }}>{msg}</span>}
                </div>
            </div>

            {prediccionesGlobales.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                        PREDICCIONES DEL GRUPO
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {prediccionesGlobales.map((p, i) => (
                            <div key={i} style={{ background: '#0d1628', border: '1px solid #1e2a45', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{p.nombre}</div>
                                    <div style={{ fontSize: 11, color: '#4a6fa5' }}>
                                        🏆 <strong style={{ color: '#748ffc' }}>{p.campeon}</strong>
                                        &nbsp;·&nbsp; 👟 <strong style={{ color: '#748ffc' }}>{p.goleador}</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default PrediccionGlobalGrupo
