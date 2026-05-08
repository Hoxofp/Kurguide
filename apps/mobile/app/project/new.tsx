import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useState } from 'react'
import { useRouter, Stack } from 'expo-router'
import { useAppStore } from '../../store/appStore'
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens'

/* ═══════════════════════════════════════════════════
   NEW PROJECT SCREEN — Modal
   ═══════════════════════════════════════════════════ */

export default function NewProjectScreen() {
    const [name, setName] = useState('')
    const createProject = useAppStore((s) => s.createProject)
    const router = useRouter()

    const handleCreate = () => {
        if (!name.trim()) return
        createProject(name.trim())
        router.back()
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ title: 'New Project', presentation: 'modal' }} />
            <View style={styles.card}>
                <Text style={styles.title}>New Project</Text>
                <Text style={styles.subtitle}>Give your architecture a name to get started.</Text>

                <TextInput
                    autoFocus
                    value={name}
                    onChangeText={setName}
                    onSubmitEditing={handleCreate}
                    placeholder="e.g. E-Commerce Backend"
                    placeholderTextColor={colors.txtMuted}
                    style={styles.input}
                    returnKeyType="done"
                    maxLength={60}
                />

                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleCreate}
                        style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]}
                        disabled={!name.trim()}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.createText}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.base + 'cc',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: colors.secondary,
        borderTopLeftRadius: radius.lg * 1.5,
        borderTopRightRadius: radius.lg * 1.5,
        padding: spacing.xl,
        borderTopWidth: 1,
        borderColor: colors.border,
        ...shadows.modal,
    },
    title: { ...typography.title, color: colors.txtPrimary, marginBottom: spacing.xs },
    subtitle: { ...typography.body, color: colors.txtSecondary, marginBottom: spacing.lg, lineHeight: 20 },
    input: {
        backgroundColor: colors.raised,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        ...typography.bodyMedium,
        color: colors.txtPrimary,
        marginBottom: spacing.lg,
    },
    actions: { flexDirection: 'row', gap: spacing.sm },
    cancelBtn: {
        flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
        backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border,
        alignItems: 'center',
    },
    cancelText: { ...typography.bodyMedium, color: colors.txtMuted },
    createBtn: {
        flex: 2, paddingVertical: spacing.md, borderRadius: radius.md,
        backgroundColor: colors.accent, alignItems: 'center',
    },
    createBtnDisabled: { opacity: 0.35 },
    createText: { ...typography.bodyBold, color: '#fff' },
})
