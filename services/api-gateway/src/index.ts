import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'

/**
 * API Gateway — The single entry point for ALL frontend requests.
 *
 * WHY A GATEWAY?
 * Without it, the frontend would need to know the URL of every microservice.
 * The gateway provides:
 *   1. A single URL (localhost:4000) for the frontend to talk to
 *   2. Route-based proxying to the correct microservice
 *   3. A central place for CORS, rate limiting, and auth middleware (later)
 *
 * ROUTE MAP:
 *   /api/canvas/*  → Canvas Service   (port 4001)
 *   /api/ai/*      → AI Engine Service (port 4002) — Phase 3
 *   /api/export/*  → Export Service    (port 4003) — Phase 5
 */

const app = express()
const PORT = process.env.PORT || 4000

// Global middleware
app.use(cors())
app.use(express.json())

// ── Proxy: Canvas Service ─────────────────────────────
app.use(
    '/api/canvas',
    createProxyMiddleware({
        target: 'http://localhost:4001',
        changeOrigin: true,
        pathRewrite: { '^/api/canvas': '' },
    })
)

// ── Proxy: AI Engine Service ──────────────────────────
app.use(
    '/api/ai',
    createProxyMiddleware({
        target: 'http://localhost:4002',
        changeOrigin: true,
        pathRewrite: { '^/api/ai': '' },
    })
)

// ── Proxy: Export Service (Phase 5) ───────────────────
// app.use(
//   '/api/export',
//   createProxyMiddleware({
//     target: 'http://localhost:4003',
//     changeOrigin: true,
//     pathRewrite: { '^/api/export': '' },
//   })
// )

// Health check
app.get('/health', (_req, res) => {
    res.json({ service: 'api-gateway', status: 'ok', time: new Date().toISOString() })
})

app.listen(PORT, () => {
    console.log(`🚪 API Gateway running on http://localhost:${PORT}`)
    console.log(`   └─ /api/canvas/* → Canvas Service (4001)`)
    console.log(`   └─ /api/ai/*     → AI Engine      (4002)`)
})
