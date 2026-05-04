function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [toast, setToast]   = useState(null); // { msg, type }
  const isFirst = React.useRef(true);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      if (!isFirst.current) setToast({ msg: "Conexión restaurada", type: "online" });
    };
    const goOffline = () => {
      setOnline(false);
      setToast({ msg: "Sin conexión — usando caché", type: "offline" });
    };
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    isFirst.current = false;
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Auto-dismiss toast after 3.5 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return { online, toast, dismissToast: () => setToast(null) };
}

function ConnectionToast({ toast, onDismiss }) {
  if (!toast) return null;
  const isOnline = toast.type === "online";
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:9999, display:"flex", alignItems:"center", gap:10,
      background: isOnline ? "#0d2010" : "#1a0d0d",
      border: `1px solid ${isOnline ? "#2f9e44" : "#c92a2a"}`,
      borderRadius:12, padding:"10px 18px",
      boxShadow: `0 4px 24px ${isOnline ? "#2f9e4433" : "#c92a2a33"}`,
      animation:"toastIn 0.3s ease",
      minWidth:220,
    }}>
      <span style={{
        width:9, height:9, borderRadius:"50%", flexShrink:0,
        background: isOnline ? "#69db7c" : "#ff6b6b",
        boxShadow: `0 0 8px ${isOnline ? "#69db7c" : "#ff6b6b"}`,
        animation: isOnline ? "none" : "pulse 1.2s infinite",
      }}/>
      <span style={{
        fontSize:12, fontWeight:700, letterSpacing:"0.04em",
        color: isOnline ? "#69db7c" : "#ff8787", flex:1,
      }}>
        {isOnline ? "🌐 " : "📡 "}{toast.msg}
      </span>
      <button onClick={onDismiss} style={{
        background:"transparent", border:"none", color:"#4a6fa5",
        fontSize:14, cursor:"pointer", lineHeight:1, padding:"0 2px",
        fontFamily:"inherit",
      }}>✕</button>
    </div>
  );
}

function Header({ tab, setTab, usuario, onLogout }) {
  const tabs = ["Partidos", "Gestionar Partidos", "Ranking", "Mis Predicciones"];
  const { online, toast, dismissToast } = useOnlineStatus();

  const rolIcon = usuario?.rol === "CREADOR" ? "👑"
                : usuario?.rol === "ADMINISTRADOR" ? "🛡️"
                : "👤";

  return (
    <>
      <header className="header">
        <div className="header__inner">

          {/* Marca */}
          <div className="header__brand">
            <span className="header__logo">⚽</span>
            <div>
              <div className="header__title">Polla Mundial 2026</div>
              <div className="header__subtitle">FIFA WORLD CUP · PWA</div>
            </div>

            {/* Indicador de conexión */}
            <div style={{
              display:"flex", alignItems:"center", gap:6,
              background: online ? "#0d2010" : "#1a0d0d",
              border: `1px solid ${online ? "#2f9e44" : "#c92a2a"}`,
              borderRadius:20, padding:"4px 12px",
              transition:"all 0.4s ease",
            }}>
              <span style={{
                width:8, height:8, borderRadius:"50%", flexShrink:0,
                background: online ? "#69db7c" : "#ff6b6b",
                boxShadow: `0 0 ${online ? "6px #69db7c" : "6px #ff6b6b"}`,
                animation: online ? "none" : "pulse 1.2s infinite",
                transition:"background 0.4s, box-shadow 0.4s",
              }}/>
              <span style={{
                fontSize:10, fontWeight:700, letterSpacing:"0.07em",
                color: online ? "#69db7c" : "#ff6b6b",
                transition:"color 0.4s",
              }}>
                {online ? "EN LÍNEA" : "SIN CONEXIÓN"}
              </span>
            </div>
          </div>

          {/* Navegación + usuario */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <nav className="header__nav">
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`nav-tab nav-tab--${tab === t ? "active" : "inactive"}`}
                >{t}</button>
              ))}
            </nav>

            {usuario && (
              <div style={{ display:"flex", alignItems:"center", gap:8, borderLeft:"1px solid #1e2a45", paddingLeft:12 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#e2e8f0" }}>
                    {rolIcon} {usuario.nombre}
                  </div>
                  <div style={{ fontSize:9, color:"#4a6fa5", letterSpacing:"0.05em" }}>
                    {usuario.rol}
                  </div>
                </div>
                <button onClick={onLogout} title="Cerrar sesión" style={{
                  background:"#1a0d0d", border:"1px solid #c92a2a44", color:"#ff8787",
                  fontSize:10, fontWeight:700, padding:"5px 9px", borderRadius:6,
                  cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.04em",
                }}>⏻</button>
              </div>
            )}
          </div>
        </div>

        {/* Banner persistente cuando está offline */}
        {!online && (
          <div className="offline-banner">
            📡 Sin conexión — mostrando datos del caché del Service Worker
          </div>
        )}
      </header>

      {/* Toast flotante al cambiar estado */}
      <ConnectionToast toast={toast} onDismiss={dismissToast}/>
    </>
  );
}
