function App() {
  const [usuario, setUsuario]         = useState(null); // null = no autenticado
  const [tab, setTab]                 = useState("Partidos");
  const [partidos, setPartidos]       = useState(PARTIDOS_DEFAULT);
  const [participantes, setParticipantes] = useState(PARTICIPANTES_DEFAULT);
  const [apiStatus, setApiStatus]     = useState("idle");
  const [apiMsg, setApiMsg]           = useState("");

  // [TS: UsuarioService.autenticar()] - guarda sesión en memoria
  const handleLogin = (usuarioAutenticado) => {
    setUsuario(usuarioAutenticado);
    // Carga la API al ingresar
    if (FOOTBALL_API_KEY !== "TU_API_KEY_AQUI") {
      sincronizarConAPI();
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setTab("Partidos");
  };

  // [TS: FootballDataService.sincronizarTodo()]
  const sincronizarConAPI = async () => {
    setApiStatus("loading"); setApiMsg("");
    try {
      const { equipos, partidos: partidosAPI } = await cargarDatosAPI();
      EQUIPOS = equipos;
      setPartidos(partidosAPI);
      setApiStatus("ok");
      setApiMsg(`✅ ${partidosAPI.length} partidos · ${equipos.length} equipos`);
    } catch (err) {
      setApiStatus("error");
      setApiMsg(`❌ ${err.message}`);
    }
  };

  // Si no hay sesión → mostrar login
  if (!usuario) return <Login onLogin={handleLogin}/>;

  const apiBtnColor = apiStatus==="ok" ? "#2f9e44" : apiStatus==="error" ? "#c92a2a" : "#3b5bdb";
  const apiBtnText  = apiStatus==="loading" ? "⏳ Sincronizando…"
                    : apiStatus==="ok"      ? "🔄 Actualizar"
                    : "🌐 Sincronizar API";

  const tabContent = {
    "Partidos":           <TabPartidos         partidos={partidos}           setPartidos={setPartidos}/>,
    "Gestionar Partidos": <TabGestionarPartidos partidos={partidos}           setPartidos={setPartidos}/>,
    "Ranking":            <TabRanking           participantes={participantes} setParticipantes={setParticipantes}/>,
    "Mis Predicciones":   <TabPredicciones      partidos={partidos}/>,
  };

  return (
    <div style={{ background:"#060c18", minHeight:"100vh" }}>
      <Header tab={tab} setTab={setTab} usuario={usuario} onLogout={handleLogout}/>

      {/* Banner sincronización API */}
      <div className="api-banner">
        <button
          onClick={sincronizarConAPI}
          disabled={apiStatus === "loading"}
          className="btn-api"
          style={{ border:`1px solid ${apiBtnColor}`, color:apiBtnColor, opacity: apiStatus==="loading" ? 0.6 : 1 }}
        >{apiBtnText}</button>

        {apiMsg && (
          <span style={{ fontSize:10, color: apiStatus==="ok" ? "#69db7c" : "#ff8787" }}>{apiMsg}</span>
        )}

        {FOOTBALL_API_KEY === "TU_API_KEY_AQUI" && (
          <span style={{ fontSize:10, color:"#ffa94d" }}>
            ⚠️ Configura tu API Key en <code>js/config.js</code>
          </span>
        )}
      </div>

      <main className="main-container">
        {tabContent[tab]}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
