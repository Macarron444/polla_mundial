import express   from 'express'
import cors      from 'cors'
import apiRouter from './api.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/db', apiRouter)
app.listen(3001, () => console.log('🗄️  Backend SQLite en http://localhost:3001'))