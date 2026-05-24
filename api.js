import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH   = process.env.DB_PATH ?? join(__dirname, 'polla-data.json')

// ── BASE DE DATOS EN JSON (sin dependencias nativas) ──────────────────────────
function loadDb() {
  if (!existsSync(DB_PATH)) return { usuarios: [], grupos: [], predicciones: [], comentarios: {}, solicitudes: [], ranking: {} }
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')) } catch { return { usuarios: [], grupos: [], predicciones: [], comentarios: {}, solicitudes: [], ranking: {} } }
}

function saveDb(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export const router = express.Router()

// ── USUARIOS ──────────────────────────────────────────────────────────────────
router.get('/usuarios/todos', (req, res) => {
  const db = loadDb()
  res.json(db.usuarios.map(({ password: _, ...u }) => u))
})

router.post('/usuarios', (req, res) => {
  try {
    const db = loadDb()
    const nuevo = { ...req.body, actualizadoEn: new Date().toISOString() }
    const idx = db.usuarios.findIndex(u => u.email.toLowerCase() === nuevo.email.toLowerCase())
    if (idx >= 0) db.usuarios[idx] = { ...db.usuarios[idx], ...nuevo }
    else db.usuarios.push(nuevo)
    saveDb(db)
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.post('/usuarios/login', (req, res) => {
  const { email, password } = req.body
  const db = loadDb()
  const u = db.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!u || u.password !== password)
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
  const { password: _p, ...safe } = u
  res.json({ usuario: safe })
})

// ── GRUPOS ────────────────────────────────────────────────────────────────────
router.get('/grupos', (req, res) => {
  const db = loadDb()
  res.json(db.grupos)
})

router.put('/grupos/:id', (req, res) => {
  try {
    const db = loadDb()
    const grupo = { ...req.body, actualizadoEn: new Date().toISOString() }
    const idx = db.grupos.findIndex(g => g.id == req.params.id)
    if (idx >= 0) db.grupos[idx] = grupo
    else db.grupos.push(grupo)
    saveDb(db)
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/grupos/:id', (req, res) => {
  const db = loadDb()
  db.grupos = db.grupos.filter(g => g.id != req.params.id)
  saveDb(db)
  res.json({ ok: true })
})

// ── PREDICCIONES ──────────────────────────────────────────────────────────────
router.get('/predicciones', (req, res) => {
  const db = loadDb()
  res.json(db.predicciones)
})

router.put('/predicciones/:key', (req, res) => {
  try {
    const db = loadDb()
    const pred = req.body
    const idx = db.predicciones.findIndex(p => p.key === req.params.key)
    if (idx >= 0) db.predicciones[idx] = pred
    else db.predicciones.push(pred)
    saveDb(db)
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.post('/predicciones/bulk', (req, res) => {
  try {
    const db = loadDb()
    const preds = req.body
    preds.forEach(p => {
      const key = p.key ?? `${p.grupoId}_${p.usuarioId}_${p.partidoId}`
      const idx = db.predicciones.findIndex(x => x.key === key)
      if (idx >= 0) db.predicciones[idx] = { ...p, key }
      else db.predicciones.push({ ...p, key })
    })
    saveDb(db)
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// ── COMENTARIOS ───────────────────────────────────────────────────────────────
router.get('/comentarios/:grupoId/:partidoId', (req, res) => {
  const db  = loadDb()
  const key = `${req.params.grupoId}_${req.params.partidoId}`
  res.json(db.comentarios[key] ?? [])
})

router.put('/comentarios/:grupoId/:partidoId', (req, res) => {
  const db  = loadDb()
  const key = `${req.params.grupoId}_${req.params.partidoId}`
  db.comentarios[key] = req.body
  saveDb(db)
  res.json({ ok: true })
})

// ── SOLICITUDES ───────────────────────────────────────────────────────────────
router.get('/solicitudes', (req, res) => {
  const db = loadDb()
  res.json(db.solicitudes)
})

router.put('/solicitudes/:id', (req, res) => {
  const db = loadDb()
  const idx = db.solicitudes.findIndex(s => s.id == req.params.id)
  if (idx >= 0) db.solicitudes[idx] = req.body
  else db.solicitudes.push(req.body)
  saveDb(db)
  res.json({ ok: true })
})

// ── RANKING HISTORIAL ─────────────────────────────────────────────────────────
router.get('/ranking/:grupoId', (req, res) => {
  const db = loadDb()
  res.json(db.ranking[req.params.grupoId] ?? [])
})

router.post('/ranking/:grupoId', (req, res) => {
  const db = loadDb()
  if (!db.ranking[req.params.grupoId]) db.ranking[req.params.grupoId] = []
  db.ranking[req.params.grupoId].push(req.body)
  saveDb(db)
  res.json({ ok: true })
})

export default router