import { GoogleGenAI } from '@google/genai'
import type { Alternative } from '../store/canvasStore'
import { getLayoutedElements } from './layout'

export interface AIQuestion {
    id: string
    question: string
    options: { label: string; value: string }[]
}

/**
 * Client-Side Gemini Service
 * 
 * Calls Gemini API directly from the browser using the VITE_GEMINI_API_KEY.
 * The AI determines ALL node content: labels, descriptions, technologies,
 * ports, environment variables, and inter-service connections.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const SYSTEM_PROMPT = `You are an elite Software Architecture AI. Your task is to design 3 highly detailed, production-ready architectural alternatives based on user constraints.

# CORE DIRECTIVES
1. **Diversity**: The 3 alternatives MUST represent fundamentally different architectural patterns (e.g., Modular Monolith, Event-Driven Microservices, CQRS, Serverless).
2. **Realism**: Use real-world technologies, ports, and configuration environments. Do not use generic placeholders.
3. **Architecture Logic**: Ensure EVERY node is connected. Do not leave any nodes floating. Frontends/Clients MUST connect to a Gateway or Service. Services MUST connect to their respective Databases or Caches (e.g., Redis). Create a clear, continuous path from the Client down to the lowest database/cache. If a user explicitly asks to connect a Client directly to a Cache/Redis, you may do so.
4. **Edge Routing**: Edges must logically connect components (Client -> Gateway -> Service -> DB/Cache). You MUST set the edge type to "smoothstep".

# OUTPUT SCHEMA
You must respond with ONLY a valid JSON array containing exactly 3 objects. Do not use markdown wrappers (\`\`\`json).

[
  {
    "id": "alt-1",
    "name": "Event-Driven Microservices",
    "description": "A highly scalable approach using async message passing...",
    "_reasoning": "I chose this because... My layout logic places the Gateway at top, 3 microservices in the middle spaced by 250px, and their respective DBs at the bottom.",
    "nodes": [
      {
        "id": "gw-1",
        "type": "gateway", // Options: client, gateway, service, database, cache, queue, worker, frontend, loadbalancer, storage, api
        "position": { "x": 0, "y": 0 }, // ALWAYS use 0,0. The layout engine will auto-calculate coordinates.
        "data": {
          "label": "API Gateway (Kong)",
          "description": "Handles routing and rate limiting.",
          "isGhost": true,
          "technologyId": "kong", // Must match catalog exactly
          "port": "8000",
          "envVars": "KONG_DB=postgres\\nKONG_PG_PASSWORD=secret",
          "notes": "Deployed in a highly available cluster."
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "gw-1",
        "target": "svc-1",
        "animated": true,
        "className": "ghost"
      }
    ],
    "tradeoffs": {
      "speed": 3, "cost": 4, "scalability": 5, "complexity": 5, "simplicity": 2
    }
  }
]

# TECHNOLOGY CATALOG
For "technologyId", ONLY use exactly these values: react, vue, angular, nextjs, react-native, ios, android, web, nginx, kong, traefik, express, fastify, nestjs, spring-boot, django, go-fiber, mongodb, postgresql, mysql, supabase, dynamodb, redis, memcached, valkey, rabbitmq, kafka.`

const QUESTIONS_SYSTEM_PROMPT = `You are an elite Software Architecture AI. The user will provide a brief prompt describing an application they want to build.
Your job is to generate EXACTLY 3 clarifying questions to determine their exact tech stack preferences, data models, and architectural tradeoffs.

CRITICAL INSTRUCTIONS:
- The questions MUST be heavily focused on Tech Stack choices, Database preferences, and specific Frameworks (e.g., Node.js vs Go vs Spring, SQL vs NoSQL, REST vs GraphQL/gRPC).
- Example: Instead of asking about generic 'budget', ask "What is your preferred backend ecosystem?" or "What is your primary data storage strategy?".
- For each question, provide exactly 3 highly specific multiple-choice options that reference actual technologies.
- VERY IMPORTANT: Inside the "label" of each option, you MUST briefly explain the trade-off of that choice in parentheses so the user understands the impact.

Return ONLY a JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Which backend ecosystem does your team prefer?",
      "options": [
        { "label": "TypeScript/Node.js (Trade-off: Huge ecosystem, but lower raw compute speed)", "value": "ts_node" },
        { "label": "Go/Rust (Trade-off: Max performance, but harder to hire/learn)", "value": "go_rust" },
        { "label": "Java/Spring (Trade-off: Enterprise proven, but heavy memory footprint)", "value": "enterprise" }
      ]
    }
  ]
}`

// Models to try in order — each has separate rate limits
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'] as const

/**
 * Generate architecture alternatives using Gemini API.
 * - Retries on 429 rate limit errors with exponential backoff
 * - Falls back to different Gemini models with separate quotas
 * - Falls back to mock data ONLY if API key is completely missing
 */
