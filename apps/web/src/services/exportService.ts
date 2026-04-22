import type { Node, Edge } from '@xyflow/react'
import type { Project } from '../store/projectStore'

/* ─── Types ─────────────────────────────────────────── */

export interface DockerComposeService {
    image?: string
    build?: { context: string; dockerfile?: string }
    ports?: string[]
    environment?: string[]
    depends_on?: string[]
    networks?: string[]
    volumes?: string[]
}

export interface ExportOutput {
    dockerCompose: string
    claudeMd: string
    structuredJson: string
    fileStructure: string
}

/* ─── Helpers ────────────────────────────────────────── */

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

function nodeTypeToDockerImage(type: string, techId?: string): string {
    const techMap: Record<string, string> = {
        nginx: 'nginx:alpine',
        kong: 'kong:latest',
        traefik: 'traefik:v3',
        'express-gw': 'node:20-alpine',
        express: 'node:20-alpine',
        fastify: 'node:20-alpine',
        nestjs: 'node:20-alpine',
        'spring-boot': 'eclipse-temurin:21-jre-alpine',
        django: 'python:3.12-slim',
        'go-fiber': 'golang:1.22-alpine',
        mongodb: 'mongo:7',
        postgresql: 'postgres:16-alpine',
        mysql: 'mysql:8',
        supabase: 'supabase/postgres:latest',
        dynamodb: 'amazon/dynamodb-local',
        redis: 'redis:7-alpine',
        memcached: 'memcached:alpine',
        valkey: 'valkey/valkey:7-alpine',
    }
    if (techId && techMap[techId]) return techMap[techId]
    const fallbacks: Record<string, string> = {
        service: 'node:20-alpine',
        database: 'postgres:16-alpine',
        cache: 'redis:7-alpine',
        gateway: 'nginx:alpine',
    }
    return fallbacks[type] || 'alpine:latest'
}

function parseEnvVars(envVarsStr: string): string[] {
    if (!envVarsStr) return []
    return envVarsStr
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && line.includes('='))
}

function getFolderForTech(type: string, techId?: string): string {
    if (techId === 'express' || techId === 'fastify' || techId === 'nestjs' || techId === 'express-gw') return 'Node.js (TypeScript)'
    if (techId === 'spring-boot') return 'Java/Kotlin (Maven)'
    if (techId === 'django') return 'Python (pip)'
    if (techId === 'go-fiber') return 'Go (modules)'
    if (type === 'service') return 'Node.js (TypeScript)'
    if (type === 'gateway') return 'nginx config'
    return ''
}

/* ─── Docker Compose Generator ───────────────────────── */

export function generateDockerCompose(nodes: Node[], edges: Edge[]): string {
    const services: Record<string, DockerComposeService> = {}
    const volumes: string[] = []

    // Build dependency map from edges
    const deps: Record<string, string[]> = {}
    for (const edge of edges) {
        const sourceSlug = slugify((nodes.find((n) => n.id === edge.source)?.data?.label as string) || edge.source)
        const targetSlug = slugify((nodes.find((n) => n.id === edge.target)?.data?.label as string) || edge.target)
        if (!deps[sourceSlug]) deps[sourceSlug] = []
        deps[sourceSlug].push(targetSlug)
    }

    for (const node of nodes) {
        if ((node.data as Record<string, unknown>)?.isGhost) continue
        const data = node.data as Record<string, string>
        const svcName = slugify(data.label || node.id)
        const port = data.port || '3000'
        const envVars = parseEnvVars(data.envVars || '')
        const image = nodeTypeToDockerImage(node.type || 'service', data.technologyId)

        const svc: DockerComposeService = {
            image,
            ports: [`${port}:${port}`],
            networks: ['kurguide-net'],
        }

        if (envVars.length > 0) {
            svc.environment = envVars
        }

        const svcDeps = deps[svcName]
        if (svcDeps && svcDeps.length > 0) {
            svc.depends_on = svcDeps
        }

        // Add named volumes for databases
        if (node.type === 'database') {
            const volName = `${svcName}-data`
            svc.volumes = [`${volName}:/data`]
            volumes.push(volName)
        }

        services[svcName] = svc
    }

    // Build YAML manually (no yaml lib dependency)
    const lines: string[] = ['version: "3.9"', '', 'services:']

    for (const [name, svc] of Object.entries(services)) {
        lines.push(`  ${name}:`)
        lines.push(`    image: ${svc.image}`)
        if (svc.ports) {
            lines.push('    ports:')
            for (const p of svc.ports) lines.push(`      - "${p}"`)
        }
        if (svc.environment && svc.environment.length > 0) {
            lines.push('    environment:')
            for (const e of svc.environment) lines.push(`      - ${e}`)
        }
        if (svc.depends_on && svc.depends_on.length > 0) {
            lines.push('    depends_on:')
            for (const d of svc.depends_on) lines.push(`      - ${d}`)
        }
        if (svc.volumes) {
            lines.push('    volumes:')
            for (const v of svc.volumes) lines.push(`      - ${v}`)
        }
        if (svc.networks) {
            lines.push('    networks:')
            for (const n of svc.networks) lines.push(`      - ${n}`)
        }
    }

    lines.push('')
    if (volumes.length > 0) {
        lines.push('volumes:')
        for (const v of volumes) lines.push(`  ${v}:`)
        lines.push('')
    }

    lines.push('networks:')
    lines.push('  kurguide-net:')
    lines.push('    driver: bridge')

    return lines.join('\n')
}

