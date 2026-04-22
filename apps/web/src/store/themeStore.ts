import { create } from 'zustand'

export type ThemeId =
    | 'midnight' | 'ivory'
    | 'volcanic' | 'oceanic' | 'botanical' | 'aurora'
    | 'sahara' | 'nordic' | 'lavender' | 'pistachio'
    | 'peach' | 'cloud' | 'terracotta' | 'arctic'

export interface ThemePalette {
    id: ThemeId
    name: string
    preview: [string, string, string] // [60%, 30%, 10%] for picker dots
    colors: {
        /* 60 % — Dominant surfaces */
        base: string
        raised: string

        /* 30 % — Secondary (sidebar, panels, cards) */
        secondary: string
        secondaryHover: string
        border: string
        hover: string

        /* 10 % — Accent (interactive, active states) */
        accent: string
        accentMuted: string  // 8-12 % opacity version for backgrounds

        /* Text */
        txtPrimary: string
        txtSecondary: string
        txtMuted: string
    }
}

export const THEMES: ThemePalette[] = [
    // ─── Dark Themes ───────────────────────────────
    {
        id: 'midnight', name: 'Midnight',
        preview: ['#0c0c0e', '#1a1a1f', '#685AFF'],
        colors: {
            base: '#0c0c0e', raised: '#131316',
            secondary: '#111114', secondaryHover: '#1e1e23', border: '#252529', hover: '#2a2a30',
            accent: '#685AFF', accentMuted: 'rgba(104, 90, 255, 0.10)',
            txtPrimary: '#F4F0E4', txtSecondary: '#9c9a92', txtMuted: '#5a5955',
        },
    },
    {
        id: 'volcanic', name: 'Volcanic',
        preview: ['#1a1216', '#2d1520', '#E8913A'],
        colors: {
            base: '#1a1216', raised: '#221920',
            secondary: '#2d1520', secondaryHover: '#3a2030', border: '#3e2535', hover: '#4a2e40',
            accent: '#E8913A', accentMuted: 'rgba(232, 145, 58, 0.10)',
            txtPrimary: '#f5e8e0', txtSecondary: '#b8948a', txtMuted: '#7a5e55',
        },
    },
    {
        id: 'oceanic', name: 'Oceanic',
        preview: ['#0c1929', '#0d3b4a', '#FF6B6B'],
        colors: {
            base: '#0c1929', raised: '#112238',
            secondary: '#0d3b4a', secondaryHover: '#15495a', border: '#1a4a5c', hover: '#1e5568',
            accent: '#FF6B6B', accentMuted: 'rgba(255, 107, 107, 0.10)',
            txtPrimary: '#e0f0f8', txtSecondary: '#7ab8d0', txtMuted: '#3d7a90',
        },
    },
    {
        id: 'botanical', name: 'Botanical',
        preview: ['#0f1c14', '#1a3022', '#D4A843'],
        colors: {
            base: '#0f1c14', raised: '#14261a',
            secondary: '#1a3022', secondaryHover: '#243d2e', border: '#2a4530', hover: '#305038',
            accent: '#D4A843', accentMuted: 'rgba(212, 168, 67, 0.10)',
            txtPrimary: '#e4f0e0', txtSecondary: '#8ab880', txtMuted: '#4d7a42',
        },
    },
    {
        id: 'aurora', name: 'Aurora',
        preview: ['#110f20', '#1c1838', '#00D9FF'],
        colors: {
            base: '#110f20', raised: '#18152a',
            secondary: '#1c1838', secondaryHover: '#282448', border: '#302a55', hover: '#382e60',
            accent: '#00D9FF', accentMuted: 'rgba(0, 217, 255, 0.10)',
            txtPrimary: '#e8e4f5', txtSecondary: '#9a8ec8', txtMuted: '#5c4e88',
        },
    },
    {
        id: 'sahara', name: 'Sahara',
        preview: ['#1e1a14', '#2e2618', '#40B5AD'],
        colors: {
            base: '#1e1a14', raised: '#28221a',
            secondary: '#2e2618', secondaryHover: '#3e3422', border: '#4a3e28', hover: '#564a32',
            accent: '#40B5AD', accentMuted: 'rgba(64, 181, 173, 0.10)',
            txtPrimary: '#f0e8d6', txtSecondary: '#b8a480', txtMuted: '#7a6842',
        },
    },
    {
        id: 'nordic', name: 'Nordic',
        preview: ['#171c24', '#212a38', '#E07A5F'],
        colors: {
            base: '#171c24', raised: '#1e2530',
            secondary: '#212a38', secondaryHover: '#2c3848', border: '#354460', hover: '#3e5070',
            accent: '#E07A5F', accentMuted: 'rgba(224, 122, 95, 0.10)',
            txtPrimary: '#e4eaf0', txtSecondary: '#8a9ab5', txtMuted: '#4e6080',
        },
    },
    {
        id: 'terracotta', name: 'Terracotta',
        preview: ['#1c1210', '#2a1e1a', '#C44D34'],
        colors: {
            base: '#1c1210', raised: '#241a16',
            secondary: '#2a1e1a', secondaryHover: '#382820', border: '#4a3628', hover: '#584232',
            accent: '#C44D34', accentMuted: 'rgba(196, 77, 52, 0.10)',
            txtPrimary: '#f2e6dc', txtSecondary: '#b89888', txtMuted: '#7a5e4e',
        },
    },

    // ─── Light Themes ──────────────────────────────
    {
        id: 'ivory', name: 'Ivory',
        preview: ['#f5f1ea', '#e0dbd2', '#685AFF'],
        colors: {
            base: '#f5f1ea', raised: '#eae5dc',
            secondary: '#e0dbd2', secondaryHover: '#d5cfc4', border: '#ccc6bb', hover: '#d8d2c7',
            accent: '#685AFF', accentMuted: 'rgba(104, 90, 255, 0.08)',
            txtPrimary: '#1a1714', txtSecondary: '#5c564d', txtMuted: '#9b9589',
        },
    },
    {
        id: 'lavender', name: 'Lavender',
        preview: ['#F0EBF8', '#DDD5ED', '#5B3DC8'],
        colors: {
            base: '#F0EBF8', raised: '#E6E0F2',
            secondary: '#DDD5ED', secondaryHover: '#D0C6E4', border: '#C4B8DA', hover: '#D4CCE6',
            accent: '#5B3DC8', accentMuted: 'rgba(91, 61, 200, 0.08)',
            txtPrimary: '#1C1530', txtSecondary: '#5A4E78', txtMuted: '#9488A8',
        },
    },
    {
        id: 'pistachio', name: 'Pistachio',
        preview: ['#EDF2E8', '#D4DFC8', '#C44D34'],
        colors: {
            base: '#EDF2E8', raised: '#E2E8DC',
            secondary: '#D4DFC8', secondaryHover: '#C8D4BA', border: '#B8C8A8', hover: '#D0D8C2',
            accent: '#C44D34', accentMuted: 'rgba(196, 77, 52, 0.08)',
            txtPrimary: '#1A2014', txtSecondary: '#4A5840', txtMuted: '#8A9680',
        },
    },
    {
        id: 'peach', name: 'Peach',
        preview: ['#FDF0E8', '#F0D8C8', '#2C4A6E'],
        colors: {
            base: '#FDF0E8', raised: '#F5E6DA',
            secondary: '#F0D8C8', secondaryHover: '#E8CEB8', border: '#DCC0AA', hover: '#ECD4C2',
            accent: '#2C4A6E', accentMuted: 'rgba(44, 74, 110, 0.08)',
            txtPrimary: '#2A1E14', txtSecondary: '#6A5040', txtMuted: '#A8947E',
        },
    },
    {
        id: 'cloud', name: 'Cloud',
        preview: ['#F0F4F8', '#DCE4EE', '#0891B2'],
        colors: {
            base: '#F0F4F8', raised: '#E4EAF0',
            secondary: '#DCE4EE', secondaryHover: '#CED8E4', border: '#BCC8D8', hover: '#D4DCE8',
            accent: '#0891B2', accentMuted: 'rgba(8, 145, 178, 0.08)',
            txtPrimary: '#141C28', txtSecondary: '#4A5A70', txtMuted: '#8898AE',
        },
    },
    {
        id: 'arctic', name: 'Arctic',
        preview: ['#edf2f8', '#d0d8e4', '#2563EB'],
        colors: {
            base: '#edf2f8', raised: '#dfe6ef',
            secondary: '#d0d8e4', secondaryHover: '#c5cfdc', border: '#b8c4d4', hover: '#cad4e0',
            accent: '#2563EB', accentMuted: 'rgba(37, 99, 235, 0.08)',
            txtPrimary: '#141c28', txtSecondary: '#4a5568', txtMuted: '#8b97a8',
        },
    },
]

interface ThemeState {
    activeTheme: ThemeId
    setTheme: (id: ThemeId) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
    activeTheme: 'midnight',
    setTheme: (id) => {
        set({ activeTheme: id })
        applyTheme(id)
    },
}))

export function applyTheme(id: ThemeId) {
    const theme = THEMES.find((t) => t.id === id)
    if (!theme) return
    const root = document.documentElement
    const c = theme.colors
    root.style.setProperty('--surface-base', c.base)
    root.style.setProperty('--surface-raised', c.raised)
    root.style.setProperty('--surface-secondary', c.secondary)
    root.style.setProperty('--surface-secondary-hover', c.secondaryHover)
    root.style.setProperty('--surface-border', c.border)
    root.style.setProperty('--surface-hover', c.hover)
    root.style.setProperty('--accent', c.accent)
    root.style.setProperty('--accent-muted', c.accentMuted)
    root.style.setProperty('--txt-primary', c.txtPrimary)
    root.style.setProperty('--txt-secondary', c.txtSecondary)
    root.style.setProperty('--txt-muted', c.txtMuted)
}
