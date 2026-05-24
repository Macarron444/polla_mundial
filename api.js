// ── BACKEND API — reemplaza IndexedDB con SQLite compartido ───────────────────
import express from 'express'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createServer } from 'https'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH   = process.env.DB_PATH ?? join(__dirname, 'polla.db')
const db        = new Database(DB_PATH)

// ── PRAGMA performance ────────────────────────────────────────────────────────
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── CREAR TABLAS ──────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id          INTEGER PRIMARY KEY,
    nombre      TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    rol         TEXT    NOT NULL DEFAULT 'PARTICIPANTE',
    fechaRegistro TEXT,
    actualizadoEn TEXT
  );

  CREATE TABLE IF NOT EXISTS grupos (
    id          INTEGER PRIMARY KEY,
    data        TEXT    NOT NULL,
    actualizadoEn TEXT
  );

  CREATE TABLE IF NOT EXISTS predicciones_grupo (
    key_        TEXT    PRIMARY KEY,
    data        TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comentarios (
    key_        TEXT    PRIMARY KEY,
    data        TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS solicitudes (
    id          INTEGER PRIMARY KEY,
    data        TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ranking_historial (
    grupoId     INTEGER PRIMARY KEY,
    snapshots   TEXT    NOT NULL DEFAULT '[]'
  );
`)

export const router = express.Router()

// ── USUARIOS ──────────────────────────────────────────────────────────────────
router.get('/usuarios', (req, res) => {
  const rows = db.prepare('SELECT id,nombre,email,rol,fechaRegistro FROM usuarios').all()
  res.json(rows)
})

router.post('/usuarios', (req, res) => {
  try {
    const { id, nombre, email, password, rol, fechaRegistro } = req.body
    const stmt = db.prepare(`
      INSERT INTO usuarios (id,nombre,email,password,rol,fechaRegistro,actualizadoEn)
      VALUES (@id,@nombre,@email,@password,@rol,@fechaRegistro,@actualizadoEn)
      ON CONFLICT(email) DO UPDATE SET
        nombre=excluded.nombre, rol=excluded.rol, actualizadoEn=excluded.actualizadoEn
    `)
    stmt.run({ id, nombre, email, password, rol: rol ?? 'PARTICIPANTE',
               fechaRegistro: fechaRegistro ?? new Date().toISOString(),
               actualizadoEn: new Date().toISOString() })
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.post('/usuarios/login', (req, res) => {
  const { email, password } = req.body
  const u = db.prepare('SELECT * FROM usuarios WHERE email=? COLLATE NOCASE').get(email)
  if (!u || u.password !== password)
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
  const { password: _p, ...safe } = u
  res.json({ usuario: safe })
})

router.get('/usuarios/todos', (req, res) => {
  const rows = db.prepare('SELECT id,nombre,email,rol,fechaRegistro FROM usuarios').all()
  res.json(rows)
})

// ── GRUPOS ────────────────────────────────────────────────────────────────────
router.get('/grupos', (req, res) => {
  const rows = db.prepare('SELECT data FROM grupos').all()
  res.json(rows.map(r => JSON.parse(r.data)))
})

router.put('/grupos/:id', (req, res) => {
  try {
    const grupo = req.body
    db.prepare(`
      INSERT INTO grupos (id, data, actualizadoEn)
      VALUES (@id, @data, @ts)
      ON CONFLICT(id) DO UPDATE SET data=excluded.data, actualizadoEn=excluded.actualizadoEn
    `).run({ id: grupo.id, data: JSON.stringify(grupo), ts: new Date().toISOString() })
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/grupos/:id', (req, res) => {
  db.prepare('DELETE FROM grupos WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

// ── PREDICCIONES GRUPO ────────────────────────────────────────────────────────
router.get('/predicciones', (req, res) => {
  const rows = db.prepare('SELECT data FROM predicciones_grupo').all()
  res.json(rows.map(r => JSON.parse(r.data)))
})

router.put('/predicciones/:key', (req, res) => {
  try {
    const pred = req.body
    db.prepare(`
      INSERT INTO predicciones_grupo (key_, data) VALUES (@k, @d)
      ON CONFLICT(key_) DO UPDATE SET data=excluded.data
    `).run({ k: req.params.key, d: JSON.stringify(pred) })
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.post('/predicciones/bulk', (req, res) => {
  try {
    const preds = req.body
    const stmt = db.prepare(`
      INSERT INTO predicciones_grupo (key_, data) VALUES (@k, @d)
      ON CONFLICT(key_) DO UPDATE SET data=excluded.data
    `)
    const many = db.transaction((arr) => arr.forEach(p =>
      stmt.run({ k: p.key ?? `${p.grupoId}_${p.usuarioId}_${p.partidoId}`, d: JSON.stringify(p) })
    ))
    many(preds)
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// ── COMENTARIOS ───────────────────────────────────────────────────────────────
router.get('/comentarios/:grupoId/:partidoId', (req, res) => {
  const key  = `${req.params.grupoId}_${req.params.partidoId}`
  const row  = db.prepare('SELECT data FROM comentarios WHERE key_=?').get(key)
  res.json(row ? JSON.parse(row.data) : [])
})

router.put('/comentarios/:grupoId/:partidoId', (req, res) => {
  const key = `${req.params.grupoId}_${req.params.partidoId}`
  db.prepare(`
    INSERT INTO comentarios (key_, data) VALUES (@k, @d)
    ON CONFLICT(key_) DO UPDATE SET data=excluded.data
  `).run({ k: key, d: JSON.stringify(req.body) })
  res.json({ ok: true })
})

// ── SOLICITUDES ───────────────────────────────────────────────────────────────
router.get('/solicitudes', (req, res) => {
  const rows = db.prepare('SELECT data FROM solicitudes').all()
  res.json(rows.map(r => JSON.parse(r.data)))
})

router.put('/solicitudes/:id', (req, res) => {
  try {
    const s = req.body
    db.prepare(`
      INSERT INTO solicitudes (id, data) VALUES (@id, @d)
      ON CONFLICT(id) DO UPDATE SET data=excluded.data
    `).run({ id: s.id, d: JSON.stringify(s) })
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// ── RANKING HISTORIAL ─────────────────────────────────────────────────────────
router.get('/ranking/:grupoId', (req, res) => {
  const row = db.prepare('SELECT snapshots FROM ranking_historial WHERE grupoId=?').get(req.params.grupoId)
  res.json(row ? JSON.parse(row.snapshots) : [])
})

router.post('/ranking/:grupoId', (req, res) => {
  const grupoId = req.params.grupoId
  const row     = db.prepare('SELECT snapshots FROM ranking_historial WHERE grupoId=?').get(grupoId)
  const snaps   = row ? JSON.parse(row.snapshots) : []
  snaps.push(req.body)
  db.prepare(`
    INSERT INTO ranking_historial (grupoId, snapshots) VALUES (@g, @s)
    ON CONFLICT(grupoId) DO UPDATE SET snapshots=excluded.snapshots
  `).run({ g: grupoId, s: JSON.stringify(snaps) })
  res.json({ ok: true })
})

export default router