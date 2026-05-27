// ── ROUTER EXPRESS – endpoints /db/* ──────────────────────────────────────────
import { Router } from 'express'

const router = Router()

// ── PERSISTENCIA EN JSONBIN.IO ─────────────────────────────────────────────────
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`
const HEADERS = {
    'Content-Type': 'application/json',
    'X-Master-Key': process.env.JSONBIN_API_KEY,
    'X-Bin-Versioning': 'false',   // siempre sobreescribe, no acumula versiones
}

async function leerDatos() {
    const res = await fetch(`${JSONBIN_URL}/latest`, { headers: HEADERS })
    if (!res.ok) throw new Error(`JSONBin read error: ${res.status}`)
    const json = await res.json()
    return json.record ?? {}
}

async function guardarDatos(datos) {
    const res = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(datos),
    })
    if (!res.ok) throw new Error(`JSONBin write error: ${res.status}`)
}

async function getColeccion(nombre) {
    const datos = await leerDatos()
    return datos[nombre] ?? []
}

async function setColeccion(nombre, valor) {
    const datos = await leerDatos()
    datos[nombre] = valor
    await guardarDatos(datos)
}

// ── helper para manejo de errores ─────────────────────────────────────────────
function catchErr(res, e) {
    console.error(e)
    res.status(500).json({ error: e.message })
}

// ══════════════════════════════════════════════════════════════════════════════
//  USUARIOS
// ══════════════════════════════════════════════════════════════════════════════
router.get('/usuarios/todos', async (req, res) => {
    try {
        const usuarios = await getColeccion('usuarios')
        res.json(usuarios.map(({ password, ...u }) => u))
    } catch (e) { catchErr(res, e) }
})

router.post('/usuarios', async (req, res) => {
    try {
        const usuarios = await getColeccion('usuarios')
        const nuevo = req.body
        if (usuarios.find((u) => u.email === nuevo.email))
            return res.status(409).json({ error: 'El correo ya está registrado' })
        usuarios.push(nuevo)
        await setColeccion('usuarios', usuarios)
        const { password, ...sinPass } = nuevo
        res.status(201).json(sinPass)
    } catch (e) { catchErr(res, e) }
})

router.post('/usuarios/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const usuarios = await getColeccion('usuarios')
        const usuario = usuarios.find(
            (u) => u.email === email && u.password === password
        )
        if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' })
        const { password: _, ...sinPass } = usuario
        res.json({ usuario: sinPass })
    } catch (e) { catchErr(res, e) }
})

// ══════════════════════════════════════════════════════════════════════════════
//  GRUPOS
// ══════════════════════════════════════════════════════════════════════════════
router.get('/grupos', async (req, res) => {
    try {
        res.json(await getColeccion('grupos'))
    } catch (e) { catchErr(res, e) }
})

router.put('/grupos/:id', async (req, res) => {
    try {
        const grupos = await getColeccion('grupos')
        const idx = grupos.findIndex((g) => String(g.id) === req.params.id)
        if (idx === -1) grupos.push(req.body)
        else grupos[idx] = req.body
        await setColeccion('grupos', grupos)
        res.json(req.body)
    } catch (e) { catchErr(res, e) }
})

router.delete('/grupos/:id', async (req, res) => {
    try {
        const grupos = await getColeccion('grupos')
        await setColeccion('grupos', grupos.filter((g) => String(g.id) !== req.params.id))
        res.json({ ok: true })
    } catch (e) { catchErr(res, e) }
})

// ══════════════════════════════════════════════════════════════════════════════
//  PREDICCIONES GLOBALES
// ══════════════════════════════════════════════════════════════════════════════
router.get('/predicciones', async (req, res) => {
    try {
        res.json(await getColeccion('predicciones'))
    } catch (e) { catchErr(res, e) }
})

router.put('/predicciones/:key', async (req, res) => {
    try {
        const preds = await getColeccion('predicciones')
        const idx = preds.findIndex((p) => p._key === req.params.key)
        const item = { ...req.body, _key: req.params.key }
        if (idx === -1) preds.push(item)
        else preds[idx] = item
        await setColeccion('predicciones', preds)
        res.json(item)
    } catch (e) { catchErr(res, e) }
})

router.post('/predicciones/bulk', async (req, res) => {
    try {
        await setColeccion('predicciones', req.body)
        res.json({ ok: true })
    } catch (e) { catchErr(res, e) }
})

// ══════════════════════════════════════════════════════════════════════════════
//  PREDICCIONES PERSONALES
// ══════════════════════════════════════════════════════════════════════════════
router.get('/predicciones-personales', async (req, res) => {
    try {
        res.json(await getColeccion('predicciones-personales'))
    } catch (e) { catchErr(res, e) }
})

router.put('/predicciones-personales/:key', async (req, res) => {
    try {
        const preds = await getColeccion('predicciones-personales')
        const idx = preds.findIndex((p) => p._key === req.params.key)
        const item = { ...req.body, _key: req.params.key }
        if (idx === -1) preds.push(item)
        else preds[idx] = item
        await setColeccion('predicciones-personales', preds)
        res.json(item)
    } catch (e) { catchErr(res, e) }
})

// ══════════════════════════════════════════════════════════════════════════════
//  COMENTARIOS
// ══════════════════════════════════════════════════════════════════════════════
router.get('/comentarios/:grupoId/:partidoId', async (req, res) => {
    try {
        const datos = await leerDatos()
        const comentarios = datos.comentarios ?? {}
        const key = `${req.params.grupoId}_${req.params.partidoId}`
        res.json(comentarios[key] ?? [])
    } catch (e) { catchErr(res, e) }
})

router.put('/comentarios/:grupoId/:partidoId', async (req, res) => {
    try {
        const datos = await leerDatos()
        if (!datos.comentarios) datos.comentarios = {}
        const key = `${req.params.grupoId}_${req.params.partidoId}`
        datos.comentarios[key] = req.body
        await guardarDatos(datos)
        res.json(req.body)
    } catch (e) { catchErr(res, e) }
})

// ══════════════════════════════════════════════════════════════════════════════
//  SOLICITUDES
// ══════════════════════════════════════════════════════════════════════════════
router.get('/solicitudes', async (req, res) => {
    try {
        res.json(await getColeccion('solicitudes'))
    } catch (e) { catchErr(res, e) }
})

router.put('/solicitudes/:id', async (req, res) => {
    try {
        const solicitudes = await getColeccion('solicitudes')
        const idx = solicitudes.findIndex((s) => String(s.id) === req.params.id)
        if (idx === -1) solicitudes.push(req.body)
        else solicitudes[idx] = req.body
        await setColeccion('solicitudes', solicitudes)
        res.json(req.body)
    } catch (e) { catchErr(res, e) }
})

// ══════════════════════════════════════════════════════════════════════════════
//  RANKING
// ══════════════════════════════════════════════════════════════════════════════
router.get('/ranking/:grupoId', async (req, res) => {
    try {
        const datos = await leerDatos()
        const ranking = datos.ranking ?? {}
        res.json(ranking[req.params.grupoId] ?? [])
    } catch (e) { catchErr(res, e) }
})

router.post('/ranking/:grupoId', async (req, res) => {
    try {
        const datos = await leerDatos()
        if (!datos.ranking) datos.ranking = {}
        datos.ranking[req.params.grupoId] = req.body
        await guardarDatos(datos)
        res.json(req.body)
    } catch (e) { catchErr(res, e) }
})

export default router