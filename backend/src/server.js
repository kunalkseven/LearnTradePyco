import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB, isMongoConnected } from './config/db.js'
import authRoutes from './routes/auth.js'
import tradeRoutes from './routes/trades.js'
import aiRoutes from './routes/ai.js'
import uploadRoutes from './routes/upload.js'
import { checkMongoConnection } from './middleware/dbCheck.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

// Connect to MongoDB Atlas (async, non-blocking)
connectDB().catch(err => {
  console.error('Initial MongoDB connection failed:', err.message)
  console.log('Server will continue running. Database operations will fail until connection is established.')
})

// CORS Configuration - Allow localhost during development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true)

    // Allow localhost on any port during development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true)
    }

    // Allow configured CLIENT_URL
    if (origin === clientUrl) {
      return callback(null, true)
    }

    // Allow Vercel deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }

    console.warn(`⚠️  CORS blocked origin: ${origin}`)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authorization'],
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

console.log(`🔧 CORS configured - Allowing: localhost, ${clientUrl}`)

// Health check (no DB required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'running',
    mongodb: isMongoConnected() ? 'connected' : 'disconnected'
  })
})

// Routes (with DB connection check)
app.use('/api/auth', checkMongoConnection, authRoutes)
app.use('/api/trades', checkMongoConnection, tradeRoutes)
app.use('/api/ai', checkMongoConnection, aiRoutes)
app.use('/api/upload', checkMongoConnection, uploadRoutes)

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(port, () => {
  console.log(`✅ API server listening on port ${port}`)
})


