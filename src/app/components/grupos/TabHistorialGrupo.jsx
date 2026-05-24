import { getPredicionesPorGrupoPartido } from '../../../core/storage/prediccionesGrupo.js'
import { resolverPredicciones } from '../../../core/storage/prediccionesGrupo.js'
import { guardarSnapshot, calcularRanking } from '../../../core/storage/puntuacion.js'
import { btnStyle, PRED_COLOR, BadgeEstado } from '../../../shared/ui/index.jsx'
import { getRolEnGrupo } from '../../../core/storage/grupos.js'
import { useState } from 'react'

function FilaPrediccion({ pred }) {
    const col = PRED_COLOR[pred.estado]
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderBottom: '1px solid #0d1628',
        }}>
            <span style={{ fontSize: 12, color: '#e2e8f0', flex: 1 }}>{pred.nombre ?? pred.usuarioId}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', width: 60, textAlign: 'center' }}>
                {pred.golesL} – {pred.golesV} {pred.usaComodin ? '⚡' : ''}
            </span>
            <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                background: col.bg, color: col.text, minWidth: 70, textAlign: 'center',
            }}>
                {pred.estado} {pred.pts > 0 ? `+${pred.pts}` : ''}
            </span>
        </div>
    )
}

function CardPartidoHistorial({ partido, equipos, grupo, esAdmin, onResuelto }) {
    const [golesLR, setGolesLR] = useState(partido.golesL ?? '')
    const [golesVR, setGolesVR] = useState(partido.golesV ?? '')
    const [resolviendo, setResolviendo] = useState(false)
    const [msg, setMsg] = useState('')

    const local = equipos.find((e) => e.id === partido.local)
    const visitante = equipos.find((e) => e.id === partido.visitante)
    const preds = getPredicionesPorGrupoPartido(grupo.id, partido.id)
    const yaFinalizado = partido.estado === 'FINALIZADO'

    const handleResolver = () => {
        if (golesLR === '' || golesVR === '') { setMsg('Ingresa el resultado real'); return }
        resolverPredicciones(grupo.id, partido.id, Number(golesLR), Number(golesVR))
        const ranking = calcularRanking(grupo)
        guardarSnapshot(grupo.id, ranking)
        setMsg('✓ Resultado registrado')
        setTimeout(() => { setMsg(''); setResolviendo(false); onResuelto() }, 1500)
    }

    return (
        <div style={{
            background: '#0d1628', border: '1px solid #1e2a45',
            borderRadius: 12, marginBottom: 12, overflow: 'hidden',
        }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#4a6fa5', marginBottom: 4 }}>{partido.fecha} · {partido.fase}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0' }}>
                        {local?.flag} {local?.nombre} vs {visitante?.flag} {visitante?.nombre}
                    </div>
                    {yaFinalizado && (
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#69db7c', marginTop: 4 }}>
                            Resultado: {partido.golesL} – {partido.golesV}
                        </div>
                    )}
                </div>
                <BadgeEstado estado={partido.estado} />
                {esAdmin && !yaFinalizado && partido.estado !== 'PROGRAMADO' && (
                    <button onClick={() => setResolviendo(!resolviendo)} style={btnStyle('#2f9e44')}>
                        Registrar resultado
                    </button>
                )}
            </div>

            {resolviendo && (
                <div style={{ padding: '12px 16px', background: '#060c18', borderTop: '1px solid #1e2a45', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#4a6fa5' }}>{local?.nombre}</span>
                    <input type="number" min="0" max="20" value={golesLR} onChange={(e) => setGolesLR(e.target.value)}
                        style={{ width: 48, textAlign: 'center', background: '#0d1628', border: '1px solid #3b5bdb', color: '#e2e8f0', fontSize: 16, fontWeight: 800, borderRadius: 6, padding: '4px 0', fontFamily: 'inherit' }} />
                    <span style={{ color: '#4a6fa5', fontWeight: 700 }}>–</span>
                    <input type="number" min="0" max="20" value={golesVR} onChange={(e) => setGolesVR(e.target.value)}
                        style={{ width: 48, textAlign: 'center', background: '#0d1628', border: '1px solid #3b5bdb', color: '#e2e8f0', fontSize: 16, fontWeight: 800, borderRadius: 6, padding: '4px 0', fontFamily: 'inherit' }} />
                    <span style={{ fontSize: 12, color: '#4a6fa5' }}>{visitante?.nombre}</span>
                    <button onClick={handleResolver} style={btnStyle('#2f9e44')}>✓ Confirmar</button>
                    {msg && <span style={{ fontSize: 11, color: '#69db7c' }}>{msg}</span>}
                </div>
            )}

            {preds.length > 0 && (
                <div style={{ borderTop: '1px solid #1e2a45' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', padding: '8px 12px' }}>
                        PREDICCIONES ({preds.length})
                    </div>
                    {preds.map((p) => <FilaPrediccion key={p.usuarioId} pred={p} />)}
                </div>
            )}
        </div>
    )
}

function TabHistorialGrupo({ grupo, usuario, partidos, equipos }) {
    const [refresh, setRefresh] = useState(0)
    const esAdmin = getRolEnGrupo(grupo, usuario.id) === 'ADMIN'
    const finalizados = partidos.filter((p) => p.estado === 'FINALIZADO')
    const enCurso = partidos.filter((p) => p.estado === 'EN_CURSO')
    const programados = partidos.filter((p) => p.estado === 'PROGRAMADO')

    return (
        <div key={refresh}>
            {enCurso.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#69db7c', letterSpacing: '0.07em', marginBottom: 10 }}>EN CURSO</div>
                    {enCurso.map((p) => <CardPartidoHistorial key={p.id} partido={p} equipos={equipos} grupo={grupo} esAdmin={esAdmin} onResuelto={() => setRefresh(r => r + 1)} />)}
                </>
            )}
            {programados.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#748ffc', letterSpacing: '0.07em', marginBottom: 10, marginTop: enCurso.length ? 16 : 0 }}>PRÓXIMOS</div>
                    {programados.map((p) => <CardPartidoHistorial key={p.id} partido={p} equipos={equipos} grupo={grupo} esAdmin={esAdmin} onResuelto={() => setRefresh(r => r + 1)} />)}
                </>
            )}
            {finalizados.length > 0 && (
                <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: '0.07em', marginBottom: 10, marginTop: 16 }}>FINALIZADOS</div>
                    {finalizados.map((p) => <CardPartidoHistorial key={p.id} partido={p} equipos={equipos} grupo={grupo} esAdmin={esAdmin} onResuelto={() => setRefresh(r => r + 1)} />)}
                </>
            )}
        </div>
    )
}

export default TabHistorialGrupo