import { Router } from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router    = Router()

const DATA_FILE = join(__dirname, 'polla-data.json')

function leerDatos() {
    if (!existsSync(DATA_FILE)) return {}
    try { return JSON.parse(readFileSync(DATA_FILE, 'utf8')) } catch { return {} }
}

function guardarDatos(datos) {
    writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2), 'utf8')
}

function getColeccion(nombre) {
    return leerDatos()[nombre] ?? []
}

function setColeccion(nombre, valor) {
    const datos = leerDatos()
    datos[nombre] = valor
    guardarDatos(datos)
}

router.get('/usuarios/todos', (req, res) => {
    res.json(getColeccion('usuarios'))
})

router.post('/usuarios', (req, res) => {
    const usuarios = getColeccion('usuarios')
    const nuevo    = req.body
    const idx      = usuarios.findIndex((u) => String(u.id) === String(nuevo.id))
    if (idx >= 0) usuarios[idx] = nuevo
    else          usuarios.push(nuevo)
    setColeccion('usuarios', usuarios)
    res.json(nuevo)
})

router.post('/usuarios/login', (req, res) => {
    const { email, password } = req.body
    const usuarios = getColeccion('usuarios')
    const usuario  = usuarios.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!usuario) return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    const { password: _pwd, ...usuarioSeguro } = usuario
    res.json({ usuario: usuarioSeguro })
})

router.get('/grupos', (req, res) => {
    res.json(getColeccion('grupos'))
})

router.put('/grupos/:id', (req, res) => {
    const grupos = getColeccion('grupos')
    const grupo  = { ...req.body, miembros: req.body.miembros ?? [] }
    const idx    = grupos.findIndex((g) => String(g.id) === String(req.params.id))
    if (idx >= 0) grupos[idx] = grupo
    else          grupos.push(grupo)
    setColeccion('grupos', grupos)
    res.json(grupo)
})

router.delete('/grupos/:id', (req, res) => {
    const grupos = getColeccion('grupos').filter((g) => String(g.id) !== String(req.params.id))
    setColeccion('grupos', grupos)
    res.json({ ok: true })
})

router.get('/predicciones', (req, res) => {
    res.json(getColeccion('predicciones'))
})

router.put('/predicciones/:key', (req, res) => {
    const preds = getColeccion('predicciones')
    const pred  = req.body
    const idx   = preds.findIndex((p) => p.key === req.params.key)
    if (idx >= 0) preds[idx] = pred
    else          preds.push(pred)
    setColeccion('predicciones', preds)
    res.json(pred)
})

router.post('/predicciones/bulk', (req, res) => {
    const actualizadas = req.body   // array de predicciones
    const preds        = getColeccion('predicciones')
    actualizadas.forEach((p) => {
        const idx = preds.findIndex((x) => x.key === p.key)
        if (idx >= 0) preds[idx] = p
        else          preds.push(p)
    })
    setColeccion('predicciones', preds)
    res.json({ ok: true })
})

router.get('/comentarios/:grupoId/:partidoId', (req, res) => {
    const key  = `${req.params.grupoId}_${req.params.partidoId}`
    const mapa = leerDatos().comentarios ?? {}
    res.json(mapa[key] ?? [])
})

router.put('/comentarios/:grupoId/:partidoId', (req, res) => {
    const key   = `${req.params.grupoId}_${req.params.partidoId}`
    const datos = leerDatos()
    if (!datos.comentarios) datos.comentarios = {}
    datos.comentarios[key] = req.body
    guardarDatos(datos)
    res.json({ ok: true })
})

router.get('/solicitudes', (req, res) => {
    res.json(getColeccion('solicitudes'))
})

router.put('/solicitudes/:id', (req, res) => {
    const solicitudes = getColeccion('solicitudes')
    const sol         = req.body
    const idx         = solicitudes.findIndex((s) => String(s.id) === String(req.params.id))
    if (idx >= 0) solicitudes[idx] = sol
    else          solicitudes.push(sol)
    setColeccion('solicitudes', solicitudes)
    res.json(sol)
})

router.get('/ranking/:grupoId', (req, res) => {
    const datos = leerDatos().rankingHistorial ?? {}
    res.json(datos[req.params.grupoId] ?? [])
})

router.post('/ranking/:grupoId', (req, res) => {
    const datos = leerDatos()
    if (!datos.rankingHistorial) datos.rankingHistorial = {}
    if (!datos.rankingHistorial[req.params.grupoId]) datos.rankingHistorial[req.params.grupoId] = []
    datos.rankingHistorial[req.params.grupoId].push(req.body)
    guardarDatos(datos)
    res.json({ ok: true })
})

export default router