import express    from 'express'
import cors       from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import apiRouter  from './api.js'
console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'OK' : 'UNDEFINED')

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT      = process.env.PORT ?? 3000
const FOOTBALL_API_KEY = '67655057f3934e9f8674d35dec465040'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/db', apiRouter)

import https from 'https'

app.use('/api', (req, res) => {
  const options = {
    hostname: 'api.football-data.org',
    path: '/v4' + req.url,
    method: 'GET',
    headers: { 'X-Auth-Token': FOOTBALL_API_KEY, 'Accept': 'application/json' },
  }
  const proxy = https.request(options, (r) => {
    res.set('Content-Type', 'application/json')
    r.pipe(res)
  })
  proxy.on('error', (e) => res.status(502).json({ error: e.message }))
  proxy.end()
})

app.use(express.static(join(__dirname, 'dist')))
app.get('*splat', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`✅ Polla Mundial corriendo en http://localhost:${PORT}`)
})