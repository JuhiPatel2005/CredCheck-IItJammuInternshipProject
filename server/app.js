import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import certificateRoutes from './routes/certificateRoutes.js'
import verifierRoutes from './routes/verifierRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import reportRoutes from './routes/reportRoutes.js'

const app = express()

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5173',
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/verifier', verifierRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/reports', reportRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'CredCheck API is running' })
})

export default app
