import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Animated,
} from 'react-native'
import { useState, useRef } from 'react'
import { useAppStore, selectActiveProject, type Alternative } from '../../store/appStore'
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens'

/* ═══════════════════════════════════════════════════
   AI SUGGEST SCREEN — Hafta 3+4+5 Mobil
   - Kullanıcı prompt girer
   - Mock AI 2-3 alternatif üretir
   - Tradeoff kartları gösterir
   - Seçilen alternatifi aktif projeye kaydeder
   ═══════════════════════════════════════════════════ */

export default function AIScreen() {
    const [prompt, setPrompt] = useState('')
    const { alternatives, isGenerating, setAlternatives, setGenerating, clearAlternatives, projects, activeProjectId } = useAppStore()
    const [selectedIdx, setSelectedIdx] = useState(0)
    const pulseAnim = useRef(new Animated.Value(1)).current

    const activeProject = projects.find((p) => p.id === activeProjectId)

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ).start()
    }

    const handleGenerate = () => {
        if (!prompt.trim() || isGenerating) return
        setGenerating(true)
        startPulse()
        // Mock generation
        setTimeout(() => {
            setAlternatives(generateMockAlternatives(prompt))
            setGenerating(false)
            setSelectedIdx(0)
            pulseAnim.stopAnimation()
            pulseAnim.setValue(1)
        }, 1800)
    }

    const handleApply = () => {
        if (!alternatives[selectedIdx]) return
        const alt = alternatives[selectedIdx]
        const store = useAppStore.getState()
        if (!store.activeProjectId) return
        const updatedProjects = store.projects.map((p) =>
            p.id === store.activeProjectId
                ? { ...p, components: alt.components, connections: alt.connections, updatedAt: Date.now() }
                : p
        )
        useAppStore.setState({ projects: updatedProjects, alternatives: [] })
        setPrompt('')
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Context badge */}
                {activeProject && (
                    <View style={styles.contextBadge}>
                        <Text style={styles.contextText}>Suggesting for: </Text>
                        <Text style={[styles.contextText, { color: colors.accent }]}>{activeProject.name}</Text>
                    </View>
                )}

                {/* Alternatives */}
                {alternatives.length > 0 && (
                    <View style={styles.section}>
                        {/* Tab bar */}
                        <View style={styles.altTabs}>
                            {alternatives.map((alt, i) => (
                                <TouchableOpacity
                                    key={alt.id}
                                    onPress={() => setSelectedIdx(i)}
                                    style={[styles.altTab, i === selectedIdx && styles.altTabActive]}
                                >
                                    <Text style={[styles.altTabText, i === selectedIdx && { color: colors.accent }]}>
                                        Alt {i + 1}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Active alternative card */}
                        <AlternativeCard alt={alternatives[selectedIdx]} onApply={handleApply} onDiscard={clearAlternatives} />
                    </View>
                )}

                {/* Empty state */}
                {alternatives.length === 0 && !isGenerating && (
                    <View style={styles.emptyState}>
                        <Animated.Text style={[styles.emptyIcon, { transform: [{ scale: pulseAnim }] }]}>✦</Animated.Text>
                        <Text style={styles.emptyTitle}>AI Architecture Suggester</Text>
                        <Text style={styles.emptyDesc}>
                            Describe your project and the AI will generate 2-3 architecture alternatives with tradeoff analysis.
                        </Text>
                        <View style={styles.exampleChips}>
                            {['E-commerce platform', 'Real-time chat app', 'REST API backend'].map((ex) => (
                                <TouchableOpacity
                                    key={ex}
                                    onPress={() => setPrompt(ex)}
                                    style={styles.chip}
                                >
                                    <Text style={styles.chipText}>{ex}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Loading */}
                {isGenerating && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={colors.accent} size="small" />
                        <Text style={styles.loadingText}>Thinking of architectures...</Text>
                    </View>
                )}
            </ScrollView>

            {/* ── Prompt Input ── */}
            <View style={styles.inputArea}>
                <View style={styles.inputRow}>
                    <TextInput
                        value={prompt}
                        onChangeText={setPrompt}
                        placeholder="Describe your architecture..."
                        placeholderTextColor={colors.txtMuted}
                        style={styles.promptInput}
                        multiline
                        maxLength={300}
                        returnKeyType="send"
                        onSubmitEditing={handleGenerate}
                    />
                    <TouchableOpacity
                        onPress={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        style={[styles.sendBtn, (!prompt.trim() || isGenerating) && styles.sendBtnDisabled]}
                        activeOpacity={0.8}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.sendIcon}>→</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

/* ─── Alternative Card ──────────────────────────────── */

function AlternativeCard({ alt, onApply, onDiscard }: { alt: Alternative; onApply: () => void; onDiscard: () => void }) {
    const tradeoffLabels: Record<string, string> = {
        speed: 'Speed', cost: 'Cost', scalability: 'Scalability', complexity: 'Complexity', simplicity: 'Simplicity'
    }
    const tradeoffColors = (v: number) => v >= 4 ? colors.success : v >= 3 ? colors.warning : colors.danger

    return (
        <View style={styles.altCard}>
            <Text style={styles.altName}>{alt.name}</Text>
            <Text style={styles.altDesc}>{alt.description}</Text>

            {/* Components preview */}
            <View style={styles.componentList}>
                {alt.components.slice(0, 4).map((comp) => (
                    <ComponentPill key={comp.id} type={comp.type} label={comp.label} />
                ))}
                {alt.components.length > 4 && (
                    <View style={styles.morePill}>
                        <Text style={styles.morePillText}>+{alt.components.length - 4}</Text>
                    </View>
                )}
            </View>

            {/* Tradeoffs */}
            <Text style={styles.tradeoffTitle}>Tradeoffs</Text>
            {(Object.entries(alt.tradeoffs) as [string, number][]).map(([key, value]) => (
                <View key={key} style={styles.tradeoffRow}>
                    <Text style={styles.tradeoffLabel}>{tradeoffLabels[key] || key}</Text>
                    <View style={styles.bars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.bar,
                                    {
                                        backgroundColor: i <= value ? tradeoffColors(value) : colors.border,
                                        opacity: i <= value ? 1 : 0.3,
                                    }
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={[styles.barScore, { color: tradeoffColors(value) }]}>{value}/5</Text>
                </View>
            ))}

            {/* Actions */}
            <View style={styles.altActions}>
                <TouchableOpacity onPress={onApply} style={styles.applyBtn}>
                    <Text style={styles.applyText}>Apply to Project</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDiscard} style={styles.discardBtn}>
                    <Text style={styles.discardText}>Discard</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

function ComponentPill({ type, label }: { type: string; label: string }) {
    const colorMap: Record<string, string> = { service: colors.service, database: colors.database, cache: colors.cache, gateway: colors.gateway }
    const c = colorMap[type] || colors.txtMuted
    return (
        <View style={[styles.compPill, { borderColor: c + '40', backgroundColor: c + '15' }]}>
            <Text style={[styles.compPillText, { color: c }]}>{label}</Text>
        </View>
    )
}

/* ─── Mock AI ────────────────────────────────────────── */

function generateMockAlternatives(prompt: string): Alternative[] {
    const isEcom = prompt.toLowerCase().includes('e-commerce') || prompt.toLowerCase().includes('shop')
    const ts = Date.now()
    return [
        {
            id: `alt-mono-${ts}`, name: 'Monolithic',
            description: 'Simple, fast to build. Perfect for MVPs and small teams.',
            components: [
                { id: `gw-${ts}`, type: 'gateway', label: 'Nginx', technology: 'nginx', port: '80' },
                { id: `svc-${ts}`, type: 'service', label: 'Monolith API', technology: 'express', port: '3000' },
                { id: `db-${ts}`, type: 'database', label: 'PostgreSQL', technology: 'postgresql', port: '5432' },
            ],
            connections: [{ from: `gw-${ts}`, to: `svc-${ts}` }, { from: `svc-${ts}`, to: `db-${ts}` }],
            tradeoffs: { speed: 5, cost: 5, scalability: 2, complexity: 1, simplicity: 5 }
        },
        {
            id: `alt-micro-${ts}`, name: 'Microservices',
            description: 'Highly scalable, team-friendly. Best for growing products.',
            components: [
                { id: `gw2-${ts}`, type: 'gateway', label: 'Kong Gateway', technology: 'kong', port: '8000' },
                { id: `svc-auth-${ts}`, type: 'service', label: 'Auth Service', technology: 'fastify', port: '3001' },
                { id: `svc-core-${ts}`, type: 'service', label: isEcom ? 'Orders Service' : 'Core API', technology: 'nestjs', port: '3002' },
                { id: `db2-${ts}`, type: 'database', label: 'PostgreSQL', technology: 'postgresql', port: '5432' },
                { id: `cache2-${ts}`, type: 'cache', label: 'Redis', technology: 'redis', port: '6379' },
            ],
            connections: [
                { from: `gw2-${ts}`, to: `svc-auth-${ts}` }, { from: `gw2-${ts}`, to: `svc-core-${ts}` },
                { from: `svc-auth-${ts}`, to: `db2-${ts}` }, { from: `svc-core-${ts}`, to: `db2-${ts}` },
                { from: `svc-auth-${ts}`, to: `cache2-${ts}` },
            ],
            tradeoffs: { speed: 3, cost: 3, scalability: 5, complexity: 4, simplicity: 2 }
        },
        {
            id: `alt-perf-${ts}`, name: 'High Performance',
            description: 'Redis caching + CDN-ready. Built for massive traffic.',
            components: [
                { id: `gw3-${ts}`, type: 'gateway', label: 'Traefik', technology: 'traefik', port: '80' },
                { id: `svc3-${ts}`, type: 'service', label: 'Go Fiber API', technology: 'go-fiber', port: '3000' },
                { id: `db3-${ts}`, type: 'database', label: 'MongoDB', technology: 'mongodb', port: '27017' },
                { id: `cache3-${ts}`, type: 'cache', label: 'Redis Cluster', technology: 'valkey', port: '6379' },
            ],
            connections: [
                { from: `gw3-${ts}`, to: `svc3-${ts}` }, { from: `svc3-${ts}`, to: `db3-${ts}` },
                { from: `svc3-${ts}`, to: `cache3-${ts}` },
            ],
            tradeoffs: { speed: 5, cost: 2, scalability: 5, complexity: 5, simplicity: 1 }
        }
    ]
}

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.base },
    scroll: { flex: 1 },
    contextBadge: {
        flexDirection: 'row', alignItems: 'center', margin: spacing.md,
        padding: spacing.sm, borderRadius: radius.sm,
        backgroundColor: colors.accentMuted, borderWidth: 1, borderColor: colors.accent + '30',
    },
    contextText: { ...typography.mono, color: colors.txtMuted },
    section: { paddingHorizontal: spacing.md },
    altTabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    altTab: {
        flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm,
        backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
        alignItems: 'center',
    },
    altTabActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent + '40' },
    altTabText: { ...typography.label, color: colors.txtMuted },
    altCard: {
        backgroundColor: colors.secondary, borderRadius: radius.lg,
        borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...shadows.card,
    },
    altName: { ...typography.subtitle, color: colors.txtPrimary, marginBottom: spacing.xs },
    altDesc: { ...typography.body, color: colors.txtSecondary, marginBottom: spacing.md, lineHeight: 20 },
    componentList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
    compPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
    compPillText: { ...typography.mono, fontSize: 10 },
    morePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.border },
    morePillText: { ...typography.mono, color: colors.txtMuted },
    tradeoffTitle: { ...typography.mono, color: colors.txtMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
    tradeoffRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    tradeoffLabel: { ...typography.body, color: colors.txtSecondary, width: 90 },
    bars: { flex: 1, flexDirection: 'row', gap: 3 },
    bar: { flex: 1, height: 12, borderRadius: 2 },
    barScore: { ...typography.mono, width: 30, textAlign: 'right' },
    altActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    applyBtn: {
        flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
        backgroundColor: colors.accent, alignItems: 'center',
    },
    applyText: { ...typography.bodyBold, color: '#fff' },
    discardBtn: {
        paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md,
        backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
    },
    discardText: { ...typography.body, color: colors.txtMuted },
    emptyState: { alignItems: 'center', padding: spacing.xl, paddingTop: 60 },
    emptyIcon: { fontSize: 48, color: colors.accent, marginBottom: spacing.md },
    emptyTitle: { ...typography.title, color: colors.txtPrimary, marginBottom: spacing.sm, textAlign: 'center' },
    emptyDesc: { ...typography.body, color: colors.txtSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
    exampleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg, justifyContent: 'center' },
    chip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
        backgroundColor: colors.accentMuted, borderWidth: 1, borderColor: colors.accent + '30',
    },
    chipText: { ...typography.label, color: colors.accent },
    loadingCard: {
        flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center',
        margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.secondary,
        borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    },
    loadingText: { ...typography.body, color: colors.txtSecondary },
    inputArea: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: colors.base, borderTopWidth: 1, borderTopColor: colors.border,
        padding: spacing.md, paddingBottom: spacing.lg,
    },
    inputRow: {
        flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end',
        backgroundColor: colors.secondary, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border, padding: spacing.sm,
    },
    promptInput: { flex: 1, ...typography.body, color: colors.txtPrimary, maxHeight: 100, padding: spacing.xs },
    sendBtn: {
        width: 40, height: 40, borderRadius: radius.md,
        backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.3 },
    sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
})