/* ─── CLAUDE.md Generator ────────────────────────────── */

export function generateClaudeMd(project: Project): string {
    const { nodes, edges } = project
    const nonGhostNodes = nodes.filter((n) => !(n.data as Record<string, unknown>)?.isGhost)

    const services = nonGhostNodes.filter((n) => n.type === 'service')
    const gateways = nonGhostNodes.filter((n) => n.type === 'gateway')
    const databases = nonGhostNodes.filter((n) => n.type === 'database')
    const caches = nonGhostNodes.filter((n) => n.type === 'cache')

    const lines: string[] = [
        `# ${project.name}`,
        '',
        '> Auto-generated by **Kurguide** — Architecture-as-Code tool.',
        `> Last updated: ${new Date(project.updatedAt).toISOString()}`,
        '',
        '## Architecture Overview',
        '',
        `This project uses a **${services.length > 1 ? 'microservices' : 'monolithic'}** architecture with ${nonGhostNodes.length} components.`,
        '',
    ]

    if (gateways.length > 0) {
        lines.push('### Entry Points')
        for (const gw of gateways) {
            const d = gw.data as Record<string, string>
            lines.push(`- **${d.label}** (${d.technologyId || 'gateway'}) — port ${d.port || '80'}`)
        }
        lines.push('')
    }

    if (services.length > 0) {
        lines.push('### Services')
        for (const svc of services) {
            const d = svc.data as Record<string, string>
            lines.push(`- **${d.label}** (${d.technologyId || 'service'}) — port ${d.port || '3000'}`)
            if (d.description) lines.push(`  ${d.description}`)
        }
        lines.push('')
    }

    if (databases.length > 0) {
        lines.push('### Databases')
        for (const db of databases) {
            const d = db.data as Record<string, string>
            lines.push(`- **${d.label}** (${d.technologyId || 'database'}) — port ${d.port || '5432'}`)
        }
        lines.push('')
    }

    if (caches.length > 0) {
        lines.push('### Caches')
        for (const c of caches) {
            const d = c.data as Record<string, string>
            lines.push(`- **${d.label}** (${d.technologyId || 'cache'}) — port ${d.port || '6379'}`)
        }
        lines.push('')
    }

    // Service connections
    if (edges.length > 0) {
        lines.push('### Service Connections')
        lines.push('')
        lines.push('```')
        for (const edge of edges) {
            const src = nonGhostNodes.find((n) => n.id === edge.source)
            const tgt = nonGhostNodes.find((n) => n.id === edge.target)
            if (src && tgt) {
                const srcLabel = (src.data as Record<string, string>).label
                const tgtLabel = (tgt.data as Record<string, string>).label
                lines.push(`${srcLabel} → ${tgtLabel}`)
            }
        }
        lines.push('```')
        lines.push('')
    }

    // Folder structure
    lines.push('## Suggested Folder Structure')
    lines.push('')
    lines.push('```')
    lines.push('.')
    for (const svc of [...gateways, ...services]) {
        const d = svc.data as Record<string, string>
        const folder = slugify(d.label)
        const tech = getFolderForTech(svc.type || 'service', d.technologyId)
        lines.push(`├── ${folder}/               # ${tech}`)
        lines.push(`│   ├── src/`)
        lines.push(`│   └── Dockerfile`)
    }
    lines.push('├── docker-compose.yml')
    lines.push('└── CLAUDE.md')
    lines.push('```')
    lines.push('')

    // Quick start
    lines.push('## Quick Start')
    lines.push('')
    lines.push('```bash')
    lines.push('# Start all services')
    lines.push('docker compose up -d')
    lines.push('')
    lines.push('# View logs')
    lines.push('docker compose logs -f')
    lines.push('')
    lines.push('# Stop all services')
    lines.push('docker compose down')
    lines.push('```')
    lines.push('')

    // Env vars summary
    const allEnvVars = nonGhostNodes.flatMap((n) => {
        const d = n.data as Record<string, string>
        if (!d.envVars) return []
        return parseEnvVars(d.envVars).map((ev) => `${(d.label || '').toUpperCase().replace(/ /g, '_')}_${ev}`)
    })

    if (allEnvVars.length > 0) {
        lines.push('## Environment Variables')
        lines.push('')
        lines.push('Create a `.env` file in each service folder:')
        lines.push('')
        const seenLabels = new Set<string>()
        for (const node of nonGhostNodes) {
            const d = node.data as Record<string, string>
            if (!d.envVars || seenLabels.has(d.label)) continue
            seenLabels.add(d.label)
            const evs = parseEnvVars(d.envVars)
            if (evs.length === 0) continue
            lines.push(`### ${d.label}`)
            lines.push('```env')
            for (const ev of evs) lines.push(ev)
            lines.push('```')
            lines.push('')
        }
    }

    return lines.join('\n')
}

