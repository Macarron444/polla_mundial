// ── FOOTBALL-DATA.ORG CONFIG ───────────────────────────────────────────────────
// Registrate en: https://www.football-data.org/client/register
const FOOTBALL_API_KEY = "67655057f3934e9f8674d35dec465040";
const FOOTBALL_BASE    = "https://api.football-data.org/v4";
const WORLD_CUP_ID     = 2000;

// ── COLORES POR ESTADO ────────────────────────────────────────────────────────
const ESTADOS_COLOR = {
  PROGRAMADO: { bg: "#1a2744", border: "#3b5bdb", text: "#748ffc", label: "Programado" },
  EN_CURSO:   { bg: "#1a3320", border: "#2f9e44", text: "#69db7c", label: "En Curso"   },
  FINALIZADO: { bg: "#1a1a1a", border: "#555",    text: "#aaa",    label: "Finalizado" },
  SUSPENDIDO: { bg: "#2d1a00", border: "#e67700", text: "#ffa94d", label: "Suspendido" },
  POSPUESTO:  { bg: "#2a1a2a", border: "#9c36b5", text: "#da77f2", label: "Pospuesto"  },
};

const PRED_COLOR = {
  PENDIENTE: { bg:"#1a2744", text:"#748ffc", dot:"#3b5bdb" },
  EXACTA:    { bg:"#0d2b1a", text:"#69db7c", dot:"#2f9e44" },
  CORRECTA:  { bg:"#1a2744", text:"#a9e34b", dot:"#74b816" },
  FALLIDA:   { bg:"#2a0d0d", text:"#ff8787", dot:"#c92a2a" },
};

// ── DATOS POR DEFECTO (se reemplazan con la API) ──────────────────────────────
const EQUIPOS_DEFAULT = [
  { id: 1, nombre: "Argentina",  grupo: "A", flag: "🇦🇷" },
  { id: 2, nombre: "Francia",    grupo: "A", flag: "🇫🇷" },
  { id: 3, nombre: "Brasil",     grupo: "B", flag: "🇧🇷" },
  { id: 4, nombre: "España",     grupo: "B", flag: "🇪🇸" },
  { id: 5, nombre: "Alemania",   grupo: "C", flag: "🇩🇪" },
  { id: 6, nombre: "Portugal",   grupo: "C", flag: "🇵🇹" },
  { id: 7, nombre: "Inglaterra", grupo: "D", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 8, nombre: "México",     grupo: "D", flag: "🇲🇽" },
];

// Variable mutable: se actualiza cuando carga la API
let EQUIPOS = [...EQUIPOS_DEFAULT];

const PARTIDOS_DEFAULT = [
  { id:1, local:1, visitante:2, golesL:null, golesV:null, fecha:"11 Jun · 18:00", fechaISO: new Date(Date.now()+20*60000).toISOString(),   estado:"PROGRAMADO", fase:"GRUPOS"  },
  { id:2, local:3, visitante:4, golesL:2,    golesV:1,    fecha:"11 Jun · 21:00", fechaISO: new Date(Date.now()-120*60000).toISOString(), estado:"FINALIZADO",  fase:"GRUPOS"  },
  { id:3, local:5, visitante:6, golesL:null, golesV:null, fecha:"12 Jun · 18:00", fechaISO: new Date(Date.now()+10*60000).toISOString(),   estado:"EN_CURSO",   fase:"GRUPOS"  },
  { id:4, local:7, visitante:8, golesL:null, golesV:null, fecha:"12 Jun · 21:00", fechaISO: new Date(Date.now()+60*60000).toISOString(),   estado:"PROGRAMADO", fase:"OCTAVOS" },
];

const PARTICIPANTES_DEFAULT = [
  { id:1, nombre:"Sebastián M.", pts:21, exactas:3, correctas:4, fallidas:1, rol:"CREADOR"       },
  { id:2, nombre:"Valentina R.", pts:18, exactas:2, correctas:5, fallidas:2, rol:"ADMINISTRADOR" },
  { id:3, nombre:"Camilo T.",    pts:18, exactas:2, correctas:4, fallidas:3, rol:"PARTICIPANTE"  },
  { id:4, nombre:"Lucía P.",     pts:15, exactas:1, correctas:6, fallidas:2, rol:"PARTICIPANTE"  },
  { id:5, nombre:"Andrés B.",    pts:12, exactas:1, correctas:4, fallidas:4, rol:"PARTICIPANTE"  },
];

const PREDICCIONES_DEFAULT = [
  { partidoId:2, golesL:2, golesV:0, estado:"CORRECTA",  pts:1 },
  { partidoId:3, golesL:1, golesV:2, estado:"PENDIENTE", pts:0 },
  { partidoId:1, golesL:1, golesV:1, estado:"PENDIENTE", pts:0 },
];