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
import { EQUIPOS_DEFAULT } from '../core/data/defaults.js'

const esAdmin = (u) => u?.rol === 'CREADOR' || u?.rol === 'ADMINISTRADOR'

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
        if (FOOTBALL_API_KEY && FOOTBALL_API_KEY !== 'TU_API_KEY_AQUI') {
            sincronizarConAPI()
        }
    }

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

    const showInitialApiLoading = apiStatus === 'loading' && partidos.length === 0
    if (showInitialApiLoading) {
        return (
            <div className="loading-page">
                <div className="loading-card">
                    <div className="loading-spinner" aria-hidden="true">
                        <span /><span /><span />
                    </div>
                    <div className="loading-text">⏳ Conectando con la API…</div>
                    <div className="loading-subtext">
                        Espera unos segundos mientras cargamos los partidos y los equipos.
                    </div>
                </div>
            </div>
        )
    }

    const apiBtnText = apiStatus === 'loading' ? '⏳ Sincronizando…'
        : apiStatus === 'ok' ? '🔄 Actualizar'
            : '🌐 Sincronizar API'

    const apiBtnClass = `btn-api btn-api--${apiStatus}`
    const apiMsgClass = `api-message api-message--${apiStatus}`

    const tabContent = {
        'Partidos': <TabPartidos partidos={partidos} setPartidos={setPartidos} equipos={equipos} usuario={usuario} />,
        ...(esAdmin(usuario) && {
            'Gestionar Partidos': <TabGestionarPartidos partidos={partidos} setPartidos={setPartidos} equipos={equipos} />,
        }),
        'Ranking': <TabRanking usuario={usuario} />,
        'Mis Predicciones': <TabPredicciones usuario={usuario} partidos={partidos} equipos={equipos} />,
        'Mis Grupos': <TabGrupos usuario={usuario} partidos={partidos} equipos={equipos} />,
    }

    // Si el tab activo ya no está disponible (ej: perdió permisos), volver a Partidos
    const tabSeguro = tabContent[tab] ? tab : 'Partidos'

    return (
        <div className="app-shell">
            <Header tab={tab} setTab={setTab} usuario={usuario} onLogout={handleLogout} />

            <div className="api-banner">
                <button
                    onClick={sincronizarConAPI}
                    disabled={apiStatus === 'loading'}
                    className={apiBtnClass}
                >
                    {apiBtnText}
                </button>

                {apiMsg && (
                    <span className={apiMsgClass}>
                        {apiMsg}
                    </span>
                )}

                {(!FOOTBALL_API_KEY || FOOTBALL_API_KEY === 'TU_API_KEY_AQUI') && (
                    <span className="api-message api-message--warn">
                        ⚠️ Configura tu API Key en core/config/footballData.js
                    </span>
                )}
            </div>

            <main className="main-container">{tabContent[tabSeguro]}</main>
        </div>
    )
}

export default App