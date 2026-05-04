const USUARIOS_REGISTRADOS = [
  { id:1, nombre:"Sebastián M.", email:"admin@gmail.com",  password:"admin123",  rol:"CREADOR"       },
  { id:2, nombre:"Valentina R.", email:"vale@gmail.com",   password:"vale123",   rol:"ADMINISTRADOR" },
  { id:3, nombre:"Camilo T.",    email:"camilo@gmail.com", password:"camilo123", rol:"PARTICIPANTE"  },
  { id:4, nombre:"Lucía P.",     email:"lucia@gmail.com",  password:"lucia123",  rol:"PARTICIPANTE"  },
  { id:5, nombre:"Andrés B.",    email:"andres@gmail.com", password:"andres123", rol:"PARTICIPANTE"  },
];

// ── COMPONENTE LOGIN ──────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // [TS: UsuarioService.autenticar(email, password)]
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña");
      return;
    }
    setLoading(true);
    setError("");

    // Simula latencia de red (reemplazar con fetch real al backend)
    await new Promise(r => setTimeout(r, 600));

    const usuario = USUARIOS_REGISTRADOS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (usuario) {
      const { password: _, ...usuarioSeguro } = usuario;
      onLogin(usuarioSeguro);
    } else {
      setError("Correo o contraseña incorrectos");
    }
    setLoading(false);
  };

  const loginRapido = (u) => {
    setEmail(u.email);
    setPassword(u.password);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo__icon">⚽</div>
          <div className="login-logo__title">Polla Mundial 2026</div>
          <div className="login-logo__subtitle">FIFA WORLD CUP · PWA</div>
        </div>

        {/* Formulario */}
        <div className="login-field">
          <label className="login-label">CORREO ELECTRÓNICO</label>
          <input
            type="email"
            className="login-input"
            placeholder="tu@correo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className="login-field">
          <label className="login-label">CONTRASEÑA</label>
          <input
            type="password"
            className="login-input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "⏳ Verificando..." : "Ingresar →"}
        </button>

        {error && <div className="login-error">⚠️ {error}</div>}

        {/* Acceso rápido para demo */}
        <div className="login-hint">
          <div style={{ marginBottom:8 }}>Acceso rápido (demo)</div>
          <div className="login-quick">
            {USUARIOS_REGISTRADOS.map(u => (
              <button key={u.id} className="login-user-badge" onClick={() => loginRapido(u)}>
                {u.rol === "CREADOR" ? "👑" : u.rol === "ADMINISTRADOR" ? "🛡️" : "👤"} {u.nombre.split(" ")[0]}
              </button>
            ))}
          </div>
          <div style={{ marginTop:10 }}>
            Haz clic en un nombre para prellenar · luego <strong>Ingresar</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
