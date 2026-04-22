import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { colors } from '../theme/tokens'

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.root}>
            <StatusBar style="light" backgroundColor={colors.base} />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.secondary },
                    headerTintColor: colors.txtPrimary,
                    headerTitleStyle: { fontWeight: '600', fontSize: 15 },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.base },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Kurguide', headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="project/[id]" options={{ title: 'Architecture' }} />
                <Stack.Screen name="project/new" options={{ title: 'New Project', presentation: 'modal' }} />
            </Stack>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1 },
})
