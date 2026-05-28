import { useState } from 'react'
import { BadgeEstado, ESTADOS_COLOR, StatCard, btnStyle } from '../../shared/ui/index.jsx'
import { getEquipo } from '../../core/utils/teams.js'

function TabGestionarPartidos({ partidos, setPartidos, equipos }) {
    const [showForm, setShowForm]         = useState(false)
    const [newLocal, setNewLocal]         = useState('')
    const [newVisitante, setNewVisitante] = useState('')
    const [newFecha, setNewFecha]         = useState('')
    const [newFase, setNewFase]           = useState('GRUPOS')
    const [deleteId, setDeleteId]         = useState(null)

    const faseLabel = {
        GRUPOS:    'Fase de Grupos',
        OCTAVOS:   'Octavos',
        CUARTOS:   'Cuartos',
        SEMIFINAL: 'Semifinal',
        FINAL:     'Final',
    }

    const agregarPartido = () => {
        if (!newLocal || !newVisitante || !newFecha) { alert('Completa todos los campos'); return }
        if (parseInt(newLocal, 10) === parseInt(newVisitante, 10)) { alert('Los equipos deben ser diferentes'); return }
        const nuevoPartido = {
            id: Math.max(...partidos.map((p) => p.id), 0) + 1,
            local: parseInt(newLocal, 10),
            visitante: parseInt(newVisitante, 10),
            golesL: null, golesV: null,
            fecha: newFecha, estado: 'PROGRAMADO', fase: newFase,
        }
        setPartidos([...partidos, nuevoPartido])
        setNewLocal(''); setNewVisitante(''); setNewFecha(''); setNewFase('GRUPOS'); setShowForm(false)
    }

    const eliminarPartido = (id) => {
        setPartidos(partidos.filter((p) => p.id !== id))
        setDeleteId(null)
    }

    return (
        <div className="tab-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="stat-cards" style={{ marginBottom: 0 }}>
                    <StatCard label="TOTAL"       value={partidos.length}                                          accent="#3b5bdb" />
                    <StatCard label="PROGRAMADOS" value={partidos.filter((p) => p.estado === 'PROGRAMADO').length} accent="#0891b2" />
                    <StatCard label="EN JUEGO"    value={partidos.filter((p) => p.estado === 'EN_CURSO').length}   accent="#16a34a" />
                    <StatCard label="JUGADOS"     value={partidos.filter((p) => p.estado === 'FINALIZADO').length} accent="#64748b" />
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: showForm ? '#dc2626' : '#16a34a',
                        border: 'none', color: '#fff',
                        fontSize: 12, fontWeight: 700, padding: '8px 16px',
                        borderRadius: 8, cursor: 'pointer',
                        letterSpacing: '0.05em', fontFamily: 'inherit', marginLeft: 12,
                    }}
                >
                    {showForm ? '✕ Cancelar' : '✚ Nuevo Partido'}
                </button>
            </div>

            {showForm && (
                <div className="form-card" style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px', marginBottom: 20, boxShadow: '0 2px 8px rgba(22,163,74,0.08)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', letterSpacing: '0.05em', marginBottom: 16 }}>
                        ➕ CREAR NUEVO PARTIDO
                    </div>
                    <div className="form-grid">
                        <div>
                            <label className="form-label" style={{ color: '#64748b' }}>Equipo Local</label>
                            <select value={newLocal} onChange={(e) => setNewLocal(e.target.value)} className="form-control">
                                <option value="">Seleccionar equipo</option>
                                {equipos.map((e) => <option key={e.id} value={e.id}>{e.flag} {e.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ color: '#64748b' }}>Equipo Visitante</label>
                            <select value={newVisitante} onChange={(e) => setNewVisitante(e.target.value)} className="form-control">
                                <option value="">Seleccionar equipo</option>
                                {equipos.map((e) => <option key={e.id} value={e.id}>{e.flag} {e.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ color: '#64748b' }}>Fecha y Hora</label>
                            <input value={newFecha} onChange={(e) => setNewFecha(e.target.value)} type="datetime-local" className="form-control" />
                        </div>
                        <div>
                            <label className="form-label" style={{ color: '#64748b' }}>Fase del Torneo</label>
                            <select value={newFase} onChange={(e) => setNewFase(e.target.value)} className="form-control">
                                <option value="GRUPOS">Fase de Grupos</option>
                                <option value="OCTAVOS">Octavos de Final</option>
                                <option value="CUARTOS">Cuartos de Final</option>
                                <option value="SEMIFINAL">Semifinal</option>
                                <option value="FINAL">Final</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={agregarPartido} className="btn-primary">✓ Agregar Partido</button>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {partidos.length === 0 ? (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '24px', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                        No hay partidos aún. ➕ Agrega uno para comenzar.
                    </div>
                ) : (
                    partidos.map((p) => {
                        const loc = getEquipo(equipos, p.local)
                        const vis = getEquipo(equipos, p.visitante)
                        const c   = ESTADOS_COLOR[p.estado]
                        return (
                            <div key={p.id} className="partido-card" style={{
                                background: deleteId === p.id ? '#fef2f2' : '#ffffff',
                                border: `1px solid ${deleteId === p.id ? '#fecaca' : c.border + '55'}`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}>
                                <div className="partido-card__row">
                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: 4 }}>
                                        #{p.id}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, width: 100, flexShrink: 0 }}>
                                        {faseLabel[p.fase]}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 100 }}>
                                        <span style={{ fontSize: 18 }}>{loc.flag}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{loc.nombre}</span>
                                    </div>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: p.estado === 'FINALIZADO' ? '#0f172a' : '#94a3b8', letterSpacing: 3, minWidth: 50, textAlign: 'center' }}>
                                        {p.golesL !== null ? `${p.golesL}–${p.golesV}` : '·–·'}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 100, justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{vis.nombre}</span>
                                        <span style={{ fontSize: 18 }}>{vis.flag}</span>
                                    </div>
                                    <BadgeEstado estado={p.estado} />
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {deleteId === p.id ? (
                                            <>
                                                <button onClick={() => eliminarPartido(p.id)} style={btnStyle('#c92a2a')}>✓ Confirmar</button>
                                                <button onClick={() => setDeleteId(null)} style={btnStyle('#555')}>✕ Cancelar</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setDeleteId(p.id)} style={btnStyle('#c92a2a')}>🗑️ Eliminar</button>
                                        )}
                                    </div>
                                </div>
                                <div className="partido-card__fecha" style={{ color: '#94a3b8' }}>📅 {new Date(p.fecha).toLocaleString('es-ES')}</div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default TabGestionarPartidos