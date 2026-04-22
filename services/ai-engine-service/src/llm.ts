import { GoogleGenAI } from '@google/genai'

/**
 * LLM Prompt Logic — Text-to-Node conversion using Gemini.
 *
 * HOW IT WORKS:
 * The user types something like "Add a Redis cache for auth tokens".
 * We send a carefully crafted system prompt to Gemini that says:
 *   "You are an architecture assistant. Given a description, return
 *    a JSON array of nodes and edges that should be added to the graph."
 *
 * The LLM returns structured JSON (using Gemini's JSON mode), which we
 * parse and send back to the frontend to render on the canvas.
 *
 * WHY GEMINI?
 * - Free tier available for development
 * - Native JSON output mode (no regex parsing needed)
 * - Fast inference (1-3 seconds for simple prompts)
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

const SYSTEM_PROMPT = `You are Kurguide's architecture assistant. Your job is to convert natural language descriptions into architecture components.

When the user describes an architecture component or change, return a JSON object with:
- "nodes": array of nodes to add. Each node has: id (string, unique), type (one of: "service", "database", "cache", "gateway"), label (short name), position (random x between 100-800, random y between 100-600), data (object with "label" and "description" fields).
- "edges": array of edges to add. Each edge has: id (string, unique), source (node id), target (node id).

Rules:
- Use sensible, descriptive labels.
- Infer the correct node type from context (e.g. "Redis" -> "cache", "PostgreSQL" -> "database", "API" -> "gateway").
- Generate edges that represent logical data flow.
- Return ONLY valid JSON, no markdown or explanation.

Example input: "Add a Redis cache for session management connected to the auth service"
Example output:
{
  "nodes": [
    {"id": "cache-redis-1", "type": "cache", "label": "Redis (Sessions)", "position": {"x": 450, "y": 300}, "data": {"label": "Redis (Sessions)", "description": "Session cache for auth tokens"}}
  ],
  "edges": [
    {"id": "e-auth-redis", "source": "service-auth", "target": "cache-redis-1"}
  ]
}`

export async function generateArchitecture(prompt: string) {
    if (!GEMINI_API_KEY) {
        // Return mock data when no API key is configured (development mode)
        return generateMockResponse(prompt)
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

    const text = response.text ?? ''
    return JSON.parse(text)
}

/**
 * Mock response for development without an API key.
 * Parses the prompt to guess what kind of node to create.
 */
function generateMockResponse(prompt: string) {
    const lower = prompt.toLowerCase()
    let type = 'service'
    if (lower.includes('redis') || lower.includes('cache') || lower.includes('memcached')) type = 'cache'
    else if (lower.includes('mongo') || lower.includes('postgres') || lower.includes('database') || lower.includes('db') || lower.includes('mysql')) type = 'database'
    else if (lower.includes('gateway') || lower.includes('nginx') || lower.includes('load balancer')) type = 'gateway'

    const id = `${type}-${Date.now()}`
    const label = prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt

    return {
        nodes: [
            {
                id,
                type,
                label,
                position: { x: 300 + Math.random() * 300, y: 200 + Math.random() * 300 },
                data: { label, description: `Generated from: "${prompt}"` },
            },
        ],
        edges: [],
    }
}
