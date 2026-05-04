const { useState, useEffect } = React;

// ── DOT ───────────────────────────────────────────────────────────────────────
function Dot({ color }) {
  return (
    <span style={{
      display:"inline-block", width:7, height:7, borderRadius:"50%",
      background:color, marginRight:5, flexShrink:0,
    }}/>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ border:`1px solid ${accent}33` }}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={{ color:accent }}>{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

// ── BADGE ESTADO ──────────────────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const c = ESTADOS_COLOR[estado] || ESTADOS_COLOR.PROGRAMADO;
  return (
    <span className="badge" style={{
      background:c.bg, border:`1px solid ${c.border}`, color:c.text,
    }}>
      <Dot color={c.border}/>{c.label}
    </span>
  );
}

// ── BADGE ROL ─────────────────────────────────────────────────────────────────
function BadgeRol({ rol }) {
  const map = {
    CREADOR:       { bg:"#1a1260", color:"#a5b4fc" },
    ADMINISTRADOR: { bg:"#12261a", color:"#6ee7b7" },
    PARTICIPANTE:  { bg:"#1a1a1a", color:"#9ca3af" },
  };
  const s = map[rol] || map.PARTICIPANTE;
  return (
    <span className="badge-rol" style={{ background:s.bg, color:s.color }}>
      {rol}
    </span>
  );
}