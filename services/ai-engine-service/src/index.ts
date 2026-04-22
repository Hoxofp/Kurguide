import express from 'express'
import cors from 'cors'
import aiRoutes from './routes/ai.js'
import { startWorker } from './worker.js'

/**
 * AI Engine Service — Entry Point
 *
 * This service does TWO things in a single process:
 *   1. Express server (port 4002) — handles HTTP requests
 *   2. BullMQ Worker — processes AI generation jobs from Redis
 *
 * In production, these could be split into separate processes
 * for independent scaling. For development, keeping them together
 * is simpler.
 */

const app = express()
const PORT = process.env.PORT || 4002

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/', aiRoutes)

// Health check
app.get('/health', (_req, res) => {
    res.json({ service: 'ai-engine-service', status: 'ok', time: new Date().toISOString() })
})

// Start worker + server
startWorker()

app.listen(PORT, () => {
    console.log(`🧠 AI Engine Service running on http://localhost:${PORT}`)
    console.log(`   └─ POST /generate — Submit a prompt`)
    console.log(`   └─ GET  /jobs/:id — Check job status`)
})
