import { useState } from 'react'
import BadgeMiembro from './BadgeMiembro.jsx'
import { btnStyle } from '../../../shared/ui/index.jsx'
import {
    agregarMiembro,
    cambiarRol,
    eliminarMiembro,
    eliminarGrupo,
    getRolEnGrupo,
} from '../../../core/storage/grupos.js'
import { getUsuarios } from '../../../core/storage/usuarios.js'

function VistaGrupo({ grupo, usuario, onVolver, onCambio }) {
    const [busqueda, setBusqueda] = useState('')
    const [error, setError] = useState('')
    const [confirmarDel, setConfirmarDel] = useState(null)
    const [confirmarDelGrupo, setConfirmarDelGrupo] = useState(false)

    const rolActual = getRolEnGrupo(grupo, usuario.id)
    const esAdmin = rolActual === 'ADMIN'
    const esCreador = grupo.creadoPor === usuario.id

    const usuariosDisponibles = getUsuarios().filter(
        (u) => !grupo.miembros.some((m) => m.usuarioId === u.id)
    )

    const resultadosBusqueda = busqueda.trim().length > 1
        ? usuariosDisponibles.filter(
            (u) =>
                u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                u.email.toLowerCase().includes(busqueda.toLowerCase())
        )
        : []

    const handleAgregar = (u) => {
        setError('')
        try { agregarMiembro(grupo.id, u); onCambio(); setBusqueda('') }
        catch (e) { setError(e.message) }
    }

    const handleCambiarRol = (usuarioId, nuevoRol) => {
        setError('')
        try { cambiarRol(grupo.id, usuarioId, nuevoRol); onCambio() }
        catch (e) { setError(e.message) }
    }

    const handleEliminarMiembro = (usuarioId) => {
        setError('')
        try { eliminarMiembro(grupo.id, usuarioId); setConfirmarDel(null); onCambio() }
        catch (e) { setError(e.message) }
    }

    const handleEliminarGrupo = () => {
        try { eliminarGrupo(grupo.id, usuario.id); onVolver() }
        catch (e) { setError(e.message) }
    }

    return (
        <div>
            {/* Encabezado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={onVolver} style={btnStyle('#4a6fa5')}>← Volver</button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>🏆 {grupo.nombre}</div>
                    {grupo.descripcion && (
                        <div style={{ fontSize: 11, color: '#4a6fa5', marginTop: 2 }}>{grupo.descripcion}</div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#4a6fa5' }}>
                        Tu rol: <strong style={{ color: esAdmin ? '#748ffc' : '#4a6fa5' }}>
                            {esAdmin ? '🛡️ ADMIN' : '👤 PARTICIPANTE'}
                        </strong>
                    </span>
                    {esCreador && !confirmarDelGrupo && (
                        <button onClick={() => setConfirmarDelGrupo(true)} style={btnStyle('#c92a2a')}>
                            🗑 Eliminar grupo
                        </button>
                    )}
                    {confirmarDelGrupo && (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 10, color: '#ff8787' }}>¿Seguro?</span>
                            <button onClick={handleEliminarGrupo} style={btnStyle('#c92a2a')}>Sí, eliminar</button>
                            <button onClick={() => setConfirmarDelGrupo(false)} style={btnStyle('#555')}>Cancelar</button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div style={{
                    background: '#2a0d0d', border: '1px solid #c92a2a44',
                    color: '#ff8787', fontSize: 11, padding: '8px 14px',
                    borderRadius: 8, marginBottom: 14,
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Buscar y agregar — solo ADMIN */}
            {esAdmin && (
                <div style={{
                    background: '#0d1628', border: '1px solid #1e2a45',
                    borderRadius: 12, padding: '16px 18px', marginBottom: 20,
                }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 8 }}>
                        AGREGAR MIEMBRO AL GRUPO
                    </div>
                    <input
                        className="login-input"
                        placeholder="Busca por nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />

                    {resultadosBusqueda.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {resultadosBusqueda.map((u) => (
                                <div key={u.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: '#060c18', border: '1px solid #1e2a45',
                                    borderRadius: 8, padding: '8px 12px',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{u.nombre}</div>
                                        <div style={{ fontSize: 10, color: '#4a6fa5' }}>{u.email}</div>
                                    </div>
                                    <button onClick={() => handleAgregar(u)} style={btnStyle('#2f9e44')}>
                                        + Agregar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {busqueda.trim().length > 1 && resultadosBusqueda.length === 0 && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#4a6fa5' }}>
                            No se encontraron usuarios disponibles.
                        </div>
                    )}

                    {usuariosDisponibles.length === 0 && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#2a3a5a' }}>
                            Todos los usuarios registrados ya son miembros.
                        </div>
                    )}
                </div>
            )}

            {/* Lista de miembros */}
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                MIEMBROS ({grupo.miembros.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {grupo.miembros.map((m) => {
                    const esMiSelf = m.usuarioId === usuario.id
                    const esElCreador = m.usuarioId === grupo.creadoPor
                    return (
                        <div key={m.usuarioId} style={{
                            background: '#0d1628',
                            border: `1px solid ${esMiSelf ? '#3b5bdb55' : '#1e2a45'}`,
                            borderRadius: 10, padding: '12px 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', fontSize: 16, flexShrink: 0,
                                    background: '#1e2a45', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {esElCreador ? '👑' : m.rol === 'ADMIN' ? '🛡️' : '👤'}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                                        {m.nombre}{' '}
                                        {esMiSelf && <span style={{ fontSize: 10, color: '#748ffc' }}>(tú)</span>}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#4a6fa5' }}>{m.email}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BadgeMiembro rol={m.rol} />

                                {esAdmin && !esMiSelf && (
                                    <select
                                        value={m.rol}
                                        onChange={(e) => handleCambiarRol(m.usuarioId, e.target.value)}
                                        style={{
                                            background: '#060c18', border: '1px solid #1e2a45',
                                            color: '#748ffc', fontSize: 10, fontWeight: 700,
                                            padding: '4px 8px', borderRadius: 6,
                                            fontFamily: 'inherit', cursor: 'pointer',
                                        }}
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="PARTICIPANTE">PARTICIPANTE</option>
                                    </select>
                                )}

                                {esAdmin && !esMiSelf && (
                                    confirmarDel === m.usuarioId ? (
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => handleEliminarMiembro(m.usuarioId)} style={btnStyle('#c92a2a')}>Sí</button>
                                            <button onClick={() => setConfirmarDel(null)} style={btnStyle('#555')}>No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmarDel(m.usuarioId)} style={btnStyle('#c92a2a')} title="Expulsar miembro">
                                            ✕
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default VistaGrupo