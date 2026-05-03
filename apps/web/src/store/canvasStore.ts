import { create } from 'zustand'
import { temporal } from 'zundo'
import {
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type Node,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
} from '@xyflow/react'

/* ─── Technology Catalog ────────────────────────────── */
export interface TechOption {
    id: string
    name: string
    category: string
    defaultPort: string
    description: string
    specs: {
        language: string
        latency: string
        scalability: string
        persistence: string
    }
}

export const TECH_CATALOG: TechOption[] = [
    // Gateways
    { id: 'nginx', name: 'Nginx', category: 'gateway', defaultPort: '80', description: 'High-performance reverse proxy & load balancer', specs: { language: 'C', latency: '~1ms', scalability: 'Horizontal', persistence: 'None' } },
    { id: 'kong', name: 'Kong', category: 'gateway', defaultPort: '8000', description: 'Cloud-native API gateway with plugin ecosystem', specs: { language: 'Lua/Go', latency: '~2ms', scalability: 'Horizontal', persistence: 'PostgreSQL' } },
    { id: 'express-gw', name: 'Express Gateway', category: 'gateway', defaultPort: '4000', description: 'Lightweight Node.js API gateway', specs: { language: 'Node.js', latency: '~5ms', scalability: 'Vertical', persistence: 'None' } },
    { id: 'traefik', name: 'Traefik', category: 'gateway', defaultPort: '80', description: 'Modern HTTP reverse proxy with auto-discovery', specs: { language: 'Go', latency: '~1ms', scalability: 'Horizontal', persistence: 'None' } },
    // Services
    { id: 'express', name: 'Express.js', category: 'service', defaultPort: '3000', description: 'Minimal Node.js web framework', specs: { language: 'Node.js', latency: '~3ms', scalability: 'Horizontal', persistence: 'None' } },
    { id: 'fastify', name: 'Fastify', category: 'service', defaultPort: '3000', description: 'Fast, low-overhead Node.js framework', specs: { language: 'Node.js', latency: '~1ms', scalability: 'Horizontal', persistence: 'None' } },
    { id: 'nestjs', name: 'NestJS', category: 'service', defaultPort: '3000', description: 'Progressive Node.js framework (Angular-inspired)', specs: { language: 'TypeScript', latency: '~5ms', scalability: 'Horizontal', persistence: 'ORM' } },
    { id: 'spring-boot', name: 'Spring Boot', category: 'service', defaultPort: '8080', description: 'Enterprise Java/Kotlin microservice framework', specs: { language: 'Java/Kotlin', latency: '~10ms', scalability: 'Horizontal', persistence: 'JPA' } },
    { id: 'django', name: 'Django', category: 'service', defaultPort: '8000', description: 'Full-featured Python web framework', specs: { language: 'Python', latency: '~15ms', scalability: 'Horizontal', persistence: 'ORM' } },
    { id: 'go-fiber', name: 'Go Fiber', category: 'service', defaultPort: '3000', description: 'Express-inspired Go web framework', specs: { language: 'Go', latency: '<1ms', scalability: 'Horizontal', persistence: 'None' } },
    // Databases
    { id: 'mongodb', name: 'MongoDB', category: 'database', defaultPort: '27017', description: 'Document-oriented NoSQL database', specs: { language: 'C++', latency: '~2ms', scalability: 'Horizontal (sharding)', persistence: 'Disk + WiredTiger' } },
    { id: 'postgresql', name: 'PostgreSQL', category: 'database', defaultPort: '5432', description: 'Advanced open-source relational database', specs: { language: 'C', latency: '~1ms', scalability: 'Vertical + read replicas', persistence: 'WAL + Disk' } },
    { id: 'mysql', name: 'MySQL', category: 'database', defaultPort: '3306', description: 'Popular relational database', specs: { language: 'C/C++', latency: '~1ms', scalability: 'Primary-replica', persistence: 'InnoDB' } },
    { id: 'supabase', name: 'Supabase', category: 'database', defaultPort: '5432', description: 'Open-source Firebase alternative (PostgreSQL)', specs: { language: 'Elixir/TS', latency: '~5ms', scalability: 'Managed', persistence: 'PostgreSQL' } },
    { id: 'dynamodb', name: 'DynamoDB', category: 'database', defaultPort: '443', description: 'AWS managed NoSQL key-value store', specs: { language: 'Managed', latency: '<5ms', scalability: 'Infinite (managed)', persistence: 'SSD' } },
    // Caches
    { id: 'redis', name: 'Redis', category: 'cache', defaultPort: '6379', description: 'In-memory data structure store', specs: { language: 'C', latency: '<1ms', scalability: 'Cluster mode', persistence: 'RDB + AOF' } },
    { id: 'memcached', name: 'Memcached', category: 'cache', defaultPort: '11211', description: 'Distributed memory caching system', specs: { language: 'C', latency: '<1ms', scalability: 'Horizontal', persistence: 'None (memory only)' } },
    { id: 'valkey', name: 'Valkey', category: 'cache', defaultPort: '6379', description: 'Redis fork maintained by Linux Foundation', specs: { language: 'C', latency: '<1ms', scalability: 'Cluster mode', persistence: 'RDB + AOF' } },
]

/* ─── Types ─────────────────────────────────────────── */
export interface Checkpoint {
    id: string
    name: string
    timestamp: number
    nodes: Node[]
    edges: Edge[]
}

