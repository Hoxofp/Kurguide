import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useAppStore } from '../../store/appStore'
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens'

/* ═══════════════════════════════════════════════════
   ARCHITECTURE SCREEN — Proje detayı + bileşen listesi
   Hafta 1 Mobil karşılığı
   ═══════════════════════════════════════════════════ */

const nodeColors: Record<string, string> = {
    service: colors.service,
    database: colors.database,
    cache: colors.cache,
    gateway: colors.gateway,
}

const nodeIcons: Record<string, string> = {
    service: '⬡',
    database: '⬢',
    cache: '⚡',
    gateway: '◈',
}

export default function ArchitectureScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const projects = useAppStore((s) => s.projects)
    const project = projects.find((p) => p.id === id)

    if (!project) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFound}>Project not found</Text>
            </View>
        )
    }

    const grouped = {
        gateway: project.components.filter((c) => c.type === 'gateway'),
        service: project.components.filter((c) => c.type === 'service'),
        database: project.components.filter((c) => c.type === 'database'),
        cache: project.components.filter((c) => c.type === 'cache'),
    }

    return (
        <>
            <Stack.Screen options={{ title: project.name }} />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* ── Overview Cards ── */}
                <View style={styles.overviewRow}>
                    {Object.entries(grouped).map(([type, comps]) => (
                        comps.length > 0 && (
                            <View key={type} style={[styles.overviewCard, { borderColor: nodeColors[type] + '40' }]}>
                                <Text style={[styles.overviewIcon, { color: nodeColors[type] }]}>{nodeIcons[type]}</Text>
                                <Text style={[styles.overviewCount, { color: nodeColors[type] }]}>{comps.length}</Text>
                                <Text style={styles.overviewType}>{type}</Text>
                            </View>
                        )
                    ))}
                </View>

                {/* ── Connection Map (ASCII-style) ── */}
                {project.connections.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Connections</Text>
                        <View style={styles.connectionList}>
                            {project.connections.map((conn, i) => {
                                const from = project.components.find((c) => c.id === conn.from)
                                const to = project.components.find((c) => c.id === conn.to)
                                return (
                                    <View key={i} style={styles.connRow}>
                                        <Text style={[styles.connLabel, { color: nodeColors[from?.type || 'service'] }]}>
                                            {from?.label || conn.from}
                                        </Text>
                                        <Text style={styles.connArrow}>→</Text>
                                        <Text style={[styles.connLabel, { color: nodeColors[to?.type || 'service'] }]}>
                                            {to?.label || conn.to}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}

                {/* ── Component Details ── */}
                {(Object.entries(grouped) as [string, typeof project.components][]).map(([type, comps]) =>
                    comps.length > 0 && (
                        <View key={type} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: nodeColors[type] }]}>
                                {nodeIcons[type]}  {type.charAt(0).toUpperCase() + type.slice(1)}s
                            </Text>
                            {comps.map((comp) => (
                                <ComponentCard key={comp.id} comp={comp} type={type} />
                            ))}
                        </View>
                    )
                )}
            </ScrollView>
        </>
    )
}

function ComponentCard({ comp, type }: { comp: ReturnType<typeof useAppStore.getState>['projects'][number]['components'][number]; type: string }) {
    const c = nodeColors[type] || colors.txtMuted
    return (
        <View style={[styles.compCard, { borderLeftColor: c }]}>
            <View style={styles.compHeader}>
                <Text style={[styles.compIcon, { color: c }]}>{nodeIcons[type]}</Text>
                <View style={styles.compInfo}>
                    <Text style={styles.compName}>{comp.label}</Text>
                    {comp.description && <Text style={styles.compDesc}>{comp.description}</Text>}
                </View>
            </View>
            <View style={styles.compMeta}>
                {comp.technology && (
                    <View style={[styles.tag, { backgroundColor: c + '15', borderColor: c + '40' }]}>
                        <Text style={[styles.tagText, { color: c }]}>{comp.technology}</Text>
                    </View>
                )}
                {comp.port && (
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>:{comp.port}</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.base },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFound: { ...typography.body, color: colors.txtMuted },
    overviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md },
    overviewCard: {
        flex: 1, minWidth: '22%', padding: spacing.sm, borderRadius: radius.md,
        backgroundColor: colors.secondary, borderWidth: 1, alignItems: 'center',
    },
    overviewIcon: { fontSize: 18, marginBottom: 2 },
    overviewCount: { ...typography.title, fontSize: 24 },
    overviewType: { ...typography.mono, color: colors.txtMuted, textTransform: 'capitalize' },
    section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
    sectionTitle: { ...typography.label, color: colors.txtMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
    connectionList: {
        backgroundColor: colors.secondary, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    },
    connRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    connLabel: { ...typography.label, flex: 1, textAlign: 'center' },
    connArrow: { ...typography.body, color: colors.txtMuted },
    compCard: {
        backgroundColor: colors.secondary, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3,
        padding: spacing.md, marginBottom: spacing.sm, ...shadows.card,
    },
    compHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
    compIcon: { fontSize: 20, marginTop: 1 },
    compInfo: { flex: 1 },
    compName: { ...typography.bodyBold, color: colors.txtPrimary },
    compDesc: { ...typography.body, color: colors.txtSecondary, fontSize: 12, marginTop: 2 },
    compMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.border, borderWidth: 1, borderColor: colors.border },
    tagText: { ...typography.mono, color: colors.txtMuted, fontSize: 10 },
})
