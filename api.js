import express from 'express'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_DIR = join(__dirname, 'data')
const DB_PATH = join(DB_DIR, 'db.json')

const initialDb = {
  usuarios: [],
  grupos: [],
  solicitudes: [],
  predicciones: [],
  ranking: {},
  comentarios: {},
}

function loadDb() {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2))
    return structuredClone(initialDb)
  }

  try {
    return { ...structuredClone(initialDb), ...JSON.parse(readFileSync(DB_PATH, 'utf8')) }
  } catch {
    return structuredClone(initialDb)
  }
}

function saveDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function upsert(items, id, value) {
  const itemId = String(id)
  const index = items.findIndex((item) => String(item.id ?? item.key) === itemId)
  if (index >= 0) items[index] = value
  else items.push(value)
  return value
}

const router = express.Router()

router.get('/:collection', (req, res) => {
  const db = loadDb()
  res.json(db[req.params.collection] ?? [])
})

router.get('/comentarios/:grupoId/:partidoId', (req, res) => {
  const db = loadDb()
  const key = `${req.params.grupoId}_${req.params.partidoId}`
  res.json(db.comentarios[key] ?? [])
})

router.get('/ranking/:grupoId', (req, res) => {
  const db = loadDb()
  res.json(db.ranking[req.params.grupoId] ?? [])
})

router.put('/:collection/:id', (req, res) => {
  const db = loadDb()
  if (!Array.isArray(db[req.params.collection])) db[req.params.collection] = []
  const item = upsert(db[req.params.collection], req.params.id, req.body)
  saveDb(db)
  res.json(item)
})

router.put('/comentarios/:grupoId/:partidoId', (req, res) => {
  const db = loadDb()
  const key = `${req.params.grupoId}_${req.params.partidoId}`
  db.comentarios[key] = req.body
  saveDb(db)
  res.json(db.comentarios[key])
})

router.post('/predicciones/bulk', (req, res) => {
  const db = loadDb()
  req.body.forEach((prediccion) => upsert(db.predicciones, prediccion.key ?? prediccion.id, prediccion))
  saveDb(db)
  res.json(db.predicciones)
})

router.post('/ranking/:grupoId', (req, res) => {
  const db = loadDb()
  db.ranking[req.params.grupoId] = [...(db.ranking[req.params.grupoId] ?? []), req.body]
  saveDb(db)
  res.json(db.ranking[req.params.grupoId])
})

router.post('/:collection', (req, res) => {
  const db = loadDb()
  if (!Array.isArray(db[req.params.collection])) db[req.params.collection] = []
  db[req.params.collection].push(req.body)
  saveDb(db)
  res.json(req.body)
})

router.delete('/:collection/:id', (req, res) => {
  const db = loadDb()
  if (Array.isArray(db[req.params.collection])) {
    db[req.params.collection] = db[req.params.collection].filter(
      (item) => String(item.id ?? item.key) !== String(req.params.id)
    )
    saveDb(db)
  }
  res.json({ ok: true })
})

export default router
