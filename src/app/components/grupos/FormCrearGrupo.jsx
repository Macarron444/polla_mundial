import { useState } from 'react'
import { crearGrupo } from '../../../core/storage/grupos.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function FormCrearGrupo({ usuario, onCreado, onCancelar }) {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [esPublico, setEsPublico] = useState(false)
    const [monto, setMonto] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    const handleCrear = async () => {
        setError('')
        if (!nombre.trim()) { setError('El nombre del grupo es obligatorio'); return }
        if (nombre.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres'); return }
        setCargando(true)
        try {
            const grupo = await crearGrupo(nombre, descripcion, usuario, {
                esPublico,
                montoApuesta: monto ? Number(monto) : 0,
            })
            onCreado(grupo)
        } catch (e) {
            setError(e.message)
            setCargando(false)
        }
    }

    const labelStyle = { display: 'block', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', marginBottom: 6 }

    return (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '24px 22px', maxWidth: 480, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 18 }}>
                🏆 Crear nuevo grupo de apuestas
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>NOMBRE DEL GRUPO *</label>
                <input className="login-input" placeholder="Ej: Amigos del trabajo, Familia..."
                    value={nombre} onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCrear()} autoFocus />
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>DESCRIPCIÓN (opcional)</label>
                <input className="login-input" placeholder="Apuesta de 10.000 COP por persona..."
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>MONTO POR PERSONA (COP, opcional)</label>
                <input type="number" min="0" className="login-input" placeholder="Ej: 10000"
                    value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>

            <label style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 18,
                background: esPublico ? '#eef2ff' : '#f8fafc',
                border: `1px solid ${esPublico ? '#818cf8' : '#e2e8f0'}`,
                borderRadius: 10, padding: '12px 14px',
            }}>
                <input type="checkbox" checked={esPublico} onChange={(e) => setEsPublico(e.target.checked)} />
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>🌐 Grupo público</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Cualquiera puede encontrarlo y solicitar ingreso</div>
                </div>
            </label>

            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 18 }}>
                💡 Quedarás como <strong style={{ color: '#3b5bdb' }}>Administrador</strong>. El grupo genera un código de invitación automáticamente.
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 11, padding: '8px 12px', borderRadius: 6, marginBottom: 14 }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCrear} disabled={cargando} style={btnStyle(cargando ? '#94a3b8' : '#3b5bdb')}>
                    {cargando ? '⏳ Creando...' : '✓ Crear grupo'}
                </button>
                <button onClick={onCancelar} disabled={cargando} style={btnStyle('#555')}>Cancelar</button>
            </div>
        </div>
    )
}

export default FormCrearGrupo