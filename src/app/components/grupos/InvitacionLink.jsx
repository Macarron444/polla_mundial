import { useState } from 'react'
import { btnStyle } from '../../../shared/ui/index.jsx'

function InvitacionLink({ grupo }) {
    const [copiado, setCopiado] = useState(false)
    const link = `${window.location.origin}${window.location.pathname}?token=${grupo.token}`

    const copiar = () => {
        navigator.clipboard.writeText(link).then(() => {
            setCopiado(true)
            setTimeout(() => setCopiado(false), 2000)
        })
    }

    const copiarToken = () => {
        navigator.clipboard.writeText(grupo.token).then(() => {
            setCopiado(true)
            setTimeout(() => setCopiado(false), 2000)
        })
    }

    return (
        <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 14 }}>
                🔗 INVITAR AL GRUPO
            </div>

            <div style={{ background: '#0d1628', border: '1px solid #1e2a45', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#4a6fa5', marginBottom: 14 }}>
                    Comparte el código o el enlace. Cualquier usuario registrado puede usarlo para solicitar ingreso al grupo.
                </div>

                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 8 }}>CÓDIGO DE INVITACIÓN</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                            flex: 1, background: '#060c18', border: '1px solid #3b5bdb55',
                            borderRadius: 8, padding: '10px 16px',
                            fontSize: 22, fontWeight: 800, letterSpacing: '0.15em', color: '#748ffc',
                            textAlign: 'center',
                        }}>
                            {grupo.token}
                        </div>
                        <button onClick={copiarToken} style={btnStyle('#748ffc')}>
                            {copiado ? '✓ Copiado' : 'Copiar'}
                        </button>
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.07em', marginBottom: 8 }}>ENLACE DIRECTO</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                            flex: 1, background: '#060c18', border: '1px solid #1e2a45',
                            borderRadius: 8, padding: '8px 12px',
                            fontSize: 10, color: '#4a6fa5', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {link}
                        </div>
                        <button onClick={copiar} style={btnStyle('#3b5bdb')}>
                            {copiado ? '✓ Copiado' : 'Copiar enlace'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ fontSize: 10, color: '#2a3a5a' }}>
                💡 El admin del grupo debe aprobar cada solicitud de ingreso.
            </div>
        </div>
    )
}

export default InvitacionLink