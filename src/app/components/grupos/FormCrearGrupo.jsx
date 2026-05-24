import { useState } from 'react'
import { crearGrupo } from '../../../core/storage/grupos.js'
import { btnStyle } from '../../../shared/ui/index.jsx'

function FormCrearGrupo({ usuario, onCreado, onCancelar }) {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [error, setError] = useState('')

    const handleCrear = () => {
        setError('')
        if (!nombre.trim()) { setError('El nombre del grupo es obligatorio'); return }
        if (nombre.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres'); return }
        try {
            const grupo = crearGrupo(nombre, descripcion, usuario)
            onCreado(grupo)
        } catch (e) {
            setError(e.message)
        }
    }

    return (
        <div style={{
            background: '#0d1628', border: '1px solid #3b5bdb44',
            borderRadius: 14, padding: '24px 22px', maxWidth: 480,
        }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', marginBottom: 18 }}>
                🏆 Crear nuevo grupo de apuestas
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>
                    NOMBRE DEL GRUPO *
                </label>
                <input
                    className="login-input"
                    placeholder="Ej: Amigos del trabajo, Familia..."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCrear()}
                    autoFocus
                />
            </div>

            <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 6 }}>
                    DESCRIPCIÓN (opcional)
                </label>
                <input
                    className="login-input"
                    placeholder="Polla privada del trabajo, apuesta de 5.000 COP..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
            </div>

            <div style={{ fontSize: 10, color: '#2a3a5a', marginBottom: 18 }}>
                💡 Quedarás como <strong style={{ color: '#748ffc' }}>Administrador</strong> del grupo.
                Podrás agregar otros usuarios una vez creado.
            </div>

            {error && (
                <div style={{
                    background: '#2a0d0d', border: '1px solid #c92a2a44',
                    color: '#ff8787', fontSize: 11, padding: '8px 12px',
                    borderRadius: 6, marginBottom: 14,
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCrear} style={btnStyle('#3b5bdb')}>✓ Crear grupo</button>
                <button onClick={onCancelar} style={btnStyle('#555')}>Cancelar</button>
            </div>
        </div>
    )
}

export default FormCrearGrupo