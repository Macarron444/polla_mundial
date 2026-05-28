import { useState, useEffect } from 'react'
import { btnStyle, PRED_COLOR, BadgeEstado } from '../../../shared/ui/index.jsx'
import {
    getPredicion,
    guardarPrediccion,
    usaComodinDisponible,
} from '../../../core/storage/prediccionesGrupo.js'

function CardPartidoPrediccion({ partido, equipos, grupo, usuario, onGuardado }) {
    const [pred, setPred]     = useState(null)
    const [golesL, setGolesL] = useState('')
    const [golesV, setGolesV] = useState('')
    const [comodin, setComodin] = useState(false)
    const [msg, setMsg]       = useState('')

    useEffect(() => {
        getPredicion(grupo.id, usuario.id, partido.id).then((p) => {
            setPred(p)
            setGolesL(p?.golesL ?? '')
            setGolesV(p?.golesV ?? '')
            setComodin(p?.usaComodin ?? false)
        })
    }, [grupo.id, usuario.id, partido.id])

    const local     = equipos.find((e) => e.id === partido.local)
    const visitante = equipos.find((e) => e.id === partido.visitante)
    const bloqueado = partido.estado !== 'PROGRAMADO'

    const [comodinDisp, setComodinDisp] = useState(false)
    useEffect(() => {
        usaComodinDisponible(grupo.id, usuario.id).then(setComodinDisp)
    }, [grupo.id, usuario.id])

    const handleGuardar = async () => {
        if (golesL === '' || golesV === '') { setMsg('Ingresa ambos marcadores'); return }
        await guardarPrediccion(grupo.id, usuario.id, partido.id, Number(golesL), Number(golesV), comodin)
        setMsg('✓ Guardado')
        setTimeout(() => { setMsg(''); onGuardado() }, 1200)
    }

    const col = PRED_COLOR[pred?.estado ?? 'PENDIENTE']

    const inputStyle = (disabled) => ({
        width: 48, textAlign: 'center', background: disabled ? '#f1f5f9' : '#ffffff',
        border: `1px solid ${disabled ? '#e2e8f0' : '#c7d2fe'}`, color: '#1e293b',
        fontSize: 18, fontWeight: 800, borderRadius: 8, padding: '6px 0',
        fontFamily: 'inherit', opacity: disabled ? 0.6 : 1,
    })

    return (
        <div style={{
            background: '#ffffff', border: `1px solid ${pred ? '#c7d2fe' : '#e2e8f0'}`,
            borderRadius: 12, padding: '16px 18px', marginBottom: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>{partido.fecha} · {partido.fase}</div>
                <BadgeEstado estado={partido.estado} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                    {local?.flag} {local?.nombre}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="number" min="0" max="20" value={golesL} disabled={bloqueado}
                        onChange={(e) => setGolesL(e.target.value)} style={inputStyle(bloqueado)} />
                    <span style={{ color: '#94a3b8', fontWeight: 700 }}>–</span>
                    <input type="number" min="0" max="20" value={golesV} disabled={bloqueado}
                        onChange={(e) => setGolesV(e.target.value)} style={inputStyle(bloqueado)} />
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {visitante?.flag} {visitante?.nombre}
                </span>
            </div>

            {!bloqueado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {(comodinDisp || pred?.usaComodin) && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: '#d97706' }}>
                            <input type="checkbox" checked={comodin}
                                onChange={(e) => setComodin(e.target.checked)}
                                disabled={!comodinDisp && !pred?.usaComodin} />
                            ⚡ Comodín (×2 puntos)
                        </label>
                    )}
                    <button onClick={handleGuardar} style={{ ...btnStyle('#3b5bdb'), marginLeft: 'auto' }}>
                        Guardar predicción
                    </button>
                    {msg && <span style={{ fontSize: 11, color: '#16a34a' }}>{msg}</span>}
                </div>
            )}

            {bloqueado && pred && (
                <div style={{ fontSize: 11, color: col.text, background: col.bg, padding: '6px 10px', borderRadius: 6 }}>
                    Tu predicción: <strong>{pred.golesL} – {pred.golesV}</strong>
                    {pred.usaComodin && ' ⚡'} · {pred.estado} · {pred.pts} pts
                </div>
            )}
            {bloqueado && !pred && (
                <div style={{ fontSize: 11, color: '#94a3b8' }}>No predijiste este partido</div>
            )}
        </div>
    )
}

function TabPrediccionesGrupo({ grupo, usuario, partidos, equipos }) {
    const [refresh, setRefresh]       = useState(0)
    const [comodinUsado, setComodinUsado] = useState(false)

    const partidosGrupo = grupo.partidosSeleccionados
        ? partidos.filter((p) => grupo.partidosSeleccionados.includes(p.id))
        : partidos

    useEffect(() => {
        usaComodinDisponible(grupo.id, usuario.id).then((disp) => setComodinUsado(!disp))
    }, [grupo.id, usuario.id, refresh])

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                    Predice el marcador exacto para ganar 3 pts, o solo el ganador para 1 pt.
                    {grupo.partidosSeleccionados && (
                        <span style={{ color: '#3b5bdb', marginLeft: 6 }}>
                            ({partidosGrupo.length} partidos seleccionados)
                        </span>
                    )}
                </div>
                <div style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: comodinUsado ? '#f1f5f9' : '#fffbeb',
                    border: `1px solid ${comodinUsado ? '#e2e8f0' : '#fde68a'}`,
                    color: comodinUsado ? '#94a3b8' : '#d97706',
                }}>
                    ⚡ Comodín {comodinUsado ? 'usado' : 'disponible'}
                </div>
            </div>

            {partidosGrupo.length === 0 && (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                    El administrador aún no ha seleccionado partidos para este grupo.
                </div>
            )}

            {partidosGrupo.map((p) => (
                <CardPartidoPrediccion key={`${p.id}-${refresh}`}
                    partido={p} equipos={equipos} grupo={grupo}
                    usuario={usuario} onGuardado={() => setRefresh(r => r + 1)} />
            ))}
        </div>
    )
}

export default TabPrediccionesGrupo