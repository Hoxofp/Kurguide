import { useState, useCallback } from 'react'
import { useCanvasStore } from '../store/canvasStore'

export function PromptBar() {
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')
    const { setAlternatives, previewMode } = useCanvasStore()

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim() || loading || previewMode) return
        setLoading(true)
        setStatus('Thinking...')

        // Fallback to client-side mock for Multi-Architecture Generation
        setTimeout(() => {
            const alts = generateMockAlternatives(prompt)
            setAlternatives(alts)
            setPrompt('')
            setStatus('')
            setLoading(false)
        }, 1500)
    }, [prompt, loading, setAlternatives, previewMode])

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 shadow-prompt transition-opacity"
                style={{
                    background: 'rgba(19, 19, 22, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid #252529',
                    opacity: previewMode ? 0.3 : 1,
                    pointerEvents: previewMode ? 'none' : 'auto'
                }}
            >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${loading ? 'bg-violet animate-pulse-slow' : 'bg-surface-border'}`} />

                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Describe an architecture..."
                    disabled={loading || previewMode}
                    className="flex-1 bg-transparent text-txt-primary text-[11px] font-sans placeholder:text-txt-muted outline-none disabled:opacity-40"
                />

                {status ? (
                    <span className="text-[9px] text-violet font-mono whitespace-nowrap animate-pulse">{status}</span>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !prompt.trim() || previewMode}
                        className="px-2 py-1 rounded-md text-[9px] font-mono text-violet hover:text-cream transition-colors disabled:opacity-20"
                        style={{ background: 'rgba(104, 90, 255, 0.08)', border: '1px solid rgba(104, 90, 255, 0.15)' }}
                    >
                        Generate
                    </button>
                )}
            </div>
        </div>
    )
}

function generateMockAlternatives(prompt: string) {
    const timestamp = Date.now()
    
    // Parse prompt for some context
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
            nodes: alt1Nodes as any,
            edges: alt1Edges as any,
            tradeoffs: { speed: 5, cost: 5, scalability: 2, complexity: 1, simplicity: 5 }
        },
        {
            id: `alt-micro-${timestamp}`,
            name: 'Microservices',
            description: 'Highly scalable, isolates features.',
            nodes: alt2Nodes as any,
            edges: alt2Edges as any,
            tradeoffs: { speed: 3, cost: 3, scalability: 4, complexity: 4, simplicity: 2 }
        },
        {
            id: `alt-scale-${timestamp}`,
            name: 'High Performance',
            description: 'Adds caching layer to reduce DB load.',
            nodes: alt3Nodes as any,
            edges: alt3Edges as any,
            tradeoffs: { speed: 5, cost: 2, scalability: 5, complexity: 5, simplicity: 1 }
        }
    ]
}
