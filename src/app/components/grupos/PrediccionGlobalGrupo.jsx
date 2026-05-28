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
            <div style={{ fontSize: 9, fontWeight: 700, color: '#3b5bdb', letterSpacing: '0.07em', marginBottom: 14 }}>
                🌍 PREDICCIÓN GLOBAL DEL TORNEO
            </div>

            <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: 12, padding: '18px 20px', marginBottom: 20,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                    Tu predicción para todo el torneo. Estas no cambian puntos automáticamente — el admin del grupo decide si otorga puntos al final.
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', marginBottom: 6 }}>
                        🏆 CAMPEÓN DEL MUNDIAL
                    </label>
                    <select value={campeon} onChange={(e) => setCampeon(e.target.value)}
                        style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: 13, padding: '8px 10px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer' }}>
                        <option value="">Selecciona un equipo...</option>
                        {equipos.map((e) => (
                            <option key={e.id} value={e.nombre}>{e.flag} {e.nombre}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', marginBottom: 6 }}>
                        👟 GOLEADOR DEL TORNEO
                    </label>
                    <input className="login-input" placeholder="Nombre del jugador..."
                        value={goleador} onChange={(e) => setGoleador(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>Guardar predicción global</button>
                    {msg && <span style={{ fontSize: 11, color: '#16a34a' }}>{msg}</span>}
                </div>
            </div>

            {prediccionesGlobales.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#3b5bdb', letterSpacing: '0.07em', marginBottom: 10 }}>
                        PREDICCIONES DEL GRUPO
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {prediccionesGlobales.map((p, i) => (
                            <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{p.nombre}</div>
                                    <div style={{ fontSize: 11, color: '#475569' }}>
                                        🏆 <strong style={{ color: '#3b5bdb' }}>{p.campeon}</strong>
                                        &nbsp;·&nbsp; 👟 <strong style={{ color: '#3b5bdb' }}>{p.goleador}</strong>
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