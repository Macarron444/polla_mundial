import { getPredicionesPorGrupoPartido } from '../../../core/storage/prediccionesGrupo.js'
import { resolverPredicciones } from '../../../core/storage/prediccionesGrupo.js'
import { guardarSnapshot, calcularRanking } from '../../../core/storage/puntuacion.js'
import { btnStyle, PRED_COLOR, BadgeEstado } from '../../../shared/ui/index.jsx'
import { getRolEnGrupo } from '../../../core/storage/grupos.js'
import { useEffect, useState } from 'react'

function FilaPrediccion({ pred }) {
    const col = PRED_COLOR[pred.estado]
    return (
        <div className="g-pred-row">
            <span style={{ fontSize: 12, color: '#1e293b', flex: 1 }}>{pred.nombre ?? pred.usuarioId}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', width: 60, textAlign: 'center' }}>
                {pred.golesL} – {pred.golesV} {pred.usaComodin ? '⚡' : ''}
            </span>
            <span className="g-pred-badge" style={{ background: col.bg, color: col.text }}>
                {pred.estado} {pred.pts > 0 ? `+${pred.pts}` : ''}
            </span>
        </div>
    )
}

function CardPartidoHistorial({ partido, equipos, grupo, esAdmin, onResuelto }) {
    const [golesLR, setGolesLR]     = useState(partido.golesL ?? '')
    const [golesVR, setGolesVR]     = useState(partido.golesV ?? '')
    const [resolviendo, setResolviendo] = useState(false)
    const [msg, setMsg]             = useState('')

    const local     = equipos.find((e) => e.id === partido.local)
    const visitante = equipos.find((e) => e.id === partido.visitante)
    const [preds, setPreds] = useState([])
    const yaFinalizado = partido.estado === 'FINALIZADO'

    useEffect(() => {
        let activo = true
        getPredicionesPorGrupoPartido(grupo.id, partido.id)
            .then((items) => { if (activo) setPreds(items) })
            .catch(() => { if (activo) setPreds([]) })
        return () => { activo = false }
    }, [grupo.id, partido.id])

    const handleResolver = () => {
        if (golesLR === '' || golesVR === '') { setMsg('Ingresa el resultado real'); return }
        resolverPredicciones(grupo.id, partido.id, Number(golesLR), Number(golesVR))
        const ranking = calcularRanking(grupo)
        guardarSnapshot(grupo.id, ranking)
        setMsg('✓ Resultado registrado')
        setTimeout(() => { setMsg(''); setResolviendo(false); onResuelto() }, 1500)
    }

    return (
        <div className="g-partido-card">
            <div className="g-partido-card__header">
                <div style={{ flex: 1 }}>
                    <div className="g-partido-card__fecha">{partido.fecha} · {partido.fase}</div>
                    <div className="g-partido-card__titulo">
                        {local?.flag} {local?.nombre} vs {visitante?.flag} {visitante?.nombre}
                    </div>
                    {yaFinalizado && (
                        <div className="g-partido-card__resultado">
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
                <div className="g-partido-card__resolver">
                    <span style={{ fontSize: 12, color: '#475569' }}>{local?.nombre}</span>
                    <input type="number" min="0" max="20" value={golesLR} onChange={(e) => setGolesLR(e.target.value)} className="g-score-input" style={{ fontSize: 16 }} />
                    <span style={{ color: '#475569', fontWeight: 700 }}>–</span>
                    <input type="number" min="0" max="20" value={golesVR} onChange={(e) => setGolesVR(e.target.value)} className="g-score-input" style={{ fontSize: 16 }} />
                    <span style={{ fontSize: 12, color: '#475569' }}>{visitante?.nombre}</span>
                    <button onClick={handleResolver} style={btnStyle('#2f9e44')}>✓ Confirmar</button>
                    {msg && <span style={{ fontSize: 11, color: '#16a34a' }}>{msg}</span>}
                </div>
            )}

            {preds.length > 0 && (
                <div className="g-partido-card__preds">
                    <div className="g-partido-card__preds-label">PREDICCIONES ({preds.length})</div>
                    {preds.map((p) => <FilaPrediccion key={p.usuarioId} pred={p} />)}
                </div>
            )}
        </div>
    )
}

function TabHistorialGrupo({ grupo, usuario, partidos, equipos }) {
    const [refresh, setRefresh] = useState(0)
    const esAdmin     = getRolEnGrupo(grupo, usuario.id) === 'ADMIN'
    const finalizados = partidos.filter((p) => p.estado === 'FINALIZADO')
    const enCurso     = partidos.filter((p) => p.estado === 'EN_CURSO')
    const programados = partidos.filter((p) => p.estado === 'PROGRAMADO')

    const sectionLabel = (color) => ({ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.07em', marginBottom: 10 })

    return (
        <div key={refresh}>
            {enCurso.length > 0 && (
                <>
                    <div style={sectionLabel('#16a34a')}>EN CURSO</div>
                    {enCurso.map((p) => <CardPartidoHistorial key={p.id} partido={p} equipos={equipos} grupo={grupo} esAdmin={esAdmin} onResuelto={() => setRefresh(r => r + 1)} />)}
                </>
            )}
            {programados.length > 0 && (
                <>
                    <div style={{ ...sectionLabel('#3b5bdb'), marginTop: enCurso.length ? 16 : 0 }}>PRÓXIMOS</div>
                    {programados.map((p) => <CardPartidoHistorial key={p.id} partido={p} equipos={equipos} grupo={grupo} esAdmin={esAdmin} onResuelto={() => setRefresh(r => r + 1)} />)}
                </>
            )}
            {finalizados.length > 0 && (
                <>
                    <div style={{ ...sectionLabel('#94a3b8'), marginTop: 16 }}>FINALIZADOS</div>
                    {finalizados.map((p) => <CardPartidoHistorial key={p.id} partido={p} equipos={equipos} grupo={grupo} esAdmin={esAdmin} onResuelto={() => setRefresh(r => r + 1)} />)}
                </>
            )}
        </div>
    )
}

export default TabHistorialGrupo
