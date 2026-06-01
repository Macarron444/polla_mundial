import { useState, useEffect } from 'react'
import BadgeMiembro from './BadgeMiembro.jsx'
import TabPrediccionesGrupo from './TabPrediccionesGrupo.jsx'
import TabRankingGrupo from './TabRankingGrupo.jsx'
import TabHistorialGrupo from './TabHistorialGrupo.jsx'
import TabEstadisticasGrupo from './TabEstadisticasGrupo.jsx'
import PrediccionGlobalGrupo from './PrediccionGlobalGrupo.jsx'
import ConfigApuesta from './ConfigApuesta.jsx'
import SolicitudesIngreso from './SolicitudesIngreso.jsx'
import InvitacionLink from './InvitacionLink.jsx'
import ChatPartido from './ChatPartido.jsx'
import { btnStyle } from '../../../shared/ui/index.jsx'
import {
    agregarMiembro, cambiarRol, eliminarMiembro, eliminarGrupo, getRolEnGrupo,
} from '../../../core/storage/grupos.js'
import { obtenerTodosUsuarios } from '../../../core/storage/usuarios.js'
import { getSolicitudesPorGrupo } from '../../../core/storage/solicitudes.js'
import { esSuperAdminPorEmail } from '../../../core/constants/superadmin.js'

const TABS_MIEMBRO = ['Predicciones', 'Ranking', 'Historial', 'Estadísticas', 'Global', 'Chat']
const TABS_ADMIN   = ['Predicciones', 'Ranking', 'Historial', 'Estadísticas', 'Global', 'Chat', 'Miembros', 'Apuesta', 'Invitar']

