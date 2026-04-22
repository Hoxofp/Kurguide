import { useState } from 'react'
import { useCanvasStore } from '../store/canvasStore'

export function Toolbar() {
    const store = useCanvasStore
    const saveCheckpoint = useCanvasStore((s) => s.saveCheckpoint)
    const [showSave, setShowSave] = useState(false)
    const [cpName, setCpName] = useState('')

    const handleUndo = () => store.temporal.getState().undo()
    const handleRedo = () => store.temporal.getState().redo()

    const handleSaveCheckpoint = () => {
        if (cpName.trim()) {
            saveCheckpoint(cpName.trim())
            setCpName('')
            setShowSave(false)
        }
    }

    return (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1">
            <div
                className="flex items-center gap-0.5 rounded-lg px-1 py-1"
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}
            >
                {/* Undo */}
                <button
                    onClick={handleUndo}
                    title="Undo (Ctrl+Z)"
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-100"
                    style={{ color: 'var(--txt-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--txt-primary)'; e.currentTarget.style.background = 'var(--surface-hover)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--txt-secondary)'; e.currentTarget.style.background = 'transparent' }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>

                {/* Redo */}
                <button
                    onClick={handleRedo}
                    title="Redo (Ctrl+Y)"
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-100"
                    style={{ color: 'var(--txt-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--txt-primary)'; e.currentTarget.style.background = 'var(--surface-hover)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--txt-secondary)'; e.currentTarget.style.background = 'transparent' }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                    </svg>
                </button>

                {/* Divider */}
                <div className="w-px h-4 mx-0.5" style={{ background: 'var(--surface-border)' }} />

                {/* Checkpoint */}
                <button
                    onClick={() => setShowSave(!showSave)}
                    title="Save Checkpoint"
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-100"
                    style={{
                        color: showSave ? 'var(--accent)' : 'var(--txt-secondary)',
                        background: showSave ? 'var(--accent-muted)' : 'transparent',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                </button>
            </div>

            {/* Checkpoint name input */}
            {showSave && (
                <div
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}
                >
                    <input
                        type="text"
                        value={cpName}
                        onChange={(e) => setCpName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveCheckpoint()}
                        placeholder="Checkpoint name..."
                        autoFocus
                        className="bg-transparent text-[11px] font-sans outline-none w-32"
                        style={{ color: 'var(--txt-primary)' }}
                    />
                    <button
                        onClick={handleSaveCheckpoint}
                        disabled={!cpName.trim()}
                        className="px-2 py-0.5 rounded text-[9px] font-mono transition-colors disabled:opacity-20"
                        style={{
                            color: 'var(--accent)',
                            background: 'var(--accent-muted)',
                            border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                        }}
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    )
}
