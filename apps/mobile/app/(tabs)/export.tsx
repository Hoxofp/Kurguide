import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Share, Alert,
} from 'react-native'
import { useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import { useAppStore, selectActiveProject } from '../../store/appStore'
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens'
import type { Project, ComponentNode, Connection } from '../../store/appStore'

/* ═══════════════════════════════════════════════════
   EXPORT SCREEN — Hafta 8 Mobil
   - Docker Compose çıktısı
   - CLAUDE.md çıktısı  
   - Yapılandırılmış JSON
   - Kopyalama + paylaşma
   ═══════════════════════════════════════════════════ */

type ExportFormat = 'docker' | 'claude' | 'json' | 'files'

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: string; desc: string }[] = [
    { id: 'docker', label: 'Docker Compose', icon: '🐳', desc: 'docker-compose.yml' },
    { id: 'claude', label: 'CLAUDE.md', icon: '📝', desc: 'AI context file' },
    { id: 'json', label: 'Structured JSON', icon: '{}', desc: 'Machine-readable' },
    { id: 'files', label: 'File Structure', icon: '📁', desc: 'Folder layout' },
]

export default function ExportScreen() {
    const [format, setFormat] = useState<ExportFormat>('docker')
    const [copied, setCopied] = useState(false)
    const { projects, activeProjectId } = useAppStore()
    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null

    const output = activeProject ? generateOutput(activeProject, format) : '# No project selected'

    const handleCopy = async () => {
        await Clipboard.setStringAsync(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: output,
                title: `${activeProject?.name ?? 'Project'} — ${FORMAT_OPTIONS.find((f) => f.id === format)?.label}`,
            })
        } catch {
            Alert.alert('Share failed', 'Could not share content.')
        }
    }

    return (
        <View style={styles.container}>
            {/* Format selector */}
            <View style={styles.formatRow}>
                {FORMAT_OPTIONS.map((f) => (
                    <TouchableOpacity
                        key={f.id}
                        onPress={() => setFormat(f.id)}
                        style={[styles.formatBtn, format === f.id && styles.formatBtnActive]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.formatIcon}>{f.icon}</Text>
                        <Text style={[styles.formatLabel, format === f.id && { color: colors.accent }]}>
                            {f.label}
                        </Text>
                        <Text style={styles.formatDesc}>{f.desc}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Active project indicator */}
            {activeProject && (
                <View style={styles.projectBadge}>
                    <Text style={styles.projectBadgeText}>Exporting: </Text>
                    <Text style={[styles.projectBadgeText, { color: colors.accent }]}>{activeProject.name}</Text>
                    <Text style={styles.projectBadgeMeta}> · {activeProject.components.length} components</Text>
                </View>
            )}

            {/* Output preview */}
            <ScrollView style={styles.outputBox} contentContainerStyle={{ padding: spacing.md }}>
                <Text style={styles.outputText} selectable>{output}</Text>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={handleCopy}
                    style={[styles.actionBtn, styles.copyBtn]}
                    activeOpacity={0.85}
                >
                    <Text style={styles.copyText}>{copied ? '✓ Copied!' : '⎘ Copy'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleShare}
                    style={[styles.actionBtn, styles.shareBtn]}
                    activeOpacity={0.85}
                >
                    <Text style={styles.shareText}>↑ Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

/* ─── Output Generators ──────────────────────────────── */

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function nodeImage(type: string, tech?: string): string {
    const map: Record<string, string> = {
        nginx: 'nginx:alpine', kong: 'kong:latest', traefik: 'traefik:v3',
        express: 'node:20-alpine', fastify: 'node:20-alpine', nestjs: 'node:20-alpine', 'go-fiber': 'golang:1.22-alpine',
        postgresql: 'postgres:16-alpine', mongodb: 'mongo:7', mysql: 'mysql:8',
        redis: 'redis:7-alpine', valkey: 'valkey/valkey:7-alpine', memcached: 'memcached:alpine',
    }
    if (tech && map[tech]) return map[tech]
    const fallback: Record<string, string> = { service: 'node:20-alpine', database: 'postgres:16-alpine', cache: 'redis:7-alpine', gateway: 'nginx:alpine' }
    return fallback[type] || 'alpine:latest'
}

function generateDockerCompose(project: Project): string {
    const lines = ['version: "3.9"', '', 'services:']
    const volumes: string[] = []

    for (const comp of project.components) {
        const name = slugify(comp.label)
        const image = nodeImage(comp.type, comp.technology)
        const port = comp.port || '3000'
        const deps = project.connections.filter((c) => c.from === comp.id).map((c) => {
            const tgt = project.components.find((x) => x.id === c.to)
            return tgt ? slugify(tgt.label) : null
        }).filter(Boolean)

        lines.push(`  ${name}:`)
        lines.push(`    image: ${image}`)
        lines.push(`    ports:`)
        lines.push(`      - "${port}:${port}"`)
        if (deps.length > 0) {
            lines.push(`    depends_on:`)
            for (const d of deps) lines.push(`      - ${d}`)
        }
        if (comp.type === 'database') {
            const vol = `${name}-data`
            volumes.push(vol)
            lines.push(`    volumes:`)
            lines.push(`      - ${vol}:/data`)
        }
        lines.push(`    networks:`)
        lines.push(`      - kurguide-net`)
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

function generateClaudeMd(project: Project): string {
    const lines = [
        `# ${project.name}`,
        '',
        '> Auto-generated by **Kurguide Mobile**',
        `> Updated: ${new Date(project.updatedAt).toLocaleDateString('tr-TR')}`,
        '',
        '## Architecture',
        '',
    ]

    const byType = {
        gateway: project.components.filter((c) => c.type === 'gateway'),
        service: project.components.filter((c) => c.type === 'service'),
        database: project.components.filter((c) => c.type === 'database'),
        cache: project.components.filter((c) => c.type === 'cache'),
    }

    for (const [type, comps] of Object.entries(byType)) {
        if (comps.length === 0) continue
        lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}s`)
        for (const c of comps) {
            lines.push(`- **${c.label}** (${c.technology || type}) · port ${c.port || '—'}`)
        }
        lines.push('')
    }

    if (project.connections.length > 0) {
        lines.push('## Connections')
        lines.push('')
        lines.push('```')
        for (const conn of project.connections) {
            const from = project.components.find((c) => c.id === conn.from)?.label || conn.from
            const to = project.components.find((c) => c.id === conn.to)?.label || conn.to
            lines.push(`${from} → ${to}`)
        }
        lines.push('```')
        lines.push('')
    }

    lines.push('## Quick Start')
    lines.push('')
    lines.push('```bash')
    lines.push('docker compose up -d')
    lines.push('docker compose logs -f')
    lines.push('docker compose down')
    lines.push('```')

    return lines.join('\n')
}

function generateJSON(project: Project): string {
    return JSON.stringify({
        name: project.name,
        generatedBy: 'Kurguide Mobile',
        generatedAt: new Date().toISOString(),
        components: project.components,
        connections: project.connections,
    }, null, 2)
}

function generateFileStructure(project: Project): string {
    const lines = ['# Suggested Folder Structure', '', '```', '.']
    const srcTypes = ['service', 'gateway']
    for (const comp of project.components) {
        const folder = slugify(comp.label)
        if (srcTypes.includes(comp.type)) {
            lines.push(`├── ${folder}/`)
            lines.push(`│   ├── src/`)
            lines.push(`│   │   └── index.ts`)
            lines.push(`│   ├── Dockerfile`)
            lines.push(`│   └── package.json`)
        } else {
            lines.push(`├── ${folder}/           # ${comp.type} data`)
        }
    }
    lines.push('├── docker-compose.yml')
    lines.push('├── CLAUDE.md')
    lines.push('└── .env')
    lines.push('```')
    return lines.join('\n')
}

function generateOutput(project: Project, format: ExportFormat): string {
    if (format === 'docker') return generateDockerCompose(project)
    if (format === 'claude') return generateClaudeMd(project)
    if (format === 'json') return generateJSON(project)
    return generateFileStructure(project)
}

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.base },
    formatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.sm },
    formatBtn: {
        flex: 1, minWidth: '44%', padding: spacing.sm, borderRadius: radius.md,
        backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
        alignItems: 'center',
    },
    formatBtnActive: { borderColor: colors.accent + '50', backgroundColor: colors.accentMuted },
    formatIcon: { fontSize: 20, marginBottom: 2 },
    formatLabel: { ...typography.label, color: colors.txtPrimary, textAlign: 'center' },
    formatDesc: { ...typography.mono, color: colors.txtMuted, textAlign: 'center', marginTop: 1 },
    projectBadge: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.md,
        marginBottom: spacing.sm, padding: spacing.sm, borderRadius: radius.sm,
        backgroundColor: colors.accentMuted, borderWidth: 1, borderColor: colors.accent + '30',
    },
    projectBadgeText: { ...typography.mono, color: colors.txtMuted },
    projectBadgeMeta: { ...typography.mono, color: colors.txtMuted },
    outputBox: {
        flex: 1, marginHorizontal: spacing.md, marginBottom: spacing.sm,
        backgroundColor: colors.secondary, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border,
    },
    outputText: { ...typography.mono, color: colors.txtSecondary, lineHeight: 18, fontSize: 11 },
    actions: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingTop: spacing.sm },
    actionBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    copyBtn: { backgroundColor: colors.accent },
    copyText: { ...typography.bodyBold, color: '#fff' },
    shareBtn: { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
    shareText: { ...typography.bodyMedium, color: colors.txtPrimary },
})
