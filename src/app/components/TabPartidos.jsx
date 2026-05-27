import { useState } from 'react'
import { BadgeEstado, ESTADOS_COLOR, StatCard, btnStyle } from '../../shared/ui/index.jsx'
import { getEquipo } from '../../core/utils/teams.js'

function TabPartidos({ partidos, setPartidos, equipos }) {
    const [editId, setEditId] = useState(null)
    const [gl, setGl] = useState('')
    const [gv, setGv] = useState('')

    const faseLabel = {
        GRUPOS: 'Fase de Grupos',
        OCTAVOS: 'Octavos de Final',
        CUARTOS: 'Cuartos',
        SEMIFINAL: 'Semifinal',
        FINAL: 'Final',
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
            alert('Ingresa un resultado valido (numeros ≥ 0)')
            return
        }
        setPartidos((prev) =>
            prev.map((x) => (x.id === p.id ? { ...x, golesL: l, golesV: v } : x))
        )
        setEditId(null)
        setGl('')
        setGv('')
    }

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard
                    label="PARTIDOS"
                    value={partidos.length}
                    sub="Total registrados"
                    accent="#748ffc"
                />
                <StatCard
                    label="EN CURSO"
                    value={partidos.filter((p) => p.estado === 'EN_CURSO').length}
                    accent="#69db7c"
                />
                <StatCard
                    label="FINALIZADOS"
                    value={partidos.filter((p) => p.estado === 'FINALIZADO').length}
                    accent="#aaa"
                />
                <StatCard
                    label="PENDIENTES"
                    value={partidos.filter((p) => p.estado === 'PROGRAMADO').length}
                    accent="#4dabf7"
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {partidos.map((p) => {
                    const loc = getEquipo(equipos, p.local)
                    const vis = getEquipo(equipos, p.visitante)
                    const isEdit = editId === p.id
                    const c = ESTADOS_COLOR[p.estado]
                    return (
                        <div key={p.id} className="partido-card" style={{ border: `1px solid ${c.border}44` }}>
                            <div className="partido-card__row">
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: '#4a6fa5',
                                        fontWeight: 600,
                                        width: 90,
                                        flexShrink: 0,
                                    }}
                                >
                                    {faseLabel[p.fase] || p.fase}
                                </span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 100 }}>
                                    <span style={{ fontSize: 20 }}>{loc.flag}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#748ffc' }}>{loc.nombre}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {isEdit ? (
                                        <>
                                            <input
                                                value={gl}
                                                onChange={(e) => setGl(e.target.value)}
                                                type="number"
                                                min="0"
                                                max="20"
                                                className="score-input"
                                            />
                                            <span style={{ color: '#4a6fa5', fontWeight: 700 }}>–</span>
                                            <input
                                                value={gv}
                                                onChange={(e) => setGv(e.target.value)}
                                                type="number"
                                                min="0"
                                                max="20"
                                                className="score-input"
                                            />
                                        </>
                                    ) : (
                                        <span
                                            className="score-display"
                                            style={{
                                                color: p.estado === 'FINALIZADO' ? '#e2e8f0' : '#4a6fa5',
                                            }}
                                        >
                                            {p.golesL !== null ? `${p.golesL} – ${p.golesV}` : '· – ·'}
                                        </span>
                                    )}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        flex: 1,
                                        minWidth: 100,
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#748ffc' }}>{vis.nombre}</span>
                                    <span style={{ fontSize: 20 }}>{vis.flag}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    <BadgeEstado estado={p.estado} />
                                    {isEdit ? (
                                        <>
                                            <button onClick={() => saveResult(p)} style={btnStyle('#2f9e44')}>
                                                ✓ Guardar
                                            </button>
                                            <button onClick={() => setEditId(null)} style={btnStyle('#555')}>
                                                ✕
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {p.estado !== 'FINALIZADO' && (
                                                <button onClick={() => avanzarEstado(p)} style={btnStyle('#3b5bdb')}>
                                                    {p.estado === 'PROGRAMADO' ? '▶ Iniciar' : '✓ Finalizar'}
                                                </button>
                                            )}
                                            {(p.estado === 'EN_CURSO' || p.estado === 'FINALIZADO') && (
                                                <button
                                                    onClick={() => {
                                                        setEditId(p.id)
                                                        setGl(p.golesL ?? '')
                                                        setGv(p.golesV ?? '')
                                                    }}
                                                    style={btnStyle('#666')}
                                                >
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
                })}
            </div>
        </div>
    )
}

export default TabPartidos