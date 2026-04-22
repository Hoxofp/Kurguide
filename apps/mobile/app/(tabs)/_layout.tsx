import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { colors } from '../../theme/tokens'

function TabIcon({ color, children }: { color: string; children: React.ReactNode }) {
    return <View style={[styles.icon, { opacity: color === colors.accent ? 1 : 0.45 }]}>{children}</View>
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: colors.secondary,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.txtMuted,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
                headerStyle: { backgroundColor: colors.secondary },
                headerTintColor: colors.txtPrimary,
                headerTitleStyle: { fontWeight: '700', fontSize: 16 },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Projects',
                    tabBarIcon: ({ color }) => (
                        <TabIcon color={color}>
                            <FolderIcon color={color} />
                        </TabIcon>
                    ),
                    headerTitle: 'Kurguide',
                    headerRight: () => (
                        <View style={{ marginRight: 16 }}>
                            <KBadge />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: 'AI Suggest',
                    tabBarIcon: ({ color }) => (
                        <TabIcon color={color}>
                            <SparkleIcon color={color} />
                        </TabIcon>
                    ),
                    headerTitle: 'AI Architect',
                }}
            />
            <Tabs.Screen
                name="export"
                options={{
                    title: 'Export',
                    tabBarIcon: ({ color }) => (
                        <TabIcon color={color}>
                            <ExportIcon color={color} />
                        </TabIcon>
                    ),
                    headerTitle: 'Export',
                }}
            />
        </Tabs>
    )
}

// ─── Inline SVG Placeholders (RN uses vector-icons or custom) ─
import { Text } from 'react-native'

function FolderIcon({ color }: { color: string }) {
    return <Text style={{ color, fontSize: 20 }}>◫</Text>
}
function SparkleIcon({ color }: { color: string }) {
    return <Text style={{ color, fontSize: 20 }}>✦</Text>
}
function ExportIcon({ color }: { color: string }) {
    return <Text style={{ color, fontSize: 20 }}>↑</Text>
}
function KBadge() {
    return (
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: colors.accentMuted, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>K</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    icon: { alignItems: 'center', justifyContent: 'center' },
})
