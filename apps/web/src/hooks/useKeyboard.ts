import { useEffect } from 'react'
import { useCanvasStore } from '../store/canvasStore'

/**
 * Global keyboard shortcuts.
 * Ctrl+Z → Undo, Ctrl+Y / Ctrl+Shift+Z → Redo
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
                }
            }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])
}
