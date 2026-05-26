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

    return (
        <div style={{ background: '#0d1628', border: '1px solid #3b5bdb44', borderRadius: 14, padding: '24px 22px', maxWidth: 480 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', marginBottom: 18 }}>
                🏆 Crear nuevo grupo de apuestas
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>NOMBRE DEL GRUPO *</label>
                <input className="login-input" placeholder="Ej: Amigos del trabajo, Familia..."
                    value={nombre} onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCrear()} autoFocus />
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>DESCRIPCIÓN (opcional)</label>
                <input className="login-input" placeholder="Apuesta de 10.000 COP por persona..."
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>MONTO POR PERSONA (COP, opcional)</label>
                <input type="number" min="0" className="login-input" placeholder="Ej: 10000"
                    value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 18, background: esPublico ? '#0f1e3a' : '#060c18', border: `1px solid ${esPublico ? '#3b5bdb' : '#1e2a45'}`, borderRadius: 10, padding: '12px 14px' }}>
                <input type="checkbox" checked={esPublico} onChange={(e) => setEsPublico(e.target.checked)} />
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>🌐 Grupo público</div>
                    <div style={{ fontSize: 10, color: '#4a6fa5' }}>Cualquiera puede encontrarlo y solicitar ingreso</div>
                </div>
            </label>

            <div style={{ fontSize: 10, color: '#2a3a5a', marginBottom: 18 }}>
                💡 Quedarás como <strong style={{ color: '#748ffc' }}>Administrador</strong>. El grupo genera un código de invitación automáticamente.
            </div>

            {error && <div style={{ background: '#2a0d0d', border: '1px solid #c92a2a44', color: '#ff8787', fontSize: 11, padding: '8px 12px', borderRadius: 6, marginBottom: 14 }}>⚠️ {error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCrear} disabled={cargando} style={btnStyle(cargando ? '#2a3a5a' : '#3b5bdb')}>
                    {cargando ? '⏳ Creando...' : '✓ Crear grupo'}
                </button>
                <button onClick={onCancelar} disabled={cargando} style={btnStyle('#555')}>Cancelar</button>
            </div>
        </div>
    )
}

export default FormCrearGrupo