function VistaGrupo({ grupo, usuario, partidos, equipos, onVolver, onCambio }) {
    const rolActual  = getRolEnGrupo(grupo, usuario.id) ?? null
    const esCreador  = String(grupo.creadoPor) === String(usuario.id)
    const esAdmin    = rolActual === 'ADMIN' || esCreador
    const requiereSeleccionPartidos = esAdmin
        && Array.isArray(grupo.partidosSeleccionados)
        && grupo.partidosSeleccionados.length === 0
    const tabs = esAdmin ? TABS_ADMIN : TABS_MIEMBRO

    const [tabActiva, setTabActiva]                         = useState(requiereSeleccionPartidos ? 'Apuesta' : 'Predicciones')
    const [busqueda, setBusqueda]                           = useState('')
    const [error, setError]                                 = useState('')
    const [confirmarDel, setConfirmarDel]                   = useState(null)
    const [confirmarDelGrupo, setConfirmarDelGrupo]         = useState(false)
    const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
    const [usuariosDisponibles, setUsuariosDisponibles]     = useState([])

    useEffect(() => {
        if (!esAdmin) return
        getSolicitudesPorGrupo(grupo.id)
            .then((s) => setSolicitudesPendientes(s.length))
            .catch(() => {})
    }, [grupo.id, esAdmin, grupo.miembros])

    useEffect(() => {
        if (!esAdmin) return
        // obtenerTodosUsuarios ya filtra el superadmin internamente
        obtenerTodosUsuarios()
            .then((us) => setUsuariosDisponibles(us.filter(
                (u) => !grupo.miembros.some((m) => String(m.usuarioId) === String(u.id))
            )))
            .catch(() => {})
    }, [grupo.miembros, esAdmin])

    const resultadosBusqueda = busqueda.trim().length > 1
        ? usuariosDisponibles.filter((u) =>
            u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.email.toLowerCase().includes(busqueda.toLowerCase()))
        : []

    const handleAgregar = async (u) => {
        setError('')
        try { await agregarMiembro(grupo.id, u); await onCambio(); setBusqueda('') }
        catch (e) { setError(e.message) }
    }

    const handleCambiarRol = async (uid, rol) => {
        setError('')
        try { await cambiarRol(grupo.id, uid, rol); await onCambio() }
        catch (e) { setError(e.message) }
    }

    const handleEliminarMiembro = async (uid) => {
        setError('')
        try { await eliminarMiembro(grupo.id, uid); setConfirmarDel(null); await onCambio() }
        catch (e) { setError(e.message) }
    }

    const handleEliminarGrupo = async () => {
        try { await eliminarGrupo(grupo.id, usuario.id); onVolver() }
        catch (e) { setError(e.message) }
    }

    // Miembros visibles: excluir superadmin de la lista que ven los usuarios
    const miembrosVisibles = grupo.miembros.filter((m) => !esSuperAdminPorEmail(m.email))

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={() => onVolver()} style={btnStyle('#4a6fa5')}>← Volver</button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        🏆 {grupo.nombre}
                        {grupo.esPublico && <span style={{ fontSize: 10, color: '#64748b', marginLeft: 8 }}>🌐 público</span>}
                    </div>
                    {grupo.descripcion && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{grupo.descripcion}</div>}
                </div>
                {esCreador && !confirmarDelGrupo && (
                    <button onClick={() => setConfirmarDelGrupo(true)} style={btnStyle('#c92a2a')}>🗑 Eliminar</button>
                )}
                {confirmarDelGrupo && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: '#dc2626' }}>¿Seguro?</span>
                        <button onClick={handleEliminarGrupo} style={btnStyle('#c92a2a')}>Sí</button>
                        <button onClick={() => setConfirmarDelGrupo(false)} style={btnStyle('#555')}>No</button>
                    </div>
                )}
            </div>

            {error && <div className="g-alert g-alert--error" style={{ marginBottom: 14 }}>⚠️ {error}</div>}

            <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {tabs.map((t) => (
                    <button key={t} onClick={() => setTabActiva(t)} style={{
                        ...btnStyle(tabActiva === t ? '#3b5bdb' : '#64748b'),
                        background: tabActiva === t ? '#3b5bdb' : '#f1f5f9',
                        color: tabActiva === t ? '#ffffff' : '#475569',
                        flexShrink: 0, position: 'relative',
                        border: `1px solid ${tabActiva === t ? '#3b5bdb' : '#e2e8f0'}`,
                    }}>
                        {t}
                        {t === 'Miembros' && solicitudesPendientes > 0 && (
                            <span style={{
                                position: 'absolute', top: -4, right: -4,
                                background: '#d97706', color: '#fff',
                                fontSize: 9, fontWeight: 800, borderRadius: '50%',
                                width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {solicitudesPendientes}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {tabActiva === 'Predicciones' && (
                <TabPrediccionesGrupo grupo={grupo} usuario={usuario} partidos={partidos} equipos={equipos} />
            )}
            {tabActiva === 'Ranking'      && <TabRankingGrupo      grupo={grupo} usuario={usuario} />}
            {tabActiva === 'Historial'    && <TabHistorialGrupo    grupo={grupo} usuario={usuario} partidos={partidos} equipos={equipos} />}
            {tabActiva === 'Estadísticas' && <TabEstadisticasGrupo grupo={grupo} usuario={usuario} />}
            {tabActiva === 'Global'       && <PrediccionGlobalGrupo grupo={grupo} usuario={usuario} equipos={equipos} />}
            {tabActiva === 'Chat'         && (
                <ChatPartido
                    grupoId={grupo.id}
                    partidoId={`grupo_${grupo.id}`}
                    usuario={usuario}
                />
            )}

            {tabActiva === 'Miembros' && esAdmin && (
                <div>
                    {solicitudesPendientes > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <SolicitudesIngreso grupo={grupo} onCambio={onCambio} />
                        </div>
                    )}

                    <div className="g-card" style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#3b5bdb', letterSpacing: '0.07em', marginBottom: 8 }}>AGREGAR MIEMBRO</div>
                        <input
                            className="login-input"
                            placeholder="Busca por nombre o correo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {resultadosBusqueda.map((u) => (
                            <div key={u.id} className="g-card g-card--sm g-card--muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                                <div>
                                    <div className="g-member-name" style={{ fontSize: 12 }}>{u.nombre}</div>
                                    <div className="g-member-email">{u.email}</div>
                                </div>
                                <button onClick={() => handleAgregar(u)} style={btnStyle('#2f9e44')}>+ Agregar</button>
                            </div>
                        ))}
                    </div>

                    {/* Conteo visible excluye al superadmin */}
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#3b5bdb', letterSpacing: '0.07em', marginBottom: 10 }}>
                        MIEMBROS ({miembrosVisibles.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {miembrosVisibles.map((m) => {
                            const esMiSelf    = String(m.usuarioId) === String(usuario.id)
                            const esElCreador = String(m.usuarioId) === String(grupo.creadoPor)
                            return (
                                <div key={m.usuarioId} className={`g-member-row${esMiSelf ? ' g-member-row--me' : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                        <div className="g-member-avatar">
                                            {esElCreador ? '👑' : m.rol === 'ADMIN' ? '🛡️' : '👤'}
                                        </div>
                                        <div>
                                            <div className="g-member-name">
                                                {m.nombre} {esMiSelf && <span style={{ fontSize: 10, color: '#3b5bdb' }}>(tú)</span>}
                                            </div>
                                            <div className="g-member-email">{m.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <BadgeMiembro rol={m.rol} />
                                        {esAdmin && !esMiSelf && (
                                            <select
                                                value={m.rol}
                                                onChange={(e) => handleCambiarRol(m.usuarioId, e.target.value)}
                                                className="g-select" style={{ fontSize: 10, fontWeight: 700 }}
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
                                                <button onClick={() => setConfirmarDel(m.usuarioId)} style={btnStyle('#c92a2a')}>✕</button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {tabActiva === 'Apuesta' && esAdmin && (
                <ConfigApuesta grupo={grupo} usuario={usuario} partidos={partidos} equipos={equipos} onActualizado={onCambio} />
            )}
            {tabActiva === 'Invitar' && esAdmin && <InvitacionLink grupo={grupo} />}
        </div>
    )
}

export default VistaGrupo