/* ─── Structured JSON Generator ──────────────────────── */

export function generateStructuredJson(project: Project): string {
    const nonGhostNodes = project.nodes.filter((n) => !(n.data as Record<string, unknown>)?.isGhost)

    const output = {
        name: project.name,
        version: '1.0.0',
        generatedBy: 'Kurguide',
        generatedAt: new Date(project.updatedAt).toISOString(),
        architecture: {
            components: nonGhostNodes.map((n) => {
                const d = n.data as Record<string, string>
                return {
                    id: n.id,
                    type: n.type,
                    label: d.label,
                    description: d.description || '',
                    technology: d.technologyId || '',
                    port: d.port || '',
                    envVars: parseEnvVars(d.envVars || ''),
                }
            }),
            connections: project.edges.map((e) => ({
                from: e.source,
                to: e.target,
            })),
        },
    }
    return JSON.stringify(output, null, 2)
}

/* ─── File Structure Generator ───────────────────────── */

export function generateFileStructure(nodes: Node[]): string {
    const nonGhostNodes = nodes.filter((n) => !(n.data as Record<string, unknown>)?.isGhost)
    const lines: string[] = ['# Önerilen Dosya Yapısı', '', '```']
    lines.push('.')

    for (const node of nonGhostNodes) {
        const d = node.data as Record<string, string>
        const folder = slugify(d.label || node.id)
        const isSrcBased = node.type === 'service' || node.type === 'gateway'

        if (isSrcBased) {
            lines.push(`├── ${folder}/`)
            lines.push(`│   ├── src/`)
            lines.push(`│   │   └── index.ts`)
            lines.push(`│   ├── Dockerfile`)
            lines.push(`│   ├── package.json`)
            lines.push(`│   └── .env.example`)
        } else {
            lines.push(`├── ${folder}/               # ${node.type} — persisted data`)
        }
    }

    lines.push('├── docker-compose.yml')
    lines.push('├── CLAUDE.md')
    lines.push('└── .env')
    lines.push('```')

    return lines.join('\n')
}

/* ─── Master export function ─────────────────────────── */

export function generateAllExports(project: Project): ExportOutput {
    return {
        dockerCompose: generateDockerCompose(project.nodes, project.edges),
        claudeMd: generateClaudeMd(project),
        structuredJson: generateStructuredJson(project),
        fileStructure: generateFileStructure(project.nodes),
    }
}
