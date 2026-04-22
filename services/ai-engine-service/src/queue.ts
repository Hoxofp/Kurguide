import { Queue, Worker, type Job } from 'bullmq'
import IORedis from 'ioredis'

/**
 * Queue Setup — BullMQ backed by Redis.
 *
 * WHY A QUEUE?
 * LLM calls (Gemini/Groq) take 2–15 seconds. If we handled them in the
 * Express request handler directly, the HTTP connection would hang and
 * potentially timeout. Instead:
 *
 *   1. POST /generate → drops a job in the queue → returns { jobId } instantly
 *   2. A Worker picks up the job → calls the LLM → stores the result
 *   3. Frontend polls GET /jobs/:id → gets the result when ready
 *
 * This also means we can process multiple LLM calls concurrently by
 * scaling the number of workers later.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Shared Redis connection for both Queue and Worker
export const redisConnection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
})

// The queue where AI generation jobs are placed
export const aiQueue = new Queue('ai-generation', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 100 },  // Keep last 100 completed jobs
        removeOnFail: { count: 50 },
    },
})

export type GenerationJobData = {
    prompt: string
    graphId: string
}

export type GenerationJobResult = {
    nodes: Array<{
        id: string
        type: string
        label: string
        position: { x: number; y: number }
        data: { label: string; description: string }
    }>
    edges: Array<{
        id: string
        source: string
        target: string
    }>
}
