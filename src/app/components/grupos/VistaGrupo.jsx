import { useState, useEffect } from 'react'
import BadgeMiembro from './BadgeMiembro.jsx'
import TabPrediccionesGrupo from './TabPrediccionesGrupo.jsx'
import TabRankingGrupo from './TabRankingGrupo.jsx'
import TabHistorialGrupo from './TabHistorialGrupo.jsx'
import TabEstadisticasGrupo from './TabEstadisticasGrupo.jsx'
import ChatPartido from './ChatPartido.jsx'
import PrediccionGlobalGrupo from './PrediccionGlobalGrupo.jsx'
import ConfigApuesta from './ConfigApuesta.jsx'
import SolicitudesIngreso from './SolicitudesIngreso.jsx'
import InvitacionLink from './InvitacionLink.jsx'
import { btnStyle } from '../../../shared/ui/index.jsx'
import {
    agregarMiembro, cambiarRol, eliminarMiembro, eliminarGrupo, getRolEnGrupo,
} from '../../../core/storage/grupos.js'
import { obtenerTodosUsuarios } from '../../../core/storage/indexedDb.js'
import { getSolicitudesPorGrupo } from '../../../core/storage/solicitudes.js'

const TABS_MIEMBRO = ['Predicciones', 'Ranking', 'Historial', 'Estadísticas', 'Global']
const TABS_ADMIN   = ['Predicciones', 'Ranking', 'Historial', 'Estadísticas', 'Global', 'Miembros', 'Apuesta', 'Invitar']

function VistaGrupo({ grupo, usuario, partidos, equipos, onVolver, onCambio }) {
    const rolActual  = getRolEnGrupo(grupo, usuario.id) ?? null
    const esAdmin    = rolActual === 'ADMIN'
    const esCreador  = String(grupo.creadoPor) === String(usuario.id)
    const tabs       = esAdmin ? TABS_ADMIN : TABS_MIEMBRO

    const [tabActiva, setTabActiva]           = useState('Predicciones')
    const [busqueda, setBusqueda]             = useState('')
    const [error, setError]                   = useState('')
    const [confirmarDel, setConfirmarDel]     = useState(null)
    const [confirmarDelGrupo, setConfirmarDelGrupo] = useState(false)
    const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
    const [usuariosDisponibles, setUsuariosDisponibles]     = useState([])

    // Cargar solicitudes y usuarios disponibles de forma async
    useEffect(() => {
        if (!esAdmin) return
        getSolicitudesPorGrupo(grupo.id)
            .then((s) => setSolicitudesPendientes(s.length))
            .catch(() => {})
    }, [grupo.id, esAdmin, grupo.miembros])

    useEffect(() => {
        if (!esAdmin) return
        obtenerTodosUsuarios()
            .then((us) => setUsuariosDisponibles(us.filter(
                (u) => !grupo.miembros.some((m) => m.usuarioId === u.id)
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

    return (
        <div>
            {/* ── Cabecera con botón Volver ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={onVolver} style={btnStyle('#4a6fa5')}>← Volver</button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>
                        🏆 {grupo.nombre}
                        {grupo.esPublico && <span style={{ fontSize: 10, color: '#4a6fa5', marginLeft: 8 }}>🌐 público</span>}
                    </div>
                    {grupo.descripcion && <div style={{ fontSize: 11, color: '#4a6fa5', marginTop: 2 }}>{grupo.descripcion}</div>}
                </div>
                {esCreador && !confirmarDelGrupo && (
                    <button onClick={() => setConfirmarDelGrupo(true)} style={btnStyle('#c92a2a')}>🗑 Eliminar</button>
                )}
                {confirmarDelGrupo && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: '#ff8787' }}>¿Seguro?</span>
                        <button onClick={handleEliminarGrupo} style={btnStyle('#c92a2a')}>Sí</button>
                        <button onClick={() => setConfirmarDelGrupo(false)} style={btnStyle('#555')}>No</button>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ background: '#2a0d0d', border: '1px solid #c92a2a44', color: '#ff8787', fontSize: 11, padding: '8px 14px', borderRadius: 8, marginBottom: 14 }}>
                    ⚠️ {error}
                </div>
            )}

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {tabs.map((t) => (
                    <button key={t} onClick={() => setTabActiva(t)} style={{
                        ...btnStyle(tabActiva === t ? '#748ffc' : '#2a3a5a'),
                        background: tabActiva === t ? '#1a1e3a' : 'transparent',
                        flexShrink: 0, position: 'relative',
                    }}>
                        {t}
                        {t === 'Miembros' && solicitudesPendientes > 0 && (
                            <span style={{
                                position: 'absolute', top: -4, right: -4,
                                background: '#ffd43b', color: '#000',
                                fontSize: 9, fontWeight: 800, borderRadius: '50%',
                                width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {solicitudesPendientes}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Contenido de cada tab ── */}
            {tabActiva === 'Predicciones' && (
                <TabPrediccionesGrupo grupo={grupo} usuario={usuario} partidos={partidos} equipos={equipos} />
            )}
            {tabActiva === 'Ranking' && <TabRankingGrupo grupo={grupo} usuario={usuario} />}
            {tabActiva === 'Historial' && (
                <TabHistorialGrupo grupo={grupo} usuario={usuario} partidos={partidos} equipos={equipos} />
            )}
            {tabActiva === 'Estadísticas' && <TabEstadisticasGrupo grupo={grupo} usuario={usuario} />}
            {tabActiva === 'Global' && <PrediccionGlobalGrupo grupo={grupo} usuario={usuario} equipos={equipos} />}

            {tabActiva === 'Miembros' && esAdmin && (
                <div>
                    {solicitudesPendientes > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <SolicitudesIngreso grupo={grupo} onCambio={onCambio} />
                        </div>
                    )}

                    {/* Buscar y agregar miembro */}
                    <div style={{ background: '#0d1628', border: '1px solid #1e2a45', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 8 }}>AGREGAR MIEMBRO</div>
                        <input
                            className="login-input"
                            placeholder="Busca por nombre o correo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {resultadosBusqueda.map((u) => (
                            <div key={u.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: '#060c18', border: '1px solid #1e2a45',
                                borderRadius: 8, padding: '8px 12px', marginTop: 6,
                            }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{u.nombre}</div>
                                    <div style={{ fontSize: 10, color: '#4a6fa5' }}>{u.email}</div>
                                </div>
                                <button onClick={() => handleAgregar(u)} style={btnStyle('#2f9e44')}>+ Agregar</button>
                            </div>
                        ))}
                    </div>

                    {/* Lista de miembros */}
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 10 }}>
                        MIEMBROS ({grupo.miembros.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {grupo.miembros.map((m) => {
                            const esMiSelf   = m.usuarioId === usuario.id
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
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: '#1e2a45', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: 16, flexShrink: 0,
                                        }}>
                                            {esElCreador ? '👑' : m.rol === 'ADMIN' ? '🛡️' : '👤'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                                                {m.nombre} {esMiSelf && <span style={{ fontSize: 10, color: '#748ffc' }}>(tú)</span>}
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