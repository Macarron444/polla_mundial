const http    = require("http");
const https   = require("https");
const fs      = require("fs");
const path    = require("path");
const babel   = require("@babel/core");

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

const PORT             = 3000;
const FOOTBALL_HOST    = "api.football-data.org";
const FOOTBALL_API_KEY = "67655057f3934e9f8674d35dec465040";

// ── TIPOS MIME ────────────────────────────────────────────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
};

// ── TRANSPILACIÓN JSX ─────────────────────────────────────────────────────────
// Convierte JSX → JS puro antes de enviarlo al browser
// Así no se necesita babel en el cliente y los archivos pueden estar separados

const JSX_DIR = path.join(__dirname, "src", "js");

function transpilarJSX(codigo, nombreArchivo) {
  const result = babel.transformSync(codigo, {
    presets: [["@babel/preset-react"]],
    filename: nombreArchivo,
  });
  return result.code;
}

// ── SERVIDOR ──────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {

  // ── CORS headers (para desarrollo local) ──────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── PROXY: /api/* → football-data.org ────────────────────────────────────
  if (req.url.startsWith("/api/")) {
    const fdPath = "/v4" + req.url.replace("/api", "");

    const options = {
      hostname: FOOTBALL_HOST,
      path:     fdPath,
      method:   "GET",
      headers:  {
        "X-Auth-Token": FOOTBALL_API_KEY,
        "Accept":       "application/json",
      },
    };

    const proxy = https.request(options, (fdRes) => {
      res.writeHead(fdRes.statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      fdRes.pipe(res);
    });

    proxy.on("error", (err) => {
      console.error("❌ Error al contactar football-data.org:", err.message);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No se pudo conectar con la API de fútbol" }));
    });

    proxy.end();
    return;
  }

  // ── ARCHIVOS ESTÁTICOS ────────────────────────────────────────────────────
  let filePath = req.url === "/" ? "/index.html" : req.url;
  // Quitar query strings si los hay
  filePath = filePath.split("?")[0];
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback → index.html
      fs.readFile(path.join(__dirname, "index.html"), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end("404 Not Found"); return; }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data2);
      });
      return;
    }

    const ext  = path.extname(filePath);
    const mime = MIME[ext] || "application/octet-stream";

    // ── Transpilar JSX para archivos .js dentro de src/js/ ──────────────────
    if (ext === ".js" && filePath.startsWith(JSX_DIR)) {
      try {
        const codigo = data.toString("utf8");
        const transpilado = transpilarJSX(codigo, path.basename(filePath));
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(transpilado);
        return;
      } catch (babelErr) {
        console.error("❌ Error transpilando", path.basename(filePath), ":", babelErr.message);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error de transpilación: " + babelErr.message);
        return;
      }
    }

    // Service Worker: sin caché
    const isServiceWorker = req.url === "/sw.js";
    const extraHeaders = isServiceWorker
      ? {
          "Cache-Control":          "no-store, no-cache, must-revalidate",
          "Pragma":                 "no-cache",
          "Service-Worker-Allowed": "/",
        }
      : {};

    res.writeHead(200, { "Content-Type": mime, ...extraHeaders });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   🌍 Polla Mundial 2026 - Servidor      ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log(`║   Dashboard: http://localhost:${PORT}       ║`);
  console.log(`║   API proxy: http://localhost:${PORT}/api/  ║`);
  console.log("╚══════════════════════════════════════════╝");
});
