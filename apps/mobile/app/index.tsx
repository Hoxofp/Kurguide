import { Redirect } from 'expo-router'

// Redirect root to tabs
export default function Index() {
    return <Redirect href="/(tabs)" />
}
