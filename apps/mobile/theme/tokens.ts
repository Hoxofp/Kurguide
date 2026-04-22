import { StyleSheet } from 'react-native'

// Kurguide Design Tokens — Mobile
export const colors = {
    // Surfaces
    base: '#0c0c0e',
    raised: '#131316',
    secondary: '#111114',
    border: '#252529',
    hover: '#2a2a30',

    // Accent
    accent: '#685AFF',
    accentMuted: 'rgba(104, 90, 255, 0.12)',

    // Text
    txtPrimary: '#F4F0E4',
    txtSecondary: '#9c9a92',
    txtMuted: '#5a5955',

    // Status
    service: '#685AFF',
    database: '#44A194',
    cache: '#FF4400',
    gateway: '#40B5AD',
    danger: '#FF4400',
    success: '#44A194',
    warning: '#E8913A',
}

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
}

export const radius = {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
}

export const typography = {
    caption: { fontSize: 10, fontWeight: '400' as const, letterSpacing: 0.2 },
    body: { fontSize: 13, fontWeight: '400' as const },
    bodyMedium: { fontSize: 13, fontWeight: '500' as const },
    bodyBold: { fontSize: 13, fontWeight: '700' as const },
    label: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
    mono: { fontSize: 10, fontFamily: 'monospace' as const },
    title: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
    subtitle: { fontSize: 15, fontWeight: '600' as const },
}

export const shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    modal: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
}

export const nodeColors: Record<string, string> = {
    service: colors.service,
    database: colors.database,
    cache: colors.cache,
    gateway: colors.gateway,
}
