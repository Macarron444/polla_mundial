import { useState } from 'react'
import { actualizarConfigGrupo } from '../../../core/storage/grupos.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function ConfigApuesta({ grupo, usuario, onActualizado }) {
    const esCreador = grupo.creadoPor === usuario.id
    const [monto, setMonto] = useState(grupo.montoApuesta ?? 0)
    const [premiacion, setPremiacion] = useState(grupo.premiacion ?? 'TODO_AL_PRIMERO')
    const [msg, setMsg] = useState('')
    const [error, setError] = useState('')

    if (!esCreador) {
        const total = (grupo.montoApuesta ?? 0) * grupo.miembros.length
        return (
            <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                    💰 APUESTA DEL GRUPO
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                    {[
                        { label: 'APUESTA POR PERSONA', val: `$${(grupo.montoApuesta ?? 0).toLocaleString('es-CO')}`, color: '#ffd43b' },
                        { label: 'CAJA TOTAL', val: `$${total.toLocaleString('es-CO')}`, color: '#69db7c' },
                        { label: 'PREMIACIÓN', val: grupo.premiacion === 'TODO_AL_PRIMERO' ? '1er lugar' : 'Top 3', color: '#748ffc' },
                    ].map((s) => (
                        <div key={s.label} style={{ flex: 1, minWidth: 120, background: '#0d1628', border: `1px solid ${s.color}33`, borderRadius: 10, padding: '14px 16px' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em' }}>{s.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const handleGuardar = () => {
        setError('')
        if (monto < 0) { setError('El monto no puede ser negativo'); return }
        try {
            actualizarConfigGrupo(grupo.id, usuario.id, { montoApuesta: Number(monto), premiacion })
            setMsg('✓ Configuración guardada')
            onActualizado()
            setTimeout(() => setMsg(''), 1500)
        } catch (e) { setError(e.message) }
    }

    const total = Number(monto) * grupo.miembros.length

    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                💰 CONFIGURAR APUESTA
            </div>

            <div style={{
                background: '#0d1628', border: '1px solid #3b5bdb44',
                borderRadius: 12, padding: '18px 20px', marginBottom: 20,
            }}>
                <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>
                        MONTO POR PERSONA (COP)
                    </label>
                    <input type="number" min="0" className="login-input"
                        placeholder="Ej: 10000"
                        value={monto} onChange={(e) => setMonto(e.target.value)} />
                    {monto > 0 && (
                        <div style={{ fontSize: 11, color: '#69db7c', marginTop: 6 }}>
                            Caja total con {grupo.miembros.length} miembros: <strong>${total.toLocaleString('es-CO')}</strong>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 8 }}>
                        DISTRIBUCIÓN DEL PREMIO
                    </label>
                    {[
                        { val: 'TODO_AL_PRIMERO', label: '🥇 Todo al 1er lugar', desc: `$${total.toLocaleString('es-CO')}` },
                        { val: 'TOP_3', label: '🏆 Top 3', desc: `60% / 30% / 10%` },
                    ].map((op) => (
                        <label key={op.val} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10, background: premiacion === op.val ? '#0f1e3a' : 'transparent', border: `1px solid ${premiacion === op.val ? '#3b5bdb' : '#1e2a45'}`, borderRadius: 8, padding: '10px 14px' }}>
                            <input type="radio" name="premiacion" value={op.val} checked={premiacion === op.val} onChange={(e) => setPremiacion(e.target.value)} />
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{op.label}</div>
                                <div style={{ fontSize: 10, color: '#4a6fa5' }}>{op.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>

                {error && <div style={{ fontSize: 11, color: '#ff8787', marginBottom: 10 }}>⚠️ {error}</div>}

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={handleGuardar} style={btnStyle('#3b5bdb')}>Guardar configuración</button>
                    {msg && <span style={{ fontSize: 11, color: '#69db7c' }}>{msg}</span>}
                </div>
            </div>
        </div>
    )
}

export default ConfigApuesta