export async function generateAlternatives(
    prompt: string,
    answers?: Record<string, string>,
    onStatus?: (msg: string) => void
): Promise<Alternative[]> {
    if (!API_KEY) {
        console.warn('[Kurguide] No VITE_GEMINI_API_KEY set. Add it to apps/web/.env')
        return generateMockAlternatives(prompt)
    }

    let finalPrompt = prompt
    if (answers && Object.keys(answers).length > 0) {
        const answersText = Object.entries(answers).map(([q, a]) => `- QUESTION: ${q}\n  ANSWER: ${a}`).join('\\n\\n')
        finalPrompt = `USER REQUEST:\n${prompt}\n\nCRITICAL CONSTRAINTS (You MUST tailor ALL 3 architectural alternatives and technology choices STRICTLY based on these user answers. If they chose Go, use Go-Fiber. If they chose SQL, use PostgreSQL, etc.):\n\n${answersText}`
    }

    const genai = new GoogleGenAI({ apiKey: API_KEY })

    for (const model of MODELS) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`[Kurguide] Trying ${model} (attempt ${attempt}/3)...`)
                onStatus?.(`✦ Trying ${model}...`)

                const response = await genai.models.generateContent({
                    model,
                    contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                    config: {
                        systemInstruction: SYSTEM_PROMPT,
                        responseMimeType: 'application/json',
                    },
                })

                const text = response.text ?? '[]'
                console.log(`[Kurguide] ${model} response length:`, text.length)

                const parsed = JSON.parse(text) as Alternative[]

                if (!Array.isArray(parsed) || parsed.length === 0) {
                    throw new Error('Gemini returned empty or invalid response')
                }

                console.log(`[Kurguide] ✅ ${model} returned ${parsed.length} alternatives:`,
                    parsed.map(a => `${a.name} (${a.nodes?.length || 0} nodes)`).join(', ')
                )

                // Layout nodes
                const layouted = parsed.map((alt) => {
                    const { nodes, edges } = getLayoutedElements(alt.nodes || [], alt.edges || [], 'TB')
                    return { ...alt, nodes, edges }
                })

                return layouted
            } catch (err: any) {
                const msg = err?.message || ''
                const is429 = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')
                const is404 = msg.includes('404') || msg.includes('NOT_FOUND')
                
                if (is404) {
                    console.warn(`[Kurguide] ${model} not available, trying next model...`)
                    break // Skip to next model
                }

                if (is429 && attempt < 3) {
                    const waitSec = attempt * 5
                    console.warn(`[Kurguide] ⏳ ${model} rate limited. Retrying in ${waitSec}s...`)
                    onStatus?.(`⏳ Rate limited, retrying in ${waitSec}s...`)
                    await sleep(waitSec * 1000)
                    continue
                }

                if (is429) {
                    console.warn(`[Kurguide] ${model} exhausted after ${attempt} attempts, trying next model...`)
                    break // Try next model
                }

                // Non-retryable error — throw immediately
                throw err
            }
        }
    }

    // All models exhausted — throw descriptive error
    throw new Error('All Gemini models rate limited. Please wait 1 minute and try again.')
}

