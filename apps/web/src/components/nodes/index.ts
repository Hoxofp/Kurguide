import { ServiceNode } from './ServiceNode'
import { DatabaseNode } from './DatabaseNode'
import { CacheNode } from './CacheNode'
import { GatewayNode } from './GatewayNode'
import { ClientNode } from './ClientNode'

export const nodeTypes = {
    service: ServiceNode,
    database: DatabaseNode,
    cache: CacheNode,
    gateway: GatewayNode,
    client: ClientNode,
    default: ServiceNode, // Fallback for React Flow's default type
    
    // Hallucination Aliases
    queue: CacheNode,
    broker: CacheNode,
    mq: CacheNode,
    kafka: CacheNode,
    pubsub: CacheNode,
    worker: ServiceNode,
    frontend: ClientNode,
    mobile: ClientNode,
    web: ClientNode,
    ui: ClientNode,
    api: ServiceNode,
    backend: ServiceNode,
    loadbalancer: GatewayNode,
    proxy: GatewayNode,
    storage: DatabaseNode,
    bucket: DatabaseNode,
    s3: DatabaseNode,
}

export const nodePalette = [
    { type: 'client', label: 'Client', color: '#2A85FF' },
    { type: 'gateway', label: 'Gateway', color: '#44A194' },
    { type: 'service', label: 'Service', color: '#685AFF' },
    { type: 'database', label: 'Database', color: '#44A194' },
    { type: 'cache', label: 'Cache', color: '#FF4400' },
]
