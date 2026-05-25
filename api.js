import express from 'express'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_DIR = join(__dirname, 'data')
const DB_PATH = join(DB_DIR, 'db.json')

// ── Base de datos en memoria (persiste mientras el proceso viva) ──────────────
let db = { usuarios: [], grupos: [], solicitudes: [], predicciones: [], ranking: {}, comentarios: {} }

// Intenta cargar del disco al arrancar
try {
    if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })
    if (existsSync(DB_PATH)) db = { ...db, ...JSON.parse(readFileSync(DB_PATH, 'utf8')) }
    console.log('✅ DB cargada del disco')
} catch (e) { console.warn('⚠️ No se pudo cargar DB del disco:', e.message) }

// Intenta guardar al disco (no bloquea si falla)
function saveDb() {
    try { writeFileSync(DB_PATH, JSON.stringify(db, null, 2)) }
    catch (e) { console.warn('⚠️ No se pudo guardar DB al disco:', e.message) }
}

function upsert(items, id, value) {
    const idx = items.findIndex((i) => String(i.id ?? i.key) === String(id))
    if (idx >= 0) items[idx] = value
    else items.push(value)
    return value
}

const router = express.Router()

router.get('/comentarios/:grupoId/:partidoId', (req, res) => {
    const key = `${req.params.grupoId}_${req.params.partidoId}`
    res.json(db.comentarios[key] ?? [])
})

router.get('/ranking/:grupoId', (req, res) => {
    res.json(db.ranking[req.params.grupoId] ?? [])
})

router.get('/:collection', (req, res) => {
    res.json(db[req.params.collection] ?? [])
})

router.put('/comentarios/:grupoId/:partidoId', (req, res) => {
    const key = `${req.params.grupoId}_${req.params.partidoId}`
    db.comentarios[key] = req.body
    saveDb()
    res.json(req.body)
})

router.put('/:collection/:id', (req, res) => {
    if (!Array.isArray(db[req.params.collection])) db[req.params.collection] = []
    const item = upsert(db[req.params.collection], req.params.id, req.body)
    saveDb()
    res.json(item)
})

router.post('/predicciones/bulk', (req, res) => {
    req.body.forEach((p) => upsert(db.predicciones, p.key ?? p.id, p))
    saveDb()
    res.json(db.predicciones)
})

router.post('/ranking/:grupoId', (req, res) => {
    db.ranking[req.params.grupoId] = [...(db.ranking[req.params.grupoId] ?? []), req.body]
    saveDb()
    res.json(db.ranking[req.params.grupoId])
})

router.post('/:collection', (req, res) => {
    if (!Array.isArray(db[req.params.collection])) db[req.params.collection] = []
    db[req.params.collection].push(req.body)
    saveDb()
    res.json(req.body)
})

router.delete('/:collection/:id', (req, res) => {
    if (Array.isArray(db[req.params.collection])) {
        db[req.params.collection] = db[req.params.collection].filter(
            (i) => String(i.id ?? i.key) !== String(req.params.id)
        )
        saveDb()
    }
    res.json({ ok: true })
})

export default router