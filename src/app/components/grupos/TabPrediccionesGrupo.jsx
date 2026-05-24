import { useState } from 'react'
import { btnStyle, PRED_COLOR, BadgeEstado } from '../../../shared/ui/index.jsx'
import {
    getPredicion,
    guardarPrediccion,
    usaComodinDisponible,
} from '../../../core/storage/prediccionesGrupo.js'

function CardPartidoPrediccion({ partido, equipos, grupo, usuario, onGuardado }) {
    const pred = getPredicion(grupo.id, usuario.id, partido.id)
    const [golesL, setGolesL] = useState(pred?.golesL ?? '')
    const [golesV, setGolesV] = useState(pred?.golesV ?? '')
    const [comodin, setComodin] = useState(pred?.usaComodin ?? false)
    const [msg, setMsg] = useState('')

    const local = equipos.find((e) => e.id === partido.local)
    const visitante = equipos.find((e) => e.id === partido.visitante)
    const bloqueado = partido.estado !== 'PROGRAMADO'
    const comodinDisp = usaComodinDisponible(grupo.id, usuario.id)

    const handleGuardar = () => {
        if (golesL === '' || golesV === '') { setMsg('Ingresa ambos marcadores'); return }
        guardarPrediccion(grupo.id, usuario.id, partido.id, Number(golesL), Number(golesV), comodin)
        setMsg('✓ Guardado')
        setTimeout(() => { setMsg(''); onGuardado() }, 1200)
    }

    const col = PRED_COLOR[pred?.estado ?? 'PENDIENTE']

    return (
        <div style={{
            background: '#0d1628', border: `1px solid ${pred ? col.dot + '55' : '#1e2a45'}`,
            borderRadius: 12, padding: '16px 18px', marginBottom: 10,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#4a6fa5' }}>{partido.fecha} · {partido.fase}</div>
                <BadgeEstado estado={partido.estado} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#e2e8f0', textAlign: 'right' }}>
                    {local?.flag} {local?.nombre}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="number" min="0" max="20" value={golesL} disabled={bloqueado}
                        onChange={(e) => setGolesL(e.target.value)}
                        style={{
                            width: 48, textAlign: 'center', background: '#060c18',
                            border: '1px solid #1e2a45', color: '#e2e8f0',
                            fontSize: 18, fontWeight: 800, borderRadius: 8, padding: '6px 0',
                            fontFamily: 'inherit', opacity: bloqueado ? 0.5 : 1,
                        }} />
                    <span style={{ color: '#4a6fa5', fontWeight: 700 }}>–</span>
                    <input type="number" min="0" max="20" value={golesV} disabled={bloqueado}
                        onChange={(e) => setGolesV(e.target.value)}
                        style={{
                            width: 48, textAlign: 'center', background: '#060c18',
                            border: '1px solid #1e2a45', color: '#e2e8f0',
                            fontSize: 18, fontWeight: 800, borderRadius: 8, padding: '6px 0',
                            fontFamily: 'inherit', opacity: bloqueado ? 0.5 : 1,
                        }} />
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                    {visitante?.flag} {visitante?.nombre}
                </span>
            </div>

            {!bloqueado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {(comodinDisp || pred?.usaComodin) && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: '#ffd43b' }}>
                            <input type="checkbox" checked={comodin}
                                onChange={(e) => setComodin(e.target.checked)}
                                disabled={!comodinDisp && !pred?.usaComodin} />
                            ⚡ Comodín (×2 puntos)
                        </label>
                    )}
                    <button onClick={handleGuardar} style={{ ...btnStyle('#3b5bdb'), marginLeft: 'auto' }}>
                        Guardar predicción
                    </button>
                    {msg && <span style={{ fontSize: 11, color: '#69db7c' }}>{msg}</span>}
                </div>
            )}

            {bloqueado && pred && (
                <div style={{ fontSize: 11, color: col.text }}>
                    Tu predicción: <strong>{pred.golesL} – {pred.golesV}</strong>
                    {pred.usaComodin && ' ⚡'} · {pred.estado} · {pred.pts} pts
                </div>
            )}
            {bloqueado && !pred && (
                <div style={{ fontSize: 11, color: '#555' }}>No predijiste este partido</div>
            )}
        </div>
    )
}

function TabPrediccionesGrupo({ grupo, usuario, partidos, equipos }) {
    const [refresh, setRefresh] = useState(0)
    const comodinUsado = !usaComodinDisponible(grupo.id, usuario.id)

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#4a6fa5' }}>
                    Predice el marcador exacto para ganar 3 pts, o solo el ganador para 1 pt.
                </div>
                <div style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: comodinUsado ? '#1a1a1a' : '#2a2000',
                    border: `1px solid ${comodinUsado ? '#333' : '#ffd43b55'}`,
                    color: comodinUsado ? '#555' : '#ffd43b',
                }}>
                    ⚡ Comodín {comodinUsado ? 'usado' : 'disponible'}
                </div>
            </div>

            {partidos.map((p) => (
                <CardPartidoPrediccion key={`${p.id}-${refresh}`}
                    partido={p} equipos={equipos} grupo={grupo}
                    usuario={usuario} onGuardado={() => setRefresh(r => r + 1)} />
            ))}
        </div>
    )
}

export default TabPrediccionesGrupo