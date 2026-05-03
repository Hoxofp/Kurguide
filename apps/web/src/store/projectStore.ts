import { create } from 'zustand'
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
    loading: boolean

    // Actions
    fetchProjects: () => Promise<void>
    createProject: (name: string) => Promise<string>
    deleteProject: (id: string) => Promise<void>
    renameProject: (id: string, name: string) => Promise<void>
    switchProject: (id: string) => void
    saveCurrentProject: (nodes: Node[], edges: Edge[], checkpoints: Checkpoint[]) => Promise<void>
    exportProjectJSON: (id: string) => string
    importProjectJSON: (json: string) => Promise<void>
    getActiveProject: () => Project | null
}

/* ─── LocalStorage Helpers ──────────────────────────── */
const LS_KEY = 'kurguide-projects'
const LS_ACTIVE_KEY = 'kurguide-active-project'

function loadFromStorage(): { projects: Project[]; activeProjectId: string | null } {
    try {
        const raw = localStorage.getItem(LS_KEY)
        const activeId = localStorage.getItem(LS_ACTIVE_KEY)
        if (raw) {
            const projects = JSON.parse(raw) as Project[]
            return { projects, activeProjectId: activeId || projects[0]?.id || null }
        }
    } catch { /* ignore */ }
    return { projects: [], activeProjectId: null }
}

function saveToStorage(projects: Project[], activeProjectId: string | null) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(projects))
        if (activeProjectId) localStorage.setItem(LS_ACTIVE_KEY, activeProjectId)
    } catch { /* ignore */ }
}

/* ─── Default Project ───────────────────────────────── */
function createDefaultProject(): Project {
    return {
        id: `proj-${Date.now()}`,
        name: 'My Architecture',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes: [],
        edges: [],
        checkpoints: [],
    }
}

/* ─── Store ──────────────────────────────────────────── */
export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    activeProjectId: null,
    loading: true,

    fetchProjects: async () => {
        set({ loading: true })
        
        // Load from localStorage (no backend needed)
        const stored = loadFromStorage()
        if (stored.projects.length > 0) {
            set({ projects: stored.projects, activeProjectId: stored.activeProjectId, loading: false })
        } else {
            // First time: create a default project
            const defaultProject = createDefaultProject()
            const projects = [defaultProject]
            saveToStorage(projects, defaultProject.id)
            set({ projects, activeProjectId: defaultProject.id, loading: false })
        }
    },

    createProject: async (name: string) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name: name.trim() || 'Untitled Project',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nodes: [],
            edges: [],
            checkpoints: [],
        }

        set((s) => {
            const projects = [...s.projects, newProject]
            saveToStorage(projects, newProject.id)
            return { projects, activeProjectId: newProject.id }
        })
        return newProject.id
    },

    deleteProject: async (id: string) => {
        const { projects, activeProjectId } = get()
        if (projects.length <= 1) return
        
        const remaining = projects.filter((p) => p.id !== id)
        const newActive = activeProjectId === id ? remaining[0]?.id ?? null : activeProjectId
        saveToStorage(remaining, newActive)
        set({ projects: remaining, activeProjectId: newActive })
    },

    renameProject: async (id: string, name: string) => {
        const newName = name.trim() || 'Untitled Project'
        
        set((s) => {
            const projects = s.projects.map((p) =>
                p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p
            )
            saveToStorage(projects, s.activeProjectId)
            return { projects }
        })
    },

    switchProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id)
        if (!project) return
        localStorage.setItem(LS_ACTIVE_KEY, id)
        set({ activeProjectId: id })
    },

    saveCurrentProject: async (nodes, edges, checkpoints) => {
        const { activeProjectId } = get()
        if (!activeProjectId) return
        
        set((s) => {
            const projects = s.projects.map((p) =>
                p.id === activeProjectId
                    ? {
                        ...p,
                        nodes: JSON.parse(JSON.stringify(nodes)),
                        edges: JSON.parse(JSON.stringify(edges)),
                        checkpoints: JSON.parse(JSON.stringify(checkpoints)),
                        updatedAt: Date.now(),
                    }
                    : p
            )
            saveToStorage(projects, activeProjectId)
            return { projects }
        })
    },

    exportProjectJSON: (id: string) => {
        const project = get().projects.find((p) => p.id === id)
        if (!project) return ''
        return JSON.stringify(project, null, 2)
    },

    importProjectJSON: async (json: string) => {
        try {
            const parsed = JSON.parse(json) as Project
            if (!parsed.name || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
                throw new Error('Invalid project format')
            }
            
            const newProject: Project = {
                id: `proj-${Date.now()}`,
                name: `${parsed.name} (imported)`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: parsed.nodes,
                edges: parsed.edges,
                checkpoints: parsed.checkpoints || [],
            }

            set((s) => {
                const projects = [...s.projects, newProject]
                saveToStorage(projects, newProject.id)
                return { projects, activeProjectId: newProject.id }
            })
        } catch (e) {
            console.error('Failed to import project:', e)
            throw new Error('Invalid project file. Please upload a valid Kurguide JSON file.')
        }
    },

    getActiveProject: () => {
        const { projects, activeProjectId } = get()
        return projects.find((p) => p.id === activeProjectId) ?? null
    },
}))