/**
 * Generate 3 clarifying questions based on the user's initial prompt.
 */
export async function generateClarifyingQuestions(prompt: string): Promise<AIQuestion[]> {
    if (!API_KEY) {
        return generateMockQuestions()
    }

    const genai = new GoogleGenAI({ apiKey: API_KEY })

    for (const model of MODELS) {
        try {
            console.log(`[Kurguide] Generating questions with ${model}...`)
            const response = await genai.models.generateContent({
                model,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: QUESTIONS_SYSTEM_PROMPT,
                    responseMimeType: 'application/json',
                },
            })

            const text = response.text ?? '{"questions":[]}'
            const parsed = JSON.parse(text)
            
            if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
                throw new Error('Invalid questions response format')
            }

            return parsed.questions as AIQuestion[]
        } catch (err: any) {
            const msg = err?.message || ''
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('404') || msg.includes('NOT_FOUND')) {
                continue // Try next model
            }
            throw err
        }
    }
    
    throw new Error('Rate limited. Please wait a minute before generating questions.')
}

/** Simple sleep helper */
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock fallback — only used when NO API key is configured.
 */
function generateMockAlternatives(_prompt: string): Alternative[] {
    const ts = Date.now()
    return [
        {
            id: `alt-1-${ts}`,
            name: 'Simple Monolith',
            description: 'Single deployable unit. Fast to develop, easy to debug. Best for small teams and MVPs.',
            nodes: [
                { id: `client-${ts}`, type: 'client', position: { x: 400, y: -50 }, data: { label: 'React Web App', description: 'User-facing frontend', isGhost: true, technologyId: 'react', port: '3000', envVars: 'VITE_API_URL=http://localhost:80', notes: 'SPA architecture' } },
                { id: `gw-${ts}`, type: 'gateway', position: { x: 400, y: 100 }, data: { label: 'Nginx', description: 'Reverse proxy & load balancer', isGhost: true, technologyId: 'nginx', port: '80', envVars: 'UPSTREAM=http://localhost:3000', notes: 'SSL termination + static file serving' } },
                { id: `svc-${ts}`, type: 'service', position: { x: 400, y: 250 }, data: { label: 'Monolith API', description: 'All business logic in one service', isGhost: true, technologyId: 'express', port: '3000', envVars: 'DATABASE_URL=postgresql://localhost:5432/app\nJWT_SECRET=change-me', notes: 'Single Express.js process handling all routes' } },
                { id: `db-${ts}`, type: 'database', position: { x: 400, y: 400 }, data: { label: 'PostgreSQL', description: 'Primary relational database', isGhost: true, technologyId: 'postgresql', port: '5432', envVars: 'POSTGRES_DB=app\nPOSTGRES_USER=admin', notes: 'ACID compliant, good for relational data' } },
            ] as any,
            edges: [
                { id: `e0-${ts}`, source: `client-${ts}`, target: `gw-${ts}`, animated: true, className: 'ghost' },
                { id: `e1-${ts}`, source: `gw-${ts}`, target: `svc-${ts}`, animated: true, className: 'ghost' },
                { id: `e2-${ts}`, source: `svc-${ts}`, target: `db-${ts}`, animated: true, className: 'ghost' },
            ] as any,
            tradeoffs: { speed: 5, cost: 5, scalability: 2, complexity: 1, simplicity: 5 }
        },
        {
            id: `alt-2-${ts}`,
            name: 'Microservices',
            description: 'Separated services for independent deployment. Better for larger teams with domain ownership.',
            nodes: [
                { id: `client2-${ts}`, type: 'client', position: { x: 400, y: -50 }, data: { label: 'Next.js App', description: 'SSR Web App', isGhost: true, technologyId: 'nextjs', port: '3000', envVars: 'API_URL=http://api.internal:8000', notes: 'Server-side rendering' } },
                { id: `gw2-${ts}`, type: 'gateway', position: { x: 400, y: 80 }, data: { label: 'API Gateway', description: 'Route-based request proxying', isGhost: true, technologyId: 'kong', port: '8000', envVars: 'KONG_DATABASE=postgres', notes: 'Plugin-based auth, rate limiting' } },
                { id: `auth-${ts}`, type: 'service', position: { x: 200, y: 220 }, data: { label: 'Auth Service', description: 'JWT + OAuth2 authentication', isGhost: true, technologyId: 'express', port: '3001', envVars: 'JWT_SECRET=secret\nOAUTH_CLIENT_ID=xxx', notes: 'Stateless JWT validation' } },
                { id: `core-${ts}`, type: 'service', position: { x: 400, y: 220 }, data: { label: 'Core Service', description: 'Main business logic', isGhost: true, technologyId: 'nestjs', port: '3002', envVars: 'DB_URL=mongodb://localhost:27017/core', notes: 'NestJS for structured domain logic' } },
                { id: `users-${ts}`, type: 'service', position: { x: 600, y: 220 }, data: { label: 'Users Service', description: 'User profiles & preferences', isGhost: true, technologyId: 'fastify', port: '3003', envVars: 'DB_URL=postgresql://localhost:5432/users', notes: 'Fastify for high throughput' } },
                { id: `db1-${ts}`, type: 'database', position: { x: 300, y: 400 }, data: { label: 'PostgreSQL', description: 'Users & auth data', isGhost: true, technologyId: 'postgresql', port: '5432', envVars: 'POSTGRES_DB=users', notes: 'Relational data for users' } },
                { id: `db2-${ts}`, type: 'database', position: { x: 500, y: 400 }, data: { label: 'MongoDB', description: 'Core domain data', isGhost: true, technologyId: 'mongodb', port: '27017', envVars: 'MONGO_INITDB_DATABASE=core', notes: 'Flexible schema for domain entities' } },
            ] as any,
            edges: [
                { id: `e2z-${ts}`, source: `client2-${ts}`, target: `gw2-${ts}`, animated: true, className: 'ghost' },
                { id: `e2a-${ts}`, source: `gw2-${ts}`, target: `auth-${ts}`, animated: true, className: 'ghost' },
                { id: `e2b-${ts}`, source: `gw2-${ts}`, target: `core-${ts}`, animated: true, className: 'ghost' },
                { id: `e2c-${ts}`, source: `gw2-${ts}`, target: `users-${ts}`, animated: true, className: 'ghost' },
                { id: `e2d-${ts}`, source: `auth-${ts}`, target: `db1-${ts}`, animated: true, className: 'ghost' },
                { id: `e2e-${ts}`, source: `users-${ts}`, target: `db1-${ts}`, animated: true, className: 'ghost' },
                { id: `e2f-${ts}`, source: `core-${ts}`, target: `db2-${ts}`, animated: true, className: 'ghost' },
            ] as any,
            tradeoffs: { speed: 3, cost: 3, scalability: 4, complexity: 4, simplicity: 2 }
        },
        {
            id: `alt-3-${ts}`,
            name: 'High Performance',
            description: 'Microservices + caching + message queue. For high-throughput production systems.',
            nodes: [
                { id: `client3-${ts}`, type: 'client', position: { x: 400, y: -50 }, data: { label: 'Mobile App', description: 'Native React Native', isGhost: true, technologyId: 'react-native', port: '8081', envVars: 'API_KEY=xxx', notes: 'Cross-platform app' } },
                { id: `gw3-${ts}`, type: 'gateway', position: { x: 400, y: 80 }, data: { label: 'Traefik', description: 'Auto-discovery reverse proxy', isGhost: true, technologyId: 'traefik', port: '80', envVars: 'TRAEFIK_API=true', notes: 'Docker-native service discovery' } },
                { id: `auth3-${ts}`, type: 'service', position: { x: 200, y: 220 }, data: { label: 'Auth Service', description: 'Authentication + session management', isGhost: true, technologyId: 'go-fiber', port: '3001', envVars: 'REDIS_URL=redis://localhost:6379', notes: 'Go for minimal latency on auth checks' } },
                { id: `core3-${ts}`, type: 'service', position: { x: 400, y: 220 }, data: { label: 'Core Service', description: 'Business logic engine', isGhost: true, technologyId: 'nestjs', port: '3002', envVars: 'MONGO_URL=mongodb://localhost:27017/app', notes: 'TypeScript for maintainability' } },
                { id: `worker-${ts}`, type: 'service', position: { x: 600, y: 220 }, data: { label: 'Worker Service', description: 'Background job processing', isGhost: true, technologyId: 'express', port: '3004', envVars: 'REDIS_URL=redis://localhost:6379', notes: 'BullMQ workers for async tasks' } },
                { id: `cache3-${ts}`, type: 'cache', position: { x: 200, y: 400 }, data: { label: 'Redis', description: 'Session cache + message broker', isGhost: true, technologyId: 'redis', port: '6379', envVars: 'REDIS_MAXMEMORY=256mb', notes: 'Pub/sub + caching + job queue' } },
                { id: `db3a-${ts}`, type: 'database', position: { x: 400, y: 500 }, data: { label: 'PostgreSQL', description: 'Transactional data', isGhost: true, technologyId: 'postgresql', port: '5432', envVars: 'POSTGRES_DB=main', notes: 'Primary OLTP database' } },
                { id: `db3b-${ts}`, type: 'database', position: { x: 600, y: 400 }, data: { label: 'MongoDB', description: 'Document store for logs/events', isGhost: true, technologyId: 'mongodb', port: '27017', envVars: 'MONGO_DB=events', notes: 'Flexible schema for event sourcing' } },
            ] as any,
            edges: [
                { id: `e3z-${ts}`, source: `client3-${ts}`, target: `gw3-${ts}`, animated: true, className: 'ghost' },
                { id: `e3a-${ts}`, source: `gw3-${ts}`, target: `auth3-${ts}`, animated: true, className: 'ghost' },
                { id: `e3b-${ts}`, source: `gw3-${ts}`, target: `core3-${ts}`, animated: true, className: 'ghost' },
                { id: `e3c-${ts}`, source: `auth3-${ts}`, target: `cache3-${ts}`, animated: true, className: 'ghost' },
                { id: `e3d-${ts}`, source: `core3-${ts}`, target: `db3a-${ts}`, animated: true, className: 'ghost' },
                { id: `e3e-${ts}`, source: `core3-${ts}`, target: `cache3-${ts}`, animated: true, className: 'ghost' },
                { id: `e3f-${ts}`, source: `worker-${ts}`, target: `db3b-${ts}`, animated: true, className: 'ghost' },
                { id: `e3g-${ts}`, source: `worker-${ts}`, target: `cache3-${ts}`, animated: true, className: 'ghost' },
            ] as any,
            tradeoffs: { speed: 2, cost: 2, scalability: 5, complexity: 5, simplicity: 1 }
        }
    ]
}

function generateMockQuestions(): AIQuestion[] {
    return [
        {
            id: 'mock-scale',
            question: 'What is your expected scale?',
            options: [
                { label: 'Startup (< 1,000 users)', value: 'low_scale' },
                { label: 'Growth (1k - 10k users)', value: 'mid_scale' },
                { label: 'Enterprise (10k+ users)', value: 'high_scale' }
            ]
        },
        {
            id: 'mock-workload',
            question: 'What is the primary workload?',
            options: [
                { label: 'Read Heavy (Content, Blogs)', value: 'read_heavy' },
                { label: 'Write Heavy (IoT, Logs)', value: 'write_heavy' },
                { label: 'Balanced (E-commerce, SaaS)', value: 'balanced' }
            ]
        },
        {
            id: 'mock-budget',
            question: 'What is your infrastructure budget?',
            options: [
                { label: 'Minimal (free tier)', value: 'budget_low' },
                { label: 'Moderate (managed services)', value: 'budget_mid' },
                { label: 'Enterprise cloud', value: 'budget_high' }
            ]
        }
    ]
}
