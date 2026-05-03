import { GoogleGenAI } from '@google/genai'

/**
 * LLM Prompt Logic — Text-to-Node conversion using Gemini.
 * Generates 3 distinct architectural alternatives based on a prompt.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

const SYSTEM_PROMPT = `You are Kurguide's architecture assistant. Your job is to convert natural language descriptions into 3 different architectural alternatives.

When the user describes an architecture component or requirement, return a JSON array containing EXACTLY 3 objects. Each object represents an alternative architecture and must have:
- "id": string, unique identifier (e.g. "alt-1").
- "name": string, short title for this architecture (e.g. "Monolith", "Microservices").
- "description": string, brief explanation of this approach and why it fits.
- "nodes": array of nodes. Each node has: id (string, unique), type (one of: "service", "database", "cache", "gateway"), position (random x between 100-800, random y between 100-600), data (object with "label", "description", and "isGhost": true fields).
- "edges": array of edges. Each edge has: id (string, unique), source (node id), target (node id), animated (boolean, true), className (string, "ghost").
- "tradeoffs": object with 5 metrics scored from 1 to 5: { "speed": number, "cost": number, "scalability": number, "complexity": number, "simplicity": number }.

Rules:
- Generate 3 distinct approaches (e.g. Simple, Balanced, Highly Scalable).
- Use sensible, descriptive labels.
- Infer the correct node type from context (e.g. "Redis" -> "cache", "PostgreSQL" -> "database", "API" -> "gateway").
- Return ONLY valid JSON as an array of 3 objects, no markdown or explanation.
`

export async function generateArchitecture(prompt: string) {
    if (!GEMINI_API_KEY) {
        // Return mock data when no API key is configured (development mode)
        return generateMockAlternatives(prompt)
    }

    const response = await genai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
            { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
        },
    })

    const text = response.text ?? '[]'
    return JSON.parse(text)
}

/**
 * Mock response for development without an API key.
 * Returns 3 diverse alternatives based on the prompt.
 */
function generateMockAlternatives(prompt: string) {
    const timestamp = Date.now()
    const isEcom = prompt.toLowerCase().includes('e-commerce') || prompt.toLowerCase().includes('shop')
    
    // Alternative 1: Simple Monolithic
    const alt1Nodes = [
        { id: `gw-mono-${timestamp}`, type: 'gateway', position: { x: 300, y: 150 }, data: { label: 'Nginx LB', description: 'Entry point', isGhost: true } },
        { id: `svc-mono-${timestamp}`, type: 'service', position: { x: 300, y: 250 }, data: { label: 'Monolith API', description: 'Handles everything', isGhost: true } },
        { id: `db-mono-${timestamp}`, type: 'database', position: { x: 300, y: 350 }, data: { label: 'PostgreSQL', description: 'Primary DB', isGhost: true } }
    ]
    const alt1Edges = [
        { id: `e1-mono-${timestamp}`, source: `gw-mono-${timestamp}`, target: `svc-mono-${timestamp}`, animated: true, className: 'ghost' },
        { id: `e2-mono-${timestamp}`, source: `svc-mono-${timestamp}`, target: `db-mono-${timestamp}`, animated: true, className: 'ghost' }
    ]

    // Alternative 2: Microservices
    const alt2Nodes = [
        { id: `gw-micro-${timestamp}`, type: 'gateway', position: { x: 400, y: 100 }, data: { label: 'API Gateway', description: 'Routing', isGhost: true } },
        { id: `svc-auth-${timestamp}`, type: 'service', position: { x: 250, y: 200 }, data: { label: 'Auth Service', description: 'JWT tokens', isGhost: true } },
        { id: `svc-core-${timestamp}`, type: 'service', position: { x: 400, y: 200 }, data: { label: isEcom ? 'Orders Service' : 'Core Service', description: 'Business logic', isGhost: true } },
        { id: `svc-users-${timestamp}`, type: 'service', position: { x: 550, y: 200 }, data: { label: 'Users Service', description: 'User management', isGhost: true } },
        { id: `db-micro1-${timestamp}`, type: 'database', position: { x: 325, y: 300 }, data: { label: 'PostgreSQL', description: 'Users DB', isGhost: true } },
        { id: `db-micro2-${timestamp}`, type: 'database', position: { x: 475, y: 300 }, data: { label: 'MongoDB', description: 'Core DB', isGhost: true } }
    ]
    const alt2Edges = [
        { id: `e1-micro-${timestamp}`, source: `gw-micro-${timestamp}`, target: `svc-auth-${timestamp}`, animated: true, className: 'ghost' },
        { id: `e2-micro-${timestamp}`, source: `gw-micro-${timestamp}`, target: `svc-core-${timestamp}`, animated: true, className: 'ghost' },
        { id: `e3-micro-${timestamp}`, source: `gw-micro-${timestamp}`, target: `svc-users-${timestamp}`, animated: true, className: 'ghost' },
        { id: `e4-micro-${timestamp}`, source: `svc-auth-${timestamp}`, target: `db-micro1-${timestamp}`, animated: true, className: 'ghost' },
        { id: `e5-micro-${timestamp}`, source: `svc-users-${timestamp}`, target: `db-micro1-${timestamp}`, animated: true, className: 'ghost' },
        { id: `e6-micro-${timestamp}`, source: `svc-core-${timestamp}`, target: `db-micro2-${timestamp}`, animated: true, className: 'ghost' }
    ]

    // Alternative 3: Caching & Scalability
    const alt3Nodes = [
        ...alt2Nodes,
        { id: `cache-redis-${timestamp}`, type: 'cache', position: { x: 250, y: 300 }, data: { label: 'Redis', description: 'Session Map', isGhost: true } }
    ]
    const alt3Edges = [
        ...alt2Edges,
        { id: `e-cache-${timestamp}`, source: `svc-auth-${timestamp}`, target: `cache-redis-${timestamp}`, animated: true, className: 'ghost' }
    ]

    return [
        {
            id: `alt-mono-${timestamp}`,
            name: 'Monolithic Base',
            description: 'Fast to build, easy to deploy.',
            nodes: alt1Nodes,
            edges: alt1Edges,
            tradeoffs: { speed: 5, cost: 5, scalability: 2, complexity: 1, simplicity: 5 }
        },
        {
            id: `alt-micro-${timestamp}`,
            name: 'Microservices',
            description: 'Highly scalable, isolates features.',
            nodes: alt2Nodes,
            edges: alt2Edges,
            tradeoffs: { speed: 3, cost: 3, scalability: 4, complexity: 4, simplicity: 2 }
        },
        {
            id: `alt-scale-${timestamp}`,
            name: 'High Performance',
            description: 'Adds caching layer to reduce DB load.',
            nodes: alt3Nodes,
            edges: alt3Edges,
            tradeoffs: { speed: 5, cost: 2, scalability: 5, complexity: 5, simplicity: 1 }
        }
    ]
}

