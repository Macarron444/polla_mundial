import { useState } from 'react'
import { BadgeEstado, ESTADOS_COLOR, StatCard, btnStyle } from '../../shared/ui/index.jsx'
import { getEquipo } from '../../core/utils/teams.js'

function TabPartidos({ partidos, setPartidos, equipos }) {
    const [editId, setEditId] = useState(null)
    const [gl, setGl] = useState('')
    const [gv, setGv] = useState('')
    const [openGroup, setOpenGroup] = useState('Grupo A')
    const [openSub, setOpenSub] = useState({})

    const faseLabel = {
        GRUPOS: 'Fase de Grupos',
        DIECISEISAVOS: 'Dieciseisavos de Final',
        OCTAVOS: 'Octavos de Final',
        CUARTOS: 'Cuartos',
        SEMIFINAL: 'Semifinal',
        FINAL: 'Final',
        TERCER_PUESTO: 'Tercer Puesto',
        ELIMINATORIAS: 'Eliminatorias',
    }

    const avanzarEstado = (p) => {
        const ciclo = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO']
        const idx = ciclo.indexOf(p.estado)
        if (idx < 0 || idx >= ciclo.length - 1) return
        setPartidos((prev) =>
            prev.map((x) => (x.id === p.id ? { ...x, estado: ciclo[idx + 1] } : x))
        )
    }

    const saveResult = (p) => {
        const l = parseInt(gl, 10)
        const v = parseInt(gv, 10)
        if (Number.isNaN(l) || Number.isNaN(v) || l < 0 || v < 0) {
            alert('Ingresa un resultado válido (números ≥ 0)')
            return
        }
        setPartidos((prev) =>
            prev.map((x) => (x.id === p.id ? { ...x, golesL: l, golesV: v } : x))
        )
        setEditId(null); setGl(''); setGv('')
    }

    const getGrupoPartido = (p) => {
        const loc = getEquipo(equipos, p.local)
        const vis = getEquipo(equipos, p.visitante)
        return p.grupo || loc?.grupo || vis?.grupo || null
    }

    const partidosValidos = (partidos || []).filter(Boolean)

    const partidosPorGrupo = partidosValidos.reduce((acc, p) => {
        const grupo = getGrupoPartido(p)
        const isGrupo = p.fase === 'GRUPOS' && grupo
        const key = isGrupo ? `Grupo ${grupo}` : 'Eliminatorias'
        if (!acc[key]) acc[key] = []
        acc[key].push(p)
        return acc
    }, {})

    Object.keys(partidosPorGrupo).forEach((key) => {
        partidosPorGrupo[key].sort((a, b) => {
            const aTime = a.fechaISO ? new Date(a.fechaISO).getTime() : 0
            const bTime = b.fechaISO ? new Date(b.fechaISO).getTime() : 0
            return aTime - bTime
        })
    })

    const ordenGrupos = Object.keys(partidosPorGrupo).sort((a, b) => {
        if (a === 'Eliminatorias') return 1
        if (b === 'Eliminatorias') return -1
        return a.localeCompare(b, 'es', { numeric: true })
    })

    const faseOrdenElim = ['DIECISEISAVOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'TERCER_PUESTO', 'FINAL']

    const isGroupOpen = (key) => openGroup === key
    const toggleGroup = (key) => {
        setOpenGroup((prev) => (prev === key ? null : key))
    }

    const isSubOpen = (key) => openSub[key] !== false
    const toggleSub = (key) => {
        setOpenSub((prev) => ({ ...prev, [key]: !isSubOpen(key) }))
    }

    const renderPartidoCard = (p) => {
        const loc = p.local ? getEquipo(equipos, p.local) : { nombre: p.localNombre || 'Por definir', flag: '' }
        const vis = p.visitante ? getEquipo(equipos, p.visitante) : { nombre: p.visitanteNombre || 'Por definir', flag: '' }
        const grupo = getGrupoPartido(p)
        const faseTexto = p.fase === 'GRUPOS' && !grupo
            ? 'Eliminatorias'
            : (faseLabel[p.fase] || p.fase)
        const isEdit = editId === p.id
        const c = ESTADOS_COLOR[p.estado]
        return (
            <div key={p.id} className="partido-card" style={{ '--estado-border': c.border }}>
                <div className="partido-card__row">
                    <div className="partido-card__meta">
                        <span className="partido-card__fase">{faseTexto}</span>

                        <div className="partido-card__teams">
                            <div className="partido-card__team-line">
                                <span className="partido-card__score-chip">
                                    {isEdit ? (
                                        <input value={gl} onChange={(e) => setGl(e.target.value)} type="number" min="0" max="20" className="score-input" />
                                    ) : (
                                        <span className="score-display" style={{ color: p.estado === 'FINALIZADO' ? '#0f172a' : '#94a3b8' }}>
                                            {p.golesL !== null ? p.golesL : '·'}
                                        </span>
                                    )}
                                </span>
                                <span className="partido-card__flag">{loc.flag}</span>
                                <span className="partido-card__team-name">{loc.nombre}</span>
                            </div>

                            <div className="partido-card__team-line">
                                <span className="partido-card__score-chip">
                                    {isEdit ? (
                                        <input value={gv} onChange={(e) => setGv(e.target.value)} type="number" min="0" max="20" className="score-input" />
                                    ) : (
                                        <span className="score-display" style={{ color: p.estado === 'FINALIZADO' ? '#0f172a' : '#94a3b8' }}>
                                            {p.golesV !== null ? p.golesV : '·'}
                                        </span>
                                    )}
                                </span>
                                <span className="partido-card__flag">{vis.flag}</span>
                                <span className="partido-card__team-name">{vis.nombre}</span>
                            </div>
                        </div>
                    </div>

                    <div className="partido-card__actions">
                        <BadgeEstado estado={p.estado} />
                        {isEdit ? (
                            <>
                                <button onClick={() => saveResult(p)} style={btnStyle('#2f9e44')}>✓ Guardar</button>
                                <button onClick={() => setEditId(null)} style={btnStyle('#555')}>✕</button>
                            </>
                        ) : (
                            <>
                                {p.estado !== 'FINALIZADO' && (
                                    <button onClick={() => avanzarEstado(p)} style={btnStyle('#3b5bdb')}>
                                        {p.estado === 'PROGRAMADO' ? '▶ Iniciar' : '✓ Finalizar'}
                                    </button>
                                )}
                                {(p.estado === 'EN_CURSO' || p.estado === 'FINALIZADO') && (
                                    <button onClick={() => { setEditId(p.id); setGl(p.golesL ?? ''); setGv(p.golesV ?? '') }} style={btnStyle('#64748b')}>
                                        ✎ Editar
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="partido-card__fecha">{p.fecha} · RF-05 / RF-15</div>
            </div>
        )
    }

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="PARTIDOS" value={partidos.length} sub="Total registrados" accent="#3b5bdb" />
                <StatCard label="EN CURSO" value={partidos.filter((p) => p.estado === 'EN_CURSO').length} accent="#16a34a" />
                <StatCard label="FINALIZADOS" value={partidos.filter((p) => p.estado === 'FINALIZADO').length} accent="#64748b" />
                <StatCard label="PENDIENTES" value={partidos.filter((p) => p.estado === 'PROGRAMADO').length} accent="#0891b2" />
            </div>

            {ordenGrupos.length === 0 && (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                    No hay partidos disponibles aún.
                </div>
            )}

            {ordenGrupos.map((grupoKey) => (
                <div key={grupoKey} style={{ marginBottom: 16 }}>
                    <button
                        onClick={() => toggleGroup(grupoKey)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: isGroupOpen(grupoKey) ? '10px 10px 0 0' : 10,
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: '#3b5bdb',
                            textTransform: 'uppercase',
                        }}>
                            {grupoKey === 'Grupo ?' ? 'Grupo sin definir' : grupoKey}
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{isGroupOpen(grupoKey) ? '▲' : '▼'}</span>
                    </button>

                    {isGroupOpen(grupoKey) && (
                        <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 12px 2px' }}>
                            {grupoKey === 'Eliminatorias' ? (
                                faseOrdenElim
                                    .filter((f) => partidosPorGrupo[grupoKey].some((p) => p.fase === f))
                                    .map((faseKey) => {
                                        const faseLabelText = faseLabel[faseKey] || faseKey
                                        const sectionKey = `${grupoKey}:${faseKey}`
                                        const partidosFase = partidosPorGrupo[grupoKey].filter((p) => p.fase === faseKey)
                                        return (
                                            <div key={sectionKey} style={{ marginBottom: 12 }}>
                                                <button
                                                    onClick={() => toggleSub(sectionKey)}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        background: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: isSubOpen(sectionKey) ? '10px 10px 0 0' : 10,
                                                        padding: '8px 14px',
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                    }}
                                                >
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{faseLabelText}</span>
                                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{isSubOpen(sectionKey) ? '▲' : '▼'}</span>
                                                </button>

                                                {isSubOpen(sectionKey) && (
                                                    <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '10px 10px 2px' }}>
                                                        <div className="matches-grid">
                                                            {partidosFase.map(renderPartidoCard)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                            ) : (
                                <div className="matches-grid">
                                    {partidosPorGrupo[grupoKey].map(renderPartidoCard)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default TabPartidos