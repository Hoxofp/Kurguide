import { Worker } from 'bullmq'
import { redisConnection, type GenerationJobData, type GenerationJobResult } from './queue.js'
import { generateArchitecture } from './llm.js'

/**
 * AI Worker — processes jobs from the ai-generation queue.
 *
 * WHY A SEPARATE WORKER?
 * The Express server handles HTTP requests (fast, non-blocking).
 * The Worker handles LLM calls (slow, CPU-bound parsing).
 * They share the same Redis connection but run in the same process
 * for simplicity. In production, workers can be scaled independently.
 *
 * FLOW:
 *   Queue drops job → Worker picks it up → calls generateArchitecture()
 *   → stores result in the job → frontend polls GET /jobs/:id → gets result
 */

export function startWorker() {
    const worker = new Worker<GenerationJobData, GenerationJobResult>(
        'ai-generation',
        async (job) => {
            console.log(`🤖 Processing job ${job.id}: "${job.data.prompt}"`)

            const result = await generateArchitecture(job.data.prompt)

            console.log(`✅ Job ${job.id} completed: ${result.nodes.length} nodes, ${result.edges.length} edges`)
            return result
        },
        {
            connection: redisConnection,
            concurrency: 3, // Process up to 3 LLM calls at once
        }
    )

    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed:`, err.message)
    })

    worker.on('ready', () => {
        console.log('🤖 AI Worker ready and listening for jobs')
    })

    return worker
}
