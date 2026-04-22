import { Router } from 'express'
import { aiQueue } from '../queue.js'

/**
 * AI Routes — two endpoints for the text-to-node flow.
 *
 *   POST /generate   → Submit a prompt, get a jobId back instantly
 *   GET  /jobs/:id   → Check the status/result of a generation job
 *
 * WHY TWO ENDPOINTS?
 * LLM calls are async. The first endpoint queues the work and returns
 * immediately (no HTTP timeout risk). The second lets the frontend
 * poll for results. Later we'll switch to WebSockets for real-time push.
 */

const router = Router()

// Submit a new AI generation request
router.post('/generate', async (req, res) => {
    try {
        const { prompt, graphId } = req.body

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'prompt is required' })
        }

        const job = await aiQueue.add('text-to-node', {
            prompt,
            graphId: graphId || 'default',
        })

        res.status(202).json({
            jobId: job.id,
            status: 'queued',
            message: 'Generation job queued successfully',
        })
    } catch (err) {
        res.status(500).json({ error: 'Failed to queue generation job' })
    }
})

// Check the status of a generation job
router.get('/jobs/:id', async (req, res) => {
    try {
        const job = await aiQueue.getJob(req.params.id)

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        const state = await job.getState()

        if (state === 'completed') {
            res.json({
                jobId: job.id,
                status: 'completed',
                result: job.returnvalue,
            })
        } else if (state === 'failed') {
            res.json({
                jobId: job.id,
                status: 'failed',
                error: job.failedReason,
            })
        } else {
            res.json({
                jobId: job.id,
                status: state, // 'waiting', 'active', 'delayed'
            })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to get job status' })
    }
})

export default router
