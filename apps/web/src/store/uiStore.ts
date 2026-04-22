import { create } from 'zustand'

interface UIState {
    // Selected node
    selectedNodeId: string | null
    selectNode: (id: string | null) => void

    // Properties panel
    isPanelOpen: boolean
    togglePanel: () => void
    openPanel: () => void
    closePanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
    selectedNodeId: null,
    selectNode: (id) => set({ selectedNodeId: id, isPanelOpen: id !== null }),

    isPanelOpen: false,
    togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
    openPanel: () => set({ isPanelOpen: true }),
    closePanel: () => set({ isPanelOpen: false, selectedNodeId: null }),
}))
