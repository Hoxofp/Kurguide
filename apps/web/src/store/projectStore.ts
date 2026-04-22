import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Node, Edge } from '@xyflow/react'
import type { Checkpoint } from './canvasStore'

/* ─── Types ─────────────────────────────────────────── */
export interface Project {
    id: string
    name: string
    createdAt: number
    updatedAt: number
    nodes: Node[]
    edges: Edge[]
    checkpoints: Checkpoint[]
}

export interface ProjectState {
    projects: Project[]
    activeProjectId: string | null

    // Actions
    createProject: (name: string) => string
    deleteProject: (id: string) => void
    renameProject: (id: string, name: string) => void
    switchProject: (id: string) => void
    saveCurrentProject: (nodes: Node[], edges: Edge[], checkpoints: Checkpoint[]) => void
    exportProjectJSON: (id: string) => string
    importProjectJSON: (json: string) => void
    getActiveProject: () => Project | null
}

/* ─── Default project ───────────────────────────────── */
const DEFAULT_PROJECT_ID = 'default-project'

const defaultProject: Project = {
    id: DEFAULT_PROJECT_ID,
    name: 'My Architecture',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes: [],
    edges: [],
    checkpoints: [],
}

/* ─── Store ──────────────────────────────────────────── */
export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            projects: [defaultProject],
            activeProjectId: DEFAULT_PROJECT_ID,

            createProject: (name) => {
                const id = `proj-${Date.now()}`
                const newProject: Project = {
                    id,
                    name: name.trim() || 'Untitled Project',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    nodes: [],
                    edges: [],
                    checkpoints: [],
                }
                set((s) => ({ projects: [...s.projects, newProject], activeProjectId: id }))
                return id
            },

            deleteProject: (id) => {
                const { projects, activeProjectId } = get()
                if (projects.length <= 1) return // At least 1 project must remain
                const remaining = projects.filter((p) => p.id !== id)
                const newActive = activeProjectId === id ? remaining[0]?.id ?? null : activeProjectId
                set({ projects: remaining, activeProjectId: newActive })
            },

            renameProject: (id, name) => {
                set((s) => ({
                    projects: s.projects.map((p) =>
                        p.id === id ? { ...p, name: name.trim() || 'Untitled Project', updatedAt: Date.now() } : p
                    ),
                }))
            },

            switchProject: (id) => {
                const project = get().projects.find((p) => p.id === id)
                if (!project) return
                set({ activeProjectId: id })
            },

            saveCurrentProject: (nodes, edges, checkpoints) => {
                const { activeProjectId } = get()
                if (!activeProjectId) return
                set((s) => ({
                    projects: s.projects.map((p) =>
                        p.id === activeProjectId
                            ? {
                                ...p,
                                nodes: JSON.parse(JSON.stringify(nodes)),
                                edges: JSON.parse(JSON.stringify(edges)),
                                checkpoints: JSON.parse(JSON.stringify(checkpoints)),
                                updatedAt: Date.now(),
                            }
                            : p
                    ),
                }))
            },

            exportProjectJSON: (id) => {
                const project = get().projects.find((p) => p.id === id)
                if (!project) return ''
                return JSON.stringify(project, null, 2)
            },

            importProjectJSON: (json) => {
                try {
                    const parsed = JSON.parse(json) as Project
                    // Validate basic shape
                    if (!parsed.id || !parsed.name || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
                        throw new Error('Invalid project format')
                    }
                    // Give it a new ID to avoid conflicts
                    const newProject: Project = {
                        ...parsed,
                        id: `proj-${Date.now()}`,
                        name: `${parsed.name} (imported)`,
                        updatedAt: Date.now(),
                    }
                    set((s) => ({
                        projects: [...s.projects, newProject],
                        activeProjectId: newProject.id,
                    }))
                } catch (e) {
                    console.error('Failed to import project:', e)
                    throw new Error('Geçersiz proje dosyası. Lütfen geçerli bir Kurguide JSON dosyası yükleyin.')
                }
            },

            getActiveProject: () => {
                const { projects, activeProjectId } = get()
                return projects.find((p) => p.id === activeProjectId) ?? null
            },
        }),
        {
            name: 'kurguide-projects',
            version: 1,
        }
    )
)
