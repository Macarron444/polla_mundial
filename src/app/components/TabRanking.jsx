import { useState } from 'react'
import { BadgeRol, StatCard, btnStyle } from '../../shared/ui/index.jsx'

function TabRanking({ participantes, setParticipantes }) {
    const [showForm, setShowForm] = useState(false)
    const [newNombre, setNewNombre] = useState('')
    const [newRol, setNewRol] = useState('PARTICIPANTE')
    const [confirmDel, setConfirmDel] = useState(null)

    const sorted = [...participantes].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        if (b.exactas !== a.exactas) return b.exactas - a.exactas
        if (b.correctas !== a.correctas) return b.correctas - a.correctas
        return a.fallidas - b.fallidas
    })

    const maxPts = sorted.length > 0 ? sorted[0].pts : 0

    const agregarUsuario = () => {
        if (!newNombre.trim()) {
            alert('Ingresa un nombre valido')
            return
        }
        const yaExiste = participantes.some(
            (p) => p.nombre.toLowerCase() === newNombre.trim().toLowerCase()
        )
        if (yaExiste) {
            alert('Ya existe un usuario con ese nombre')
            return
        }
        const nuevoId = Math.max(...participantes.map((p) => p.id), 0) + 1
        setParticipantes((prev) => [
            ...prev,
            {
                id: nuevoId,
                nombre: newNombre.trim(),
                pts: 0,
                exactas: 0,
                correctas: 0,
                fallidas: 0,
                rol: newRol,
            },
        ])
        setNewNombre('')
        setShowForm(false)
    }

    const eliminarUsuario = (id) => {
        const u = participantes.find((p) => p.id === id)
        if (u?.rol === 'CREADOR') {
            alert('No se puede eliminar al CREADOR de la polla')
            return
        }
        setParticipantes((prev) => prev.filter((p) => p.id !== id))
        setConfirmDel(null)
    }

    return (
        <div className="tab-section">
            <div className="stat-cards">
                <StatCard label="PARTICIPANTES" value={sorted.length} accent="#748ffc" />
                <StatCard label="PUNTAJE MAXIMO" value={maxPts} sub="pts" accent="#ffd43b" />
                <StatCard
                    label="PROMEDIO"
                    value={
                        sorted.length > 0
                            ? Math.round(sorted.reduce((a, p) => a + p.pts, 0) / sorted.length)
                            : 0
                    }
                    sub="pts"
                    accent="#69db7c"
                />
            </div>

            <div style={{ marginBottom: 14 }}>
                {!showForm ? (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            background: '#1a3a2a',
                            border: '1px solid #2f9e44',
                            color: '#69db7c',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '8px 16px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                            fontFamily: 'inherit',
                        }}
                    >
                        + Agregar Participante
                    </button>
                ) : (
                    <div
                        style={{
                            background: '#0d1628',
                            border: '1px solid #2f9e4455',
                            borderRadius: 10,
                            padding: '16px 18px',
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                            alignItems: 'flex-end',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
                            <label
                                style={{
                                    fontSize: 9,
                                    color: '#4a6fa5',
                                    fontWeight: 700,
                                    letterSpacing: '0.07em',
                                }}
                            >
                                NOMBRE
                            </label>
                            <input
                                value={newNombre}
                                onChange={(e) => setNewNombre(e.target.value)}
                                placeholder="Nombre del participante"
                                className="form-control--dark"
                                style={{ width: '100%' }}
                                onKeyDown={(e) => e.key === 'Enter' && agregarUsuario()}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label
                                style={{
                                    fontSize: 9,
                                    color: '#4a6fa5',
                                    fontWeight: 700,
                                    letterSpacing: '0.07em',
                                }}
                            >
                                ROL
                            </label>
                            <select
                                value={newRol}
                                onChange={(e) => setNewRol(e.target.value)}
                                className="form-control--dark"
                                style={{ minWidth: 140 }}
                            >
                                <option value="PARTICIPANTE">PARTICIPANTE</option>
                                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={agregarUsuario} style={btnStyle('#2f9e44')}>
                                ✓ Guardar
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(false)
                                    setNewNombre('')
                                }}
                                style={btnStyle('#555')}
                            >
                                ✕ Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="ranking-table">
                <div className="ranking-header">
                    <span>#</span>
                    <span>USUARIO</span>
                    <span style={{ textAlign: 'center' }}>EXACTAS</span>
                    <span style={{ textAlign: 'center' }}>CORRECTAS</span>
                    <span style={{ textAlign: 'center' }}>FALLIDAS</span>
                    <span style={{ textAlign: 'center' }}>ROL</span>
                    <span style={{ textAlign: 'right' }}>PUNTOS</span>
                    <span></span>
                </div>

                {sorted.length === 0 && (
                    <div style={{ padding: '30px 18px', textAlign: 'center', color: '#4a6fa5', fontSize: 13 }}>
                        No hay participantes. Agrega el primero.
                    </div>
                )}

                {sorted.map((p, i) => {
                    const pos = i + 1
                    const posColor = pos === 1 ? '#ffd43b' : pos === 2 ? '#adb5bd' : pos === 3 ? '#cd7f32' : '#4a6fa5'
                    const pct = maxPts > 0 ? Math.round((p.pts / maxPts) * 100) : 0
                    return (
                        <div key={p.id} className={`ranking-row ${pos === 1 ? 'ranking-row--first' : ''}`}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: posColor }}>{pos}</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{p.nombre}</div>
                                <div style={{ fontSize: 10, color: '#4a6fa5', marginTop: 2 }}>ID #{p.id}</div>
                            </div>
                            <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#69db7c' }}>{p.exactas}</span>
                            <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#a9e34b' }}>{p.correctas}</span>
                            <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#ff8787' }}>{p.fallidas}</span>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <BadgeRol rol={p.rol} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: pos === 1 ? '#ffd43b' : '#e2e8f0' }}>
                                    {p.pts}
                                </div>
                                <div className="ranking-pts-bar">
                                    <div
                                        className="ranking-pts-fill"
                                        style={{ width: `${pct}%`, background: pos === 1 ? '#ffd43b' : '#3b5bdb' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {p.rol !== 'CREADOR' &&
                                    (confirmDel === p.id ? (
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button
                                                onClick={() => eliminarUsuario(p.id)}
                                                style={{
                                                    background: '#3a0a0a',
                                                    border: '1px solid #c92a2a',
                                                    color: '#ff8787',
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    padding: '3px 6px',
                                                    borderRadius: 5,
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                Si
                                            </button>
                                            <button
                                                onClick={() => setConfirmDel(null)}
                                                style={{
                                                    background: '#1a1a1a',
                                                    border: '1px solid #444',
                                                    color: '#9ca3af',
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    padding: '3px 6px',
                                                    borderRadius: 5,
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDel(p.id)}
                                            title="Eliminar participante"
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #3a1a1a',
                                                color: '#c92a2a',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                padding: '3px 7px',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                lineHeight: 1,
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            ✕
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TabRanking
