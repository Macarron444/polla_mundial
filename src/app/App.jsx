import { useState } from 'react'
import Header from './components/Header.jsx'
import Login from './components/Login.jsx'
import TabPartidos from './components/TabPartidos.jsx'
import TabGestionarPartidos from './components/TabGestionarPartidos.jsx'
import TabRanking from './components/TabRanking.jsx'
import TabPredicciones from './components/TabPredicciones.jsx'
import TabGrupos from './components/TabGrupos.jsx'
import { FOOTBALL_API_KEY } from '../core/config/footballData.js'
import { cargarDatosAPI } from '../core/api/footballDataApi.js'
import {
    EQUIPOS_DEFAULT,
    PARTIDOS_DEFAULT,
    PARTICIPANTES_DEFAULT,
} from '../core/data/defaults.js'
import { guardarUsuario } from '../core/storage/indexedDb.js'

function App() {
    const [usuario, setUsuario] = useState(null)
    const [tab, setTab] = useState('Partidos')
    const [partidos, setPartidos] = useState([])
    const [participantes, setParticipantes] = useState([])
    const [equipos, setEquipos] = useState(EQUIPOS_DEFAULT)
    const [apiStatus, setApiStatus] = useState('idle')
    const [apiMsg, setApiMsg] = useState('')

    const handleLogin = (usuarioAutenticado) => {
        setUsuario(usuarioAutenticado)
        guardarUsuario(usuarioAutenticado).catch((error) => {
            console.warn('No se pudo guardar el usuario en IndexedDB:', error)
        })
        if (FOOTBALL_API_KEY && FOOTBALL_API_KEY !== 'TU_API_KEY_AQUI') {
            sincronizarConAPI()
        }
    }

    const showInitialApiLoading = usuario && apiStatus === 'loading' && partidos.length === 0

    const handleLogout = () => {
        setUsuario(null)
        setTab('Partidos')
    }

    const sincronizarConAPI = async () => {
        setApiStatus('loading')
        setApiMsg('')
        try {
            const { equipos: equiposAPI, partidos: partidosAPI } = await cargarDatosAPI()
            setEquipos(equiposAPI)
            setPartidos(partidosAPI)
            setApiStatus('ok')
            setApiMsg(`✅ ${partidosAPI.length} partidos · ${equiposAPI.length} equipos`)
        } catch (err) {
            setApiStatus('error')
            setApiMsg(`❌ ${err.message}`)
        }
    }

    if (!usuario) return <Login onLogin={handleLogin} />

    if (showInitialApiLoading) {
        return (
            <div className="loading-page">
                <div className="loading-card">
                    <div className="loading-spinner" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </div>
                    <div className="loading-text">⏳ Conectando con la API…</div>
                    <div className="loading-subtext">
                        Espera unos segundos mientras cargamos los partidos y los equipos.
                    </div>
                </div>
            </div>
        )
    }

    const apiBtnColor =
        apiStatus === 'ok' ? '#2f9e44' : apiStatus === 'error' ? '#c92a2a' : '#3b5bdb'
    const apiBtnText =
        apiStatus === 'loading'
            ? '⏳ Sincronizando…'
            : apiStatus === 'ok'
                ? '🔄 Actualizar'
                : '🌐 Sincronizar API'

    const tabContent = {
        Partidos: (
            <TabPartidos partidos={partidos} setPartidos={setPartidos} equipos={equipos} />
        ),
        'Gestionar Partidos': (
            <TabGestionarPartidos
                partidos={partidos}
                setPartidos={setPartidos}
                equipos={equipos}
            />
        ),
        Ranking: (
            <TabRanking participantes={participantes} setParticipantes={setParticipantes} />
        ),
        'Mis Predicciones': <TabPredicciones usuario={usuario} partidos={partidos} equipos={equipos} />,
        'Mis Grupos': <TabGrupos usuario={usuario} />,
    }

    return (
        <div style={{ background: '#060c18', minHeight: '100vh' }}>
            <Header tab={tab} setTab={setTab} usuario={usuario} onLogout={handleLogout} />

            <div className="api-banner">
                <button
                    onClick={sincronizarConAPI}
                    disabled={apiStatus === 'loading'}
                    className="btn-api"
                    style={{
                        border: `1px solid ${apiBtnColor}`,
                        color: apiBtnColor,
                        opacity: apiStatus === 'loading' ? 0.6 : 1,
                    }}
                >
                    {apiBtnText}
                </button>

                {apiMsg && (
                    <span
                        style={{
                            fontSize: 10,
                            color: apiStatus === 'ok' ? '#69db7c' : '#ff8787',
                        }}
                    >
                        {apiMsg}
                    </span>
                )}

                {(!FOOTBALL_API_KEY || FOOTBALL_API_KEY === 'TU_API_KEY_AQUI') && (
                    <span style={{ fontSize: 10, color: '#ffa94d' }}>
                        ⚠️ Configura tu API Key en core/config/footballData.js
                    </span>
                )}
            </div>

            <main className="main-container">{tabContent[tab]}</main>
        </div>
    )
}

export default App