export interface Tradeoffs {
    speed: number      // 1-5
    cost: number       // 1-5
    scalability: number // 1-5
    complexity: number  // 1-5
    simplicity: number  // 1-5
}

export interface Alternative {
    id: string
    name: string
    description: string
    nodes: Node[]
    edges: Edge[]
    tradeoffs: Tradeoffs
}

export interface CanvasState {
    nodes: Node[]
    edges: Edge[]
    checkpoints: Checkpoint[]

    // Alternatives
    alternatives: Alternative[]
    activeAlternativeIndex: number | null
    previewMode: boolean

    // React Flow handlers
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect

    // Actions
    addNode: (node: Node) => void
    removeNode: (id: string) => void
    updateNodeData: (id: string, data: Record<string, unknown>) => void
    setCanvas: (nodes: Node[], edges: Edge[], checkpoints: Checkpoint[]) => void

    // Checkpoint actions
    saveCheckpoint: (name: string) => void
    restoreCheckpoint: (id: string) => void
    deleteCheckpoint: (id: string) => void

    // Alternative actions
    setAlternatives: (alts: Alternative[]) => void
    previewAlternative: (index: number) => void
    selectAlternative: (index: number) => void
    clearAlternatives: () => void
}

/* ─── Sample data ───────────────────────────────────── */
const sampleNodes: Node[] = []
const sampleEdges: Edge[] = []

/* ─── Equality: only track structural changes, ignore position ── */
function stateEquality(
    past: Pick<CanvasState, 'nodes' | 'edges'>,
    current: Pick<CanvasState, 'nodes' | 'edges'>
): boolean {
    // Different number of nodes or edges = structural change
    if (past.nodes.length !== current.nodes.length) return false
    if (past.edges.length !== current.edges.length) return false

    // Different node IDs or data = structural change
    for (let i = 0; i < past.nodes.length; i++) {
        const pn = past.nodes[i]
        const cn = current.nodes[i]
        if (!pn || !cn) return false
        if (pn.id !== cn.id) return false
        if (JSON.stringify(pn.data) !== JSON.stringify(cn.data)) return false
    }

    // Different edge connections = structural change
    for (let i = 0; i < past.edges.length; i++) {
        const pe = past.edges[i]
        const ce = current.edges[i]
        if (!pe || !ce) return false
        if (pe.source !== ce.source || pe.target !== ce.target) return false
    }

    // Position-only changes are NOT tracked
    return true
}

/* ─── Store ──────────────────────────────────────────── */
export const useCanvasStore = create<CanvasState>()(
    temporal(
        (set, get) => ({
            nodes: sampleNodes,
            edges: sampleEdges,
            checkpoints: [],

            onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
            onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
            onConnect: (connection) => set({ edges: addEdge(connection, get().edges) }),

            addNode: (node) => set({ nodes: [...get().nodes, node] }),
            removeNode: (id) => set({
                nodes: get().nodes.filter((n) => n.id !== id),
                edges: get().edges.filter((e) => e.source !== id && e.target !== id),
            }),
            updateNodeData: (id, data) => set({
                nodes: get().nodes.map((n) =>
                    n.id === id ? { ...n, data: { ...n.data, ...data } } : n
                ),
            }),
            setCanvas: (nodes, edges, checkpoints) => set({
                nodes: JSON.parse(JSON.stringify(nodes)),
                edges: JSON.parse(JSON.stringify(edges)),
                checkpoints: JSON.parse(JSON.stringify(checkpoints)),
            }),

            saveCheckpoint: (name) => {
                const { nodes, edges, checkpoints } = get()
                set({
                    checkpoints: [...checkpoints, {
                        id: `cp-${Date.now()}`, name, timestamp: Date.now(),
                        nodes: JSON.parse(JSON.stringify(nodes)),
                        edges: JSON.parse(JSON.stringify(edges)),
                    }]
                })
            },
            restoreCheckpoint: (id) => {
                const cp = get().checkpoints.find((c) => c.id === id)
                if (cp) set({ nodes: JSON.parse(JSON.stringify(cp.nodes)), edges: JSON.parse(JSON.stringify(cp.edges)) })
            },
            deleteCheckpoint: (id) => set({ checkpoints: get().checkpoints.filter((c) => c.id !== id) }),

            // Alternatives implementation
            alternatives: [],
            activeAlternativeIndex: null,
            previewMode: false,

            setAlternatives: (alts) => set({
                alternatives: alts,
                activeAlternativeIndex: 0,
                previewMode: true
            }),
            previewAlternative: (index) => set({ activeAlternativeIndex: index }),
            selectAlternative: (index) => {
                const alts = get().alternatives;
                if (!alts || index < 0 || index >= alts.length) return;
                
                const selected = alts[index];
                // Append nodes and edges to existing ones, taking care not to overwrite IDs without reason.
                // In a perfect system we'd merge smartly, but here lets just add them.
                set({
                    nodes: [...get().nodes, ...JSON.parse(JSON.stringify(selected.nodes))].map(n => ({...n, data: {...n.data, isGhost: false}})),
                    edges: [...get().edges, ...JSON.parse(JSON.stringify(selected.edges))].map(e => ({...e, animated: true, selected: false, style: e.style || undefined})),
                    alternatives: [],
                    activeAlternativeIndex: null,
                    previewMode: false
                });
            },
            clearAlternatives: () => set({
                alternatives: [],
                activeAlternativeIndex: null,
                previewMode: false
            }),
        }),
        {
            partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
            equality: stateEquality,
            limit: 50,
        }
    )
)
