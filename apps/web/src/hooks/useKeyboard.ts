import { useEffect } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { useProjectStore } from '../store/projectStore'

/**
 * Global keyboard shortcuts.
 * Ctrl+Z → Undo, Ctrl+Y / Ctrl+Shift+Z → Redo
 * Ctrl+S → Save checkpoint
 * Ctrl+N → New project
 * Delete/Backspace → Remove selected node
 */
export function useKeyboard() {
    const store = useCanvasStore

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Ignore when typing in inputs
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA') return

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault()
                    store.temporal.getState().undo()
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault()
                    store.temporal.getState().redo()
                } else if (e.key === 's') {
                    e.preventDefault()
                    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    store.getState().saveCheckpoint(`Checkpoint ${timestamp}`)
                } else if (e.key === 'n') {
                    e.preventDefault()
                    useProjectStore.getState().createProject('New Project')
                }
            }

            // Delete selected nodes
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selected = store.getState().nodes.filter((n) => n.selected)
                if (selected.length > 0) {
                    e.preventDefault()
                    for (const node of selected) {
                        store.getState().removeNode(node.id)
                    }
                }
            }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])
}

