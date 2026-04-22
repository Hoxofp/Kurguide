import { ServiceNode } from './ServiceNode'
import { DatabaseNode } from './DatabaseNode'
import { CacheNode } from './CacheNode'
import { GatewayNode } from './GatewayNode'

export const nodeTypes = {
    service: ServiceNode,
    database: DatabaseNode,
    cache: CacheNode,
    gateway: GatewayNode,
}

export const nodePalette = [
    { type: 'gateway', label: 'Gateway', color: '#44A194' },
    { type: 'service', label: 'Service', color: '#685AFF' },
    { type: 'database', label: 'Database', color: '#44A194' },
    { type: 'cache', label: 'Cache', color: '#FF4400' },
]
