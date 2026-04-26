function Header({ tab, setTab }) {
  const tabs = ["Partidos", "Gestionar Partidos", "Ranking", "Mis Predicciones"];
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <header className="header">
      <div className="header__inner">

        {/* Marca + indicador online/offline */}
        <div className="header__brand">
          <span className="header__logo">⚽</span>
          <div>
            <div className="header__title">Polla Mundial 2026</div>
            <div className="header__subtitle">FIFA WORLD CUP · PWA</div>
          </div>

          <div className={`status-badge status-badge--${online ? "online" : "offline"}`}>
            <span className={`status-dot status-dot--${online ? "online" : "offline"}`}/>
            <span className={`status-text status-text--${online ? "online" : "offline"}`}>
              {online ? "EN LÍNEA" : "SIN CONEXIÓN"}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="header__nav">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`nav-tab nav-tab--${tab === t ? "active" : "inactive"}`}
            >{t}</button>
          ))}
        </nav>
      </div>

      {/* Banner offline */}
      {!online && (
        <div className="offline-banner">
          📡 Sin conexión — mostrando datos del caché del Service Worker
        </div>
      )}
    </header>
  );
}