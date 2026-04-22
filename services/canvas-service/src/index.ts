import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import graphRoutes from './routes/graphs.js'

/**
 * Canvas Service — Entry Point
 *
 * Connects to MongoDB and exposes graph CRUD endpoints on port 4001.
 * The API Gateway at port 4000 will proxy /api/canvas/* → here.
 */

const app = express()
const PORT = process.env.PORT || 4001
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example_password@localhost:27017/kurguide?authSource=admin'

// Middleware
app.use(cors())
app.use(express.json({ limit: '5mb' })) // graphs can be large JSON

// Routes
app.use('/graphs', graphRoutes)

// Health check
app.get('/health', (_req, res) => {
    res.json({ service: 'canvas-service', status: 'ok', time: new Date().toISOString() })
})

// Connect to MongoDB & start server
async function start() {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('✅ Canvas Service connected to MongoDB')
        app.listen(PORT, () => {
            console.log(`🎨 Canvas Service running on http://localhost:${PORT}`)
        })
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err)
        process.exit(1)
    }
}

start()
