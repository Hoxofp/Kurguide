import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

/* ─── Types ─────────────────────────────────────────── */
export interface ComponentNode {
    id: string
    type: 'service' | 'database' | 'cache' | 'gateway'
    label: string
    description?: string
    technology?: string
    port?: string
    envVars?: string
}

export interface Connection {
    from: string
    to: string
}

export interface Project {
    id: string
    name: string
    createdAt: number
    updatedAt: number
    components: ComponentNode[]
    connections: Connection[]
}

export interface Alternative {
    id: string
    name: string
    description: string
    components: ComponentNode[]
    connections: Connection[]
    tradeoffs: {
        speed: number
        cost: number
        scalability: number
        complexity: number
        simplicity: number
    }
}

export interface AppState {
    projects: Project[]
    activeProjectId: string | null
    alternatives: Alternative[]
    isGenerating: boolean

    // Actions
    createProject: (name: string) => string
    deleteProject: (id: string) => void
    renameProject: (id: string, name: string) => void
    switchProject: (id: string) => void
    setAlternatives: (alts: Alternative[]) => void
    clearAlternatives: () => void
    setGenerating: (v: boolean) => void
    importJSON: (json: string) => void
}

/* ─── Default ───────────────────────────────────────── */
const DEFAULT_PROJECT: Project = {
    id: 'default',
    name: 'My Architecture',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    components: [
        { id: 'gw-1', type: 'gateway', label: 'API Gateway', technology: 'nginx', port: '80' },
        { id: 'svc-1', type: 'service', label: 'Backend Service', technology: 'express', port: '3000' },
        { id: 'db-1', type: 'database', label: 'PostgreSQL', technology: 'postgresql', port: '5432' },
        { id: 'cache-1', type: 'cache', label: 'Redis', technology: 'redis', port: '6379' },
    ],
    connections: [
        { from: 'gw-1', to: 'svc-1' },
        { from: 'svc-1', to: 'db-1' },
        { from: 'svc-1', to: 'cache-1' },
    ],
}

/* ─── Store ──────────────────────────────────────────── */
export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            projects: [DEFAULT_PROJECT],
            activeProjectId: 'default',
            alternatives: [],
            isGenerating: false,

            createProject: (name) => {
                const id = `proj-${Date.now()}`
                const newProject: Project = {
                    id,
                    name: name.trim() || 'Untitled',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    components: [],
                    connections: [],
                }
                set((s) => ({ projects: [...s.projects, newProject], activeProjectId: id }))
                return id
            },

            deleteProject: (id) => {
                const { projects, activeProjectId } = get()
                if (projects.length <= 1) return
                const remaining = projects.filter((p) => p.id !== id)
                const newActive = activeProjectId === id ? (remaining[0]?.id ?? null) : activeProjectId
                set({ projects: remaining, activeProjectId: newActive })
            },

            renameProject: (id, name) => {
                set((s) => ({
                    projects: s.projects.map((p) =>
                        p.id === id ? { ...p, name, updatedAt: Date.now() } : p
                    ),
                }))
            },

            switchProject: (id) => {
                if (get().projects.find((p) => p.id === id)) {
                    set({ activeProjectId: id, alternatives: [] })
                }
            },

            setAlternatives: (alts) => set({ alternatives: alts }),
            clearAlternatives: () => set({ alternatives: [] }),
            setGenerating: (v) => set({ isGenerating: v }),

            importJSON: (json: string) => {
                try {
                    const parsed = JSON.parse(json) as Project
                    if (!parsed.id || !parsed.name || !Array.isArray(parsed.components)) {
                        throw new Error('Invalid format')
                    }
                    const newProject = { ...parsed, id: `proj-${Date.now()}`, name: `${parsed.name} (imported)` }
                    set((s) => ({ projects: [...s.projects, newProject], activeProjectId: newProject.id }))
                } catch {
                    throw new Error('Geçersiz proje dosyası')
                }
            },
        }),
        {
            name: 'kurguide-mobile-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)

/* ─── Selectors ─────────────────────────────────────── */
export const selectActiveProject = (state: AppState): Project | null =>
    state.projects.find((p) => p.id === state.activeProjectId) ?? null
