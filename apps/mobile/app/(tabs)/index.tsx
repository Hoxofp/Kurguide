import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    StyleSheet, Alert, Animated, Pressable,
} from 'react-native'
import { useState, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useAppStore, selectActiveProject, type Project } from '../../store/appStore'
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens'

/* ═══════════════════════════════════════════════════
   HOME SCREEN — Project List (Hafta 6)
   ═══════════════════════════════════════════════════ */

export default function HomeScreen() {
    const { projects, activeProjectId, createProject, deleteProject, renameProject, switchProject } = useAppStore()
    const router = useRouter()
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const handleCreate = () => {
        if (!newName.trim()) return
        createProject(newName.trim())
        setNewName('')
        setCreating(false)
    }

    const handleDelete = (proj: Project) => {
        if (projects.length <= 1) {
            Alert.alert('Cannot delete', 'You must have at least one project.')
            return
        }
        Alert.alert(
            'Delete Project',
            `Are you sure you want to delete "${proj.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteProject(proj.id) },
            ]
        )
    }

    const handleRenameStart = (proj: Project) => {
        setEditingId(proj.id)
        setEditName(proj.name)
    }

    const handleRenameCommit = () => {
        if (editingId && editName.trim()) renameProject(editingId, editName.trim())
        setEditingId(null)
    }

    const handleOpen = (proj: Project) => {
        switchProject(proj.id)
        router.push(`/project/${proj.id}`)
    }

    return (
        <View style={styles.container}>
            {/* ── Header Stats ── */}
            <View style={styles.statsRow}>
                <StatChip label="Projects" value={projects.length.toString()} />
                <StatChip
                    label="Active"
                    value={projects.find((p) => p.id === activeProjectId)?.name?.slice(0, 12) + '...' || '—'}
                    accent
                />
            </View>

            <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }}>
                {projects.map((proj) => (
                    <ProjectCard
                        key={proj.id}
                        project={proj}
                        isActive={proj.id === activeProjectId}
                        isEditing={editingId === proj.id}
                        editName={editName}
                        onEditNameChange={setEditName}
                        onOpen={() => handleOpen(proj)}
                        onRename={() => handleRenameStart(proj)}
                        onRenameCommit={handleRenameCommit}
                        onDelete={() => handleDelete(proj)}
                    />
                ))}
            </ScrollView>

            {/* ── Create Button ── */}
            <View style={styles.fab}>
                {creating ? (
                    <View style={styles.createInput}>
                        <TextInput
                            autoFocus
                            value={newName}
                            onChangeText={setNewName}
                            onSubmitEditing={handleCreate}
                            placeholder="Project name..."
                            placeholderTextColor={colors.txtMuted}
                            style={styles.input}
                            returnKeyType="done"
                        />
                        <TouchableOpacity onPress={handleCreate} style={styles.addBtn}>
                            <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCreating(false)} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setCreating(true)} style={styles.createBtn} activeOpacity={0.85}>
                        <Text style={styles.createBtnText}>+ New Project</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

/* ─── Project Card ────────────────────────────────── */

function ProjectCard({
    project, isActive, isEditing, editName, onEditNameChange,
    onOpen, onRename, onRenameCommit, onDelete
}: {
    project: Project
    isActive: boolean
    isEditing: boolean
    editName: string
    onEditNameChange: (v: string) => void
    onOpen: () => void
    onRename: () => void
    onRenameCommit: () => void
    onDelete: () => void
}) {
    const updatedAt = new Date(project.updatedAt)
    const dateStr = updatedAt.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })

    return (
        <Pressable
            onPress={onOpen}
            style={({ pressed }) => [
                styles.card,
                isActive && styles.cardActive,
                pressed && styles.cardPressed,
            ]}
        >
            {/* Active indicator */}
            {isActive && <View style={styles.activeBar} />}

            <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                    <View style={[styles.cardIcon, { backgroundColor: isActive ? colors.accentMuted : colors.secondary }]}>
                        <Text style={{ color: isActive ? colors.accent : colors.txtMuted, fontSize: 14 }}>◫</Text>
                    </View>
                    <View style={styles.cardText}>
                        {isEditing ? (
                            <TextInput
                                autoFocus
                                value={editName}
                                onChangeText={onEditNameChange}
                                onSubmitEditing={onRenameCommit}
                                onBlur={onRenameCommit}
                                style={styles.renameInput}
                                returnKeyType="done"
                            />
                        ) : (
                            <Text style={[styles.cardTitle, isActive && { color: colors.accent }]} numberOfLines={1}>
                                {project.name}
                            </Text>
                        )}
                        <Text style={styles.cardMeta}>
                            {project.components.length} components · {dateStr}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={onRename} style={styles.actionBtn} hitSlop={8}>
                        <Text style={styles.actionIcon}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={8}>
                        <Text style={[styles.actionIcon, { color: colors.danger }]}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Component type badges */}
            {project.components.length > 0 && (
                <View style={styles.badges}>
                    {Array.from(new Set(project.components.map((c) => c.type))).map((type) => (
                        <TypeBadge key={type} type={type as any} count={project.components.filter((c) => c.type === type).length} />
                    ))}
                </View>
            )}
        </Pressable>
    )
}

function TypeBadge({ type, count }: { type: 'service' | 'database' | 'cache' | 'gateway'; count: number }) {
    const colorMap = { service: colors.service, database: colors.database, cache: colors.cache, gateway: colors.gateway }
    const c = colorMap[type]
    return (
        <View style={[styles.badge, { borderColor: c + '40', backgroundColor: c + '15' }]}>
            <Text style={[styles.badgeText, { color: c }]}>{count} {type}</Text>
        </View>
    )
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <View style={[styles.statChip, accent && styles.statChipAccent]}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, accent && { color: colors.accent }]}>{value}</Text>
        </View>
    )
}

/* ─── Styles ────────────────────────────────────────── */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.base },
    statsRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.sm },
    statChip: {
        flex: 1, padding: spacing.sm, borderRadius: radius.md,
        backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
    },
    statChipAccent: { borderColor: colors.accent + '30', backgroundColor: colors.accentMuted },
    statLabel: { ...typography.mono, color: colors.txtMuted, marginBottom: 2 },
    statValue: { ...typography.bodyBold, color: colors.txtPrimary },
    list: { flex: 1, paddingHorizontal: spacing.md },
    card: {
        borderRadius: radius.lg, marginBottom: spacing.sm,
        backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
        overflow: 'hidden', ...shadows.card,
    },
    cardActive: { borderColor: colors.accent + '40', backgroundColor: colors.raised },
    cardPressed: { opacity: 0.85 },
    activeBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.accent, borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, paddingLeft: spacing.md + 6 },
    cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    cardIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    cardText: { flex: 1 },
    cardTitle: { ...typography.bodyMedium, color: colors.txtPrimary, marginBottom: 2 },
    cardMeta: { ...typography.mono, color: colors.txtMuted },
    cardActions: { flexDirection: 'row', gap: spacing.xs },
    actionBtn: { padding: spacing.xs },
    actionIcon: { color: colors.txtMuted, fontSize: 14 },
    renameInput: { ...typography.bodyMedium, color: colors.accent, borderBottomWidth: 1, borderBottomColor: colors.accent, padding: 0 },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, paddingLeft: spacing.md + 6 },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
    badgeText: { ...typography.mono, fontSize: 9 },
    fab: { position: 'absolute', bottom: spacing.xl, left: spacing.md, right: spacing.md },
    createBtn: {
        backgroundColor: colors.accent, borderRadius: radius.md,
        paddingVertical: spacing.md, alignItems: 'center', ...shadows.card,
    },
    createBtnText: { ...typography.bodyBold, color: '#fff' },
    createInput: {
        flexDirection: 'row', gap: spacing.sm, alignItems: 'center',
        backgroundColor: colors.raised, borderRadius: radius.md, borderWidth: 1,
        borderColor: colors.accent + '60', padding: spacing.sm, ...shadows.card,
    },
    input: { flex: 1, ...typography.body, color: colors.txtPrimary, padding: spacing.xs },
    addBtn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    addBtnText: { ...typography.label, color: '#fff' },
    cancelBtn: { padding: spacing.xs },
    cancelText: { color: colors.txtMuted, fontSize: 14 },
})
