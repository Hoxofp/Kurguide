import { useState } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { nodePalette } from './nodes'

const paletteIcons: Record<string, React.ReactNode> = {
    gateway: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
    ),
    service: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6" /><path d="M9 12h6" /><path d="M9 15h4" />
        </svg>
    ),
    database: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
    ),
    cache: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    ),
}

export function ComponentsPalette() {
    const [expanded, setExpanded] = useState(true)
    const addNode = useCanvasStore((s) => s.addNode)

    return (
        <div
            className="absolute top-3 right-3 z-40"
            style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--surface-border)',
                borderRadius: 10,
                backdropFilter: 'blur(12px)',
            }}
        >
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 px-3 py-2 w-full text-left">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--txt-muted)' }}>
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                <span className="text-[9px] font-mono uppercase tracking-[0.1em]" style={{ color: 'var(--txt-secondary)' }}>Add</span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--txt-muted)' }}
                    className={`transition-transform ml-auto ${expanded ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {expanded && (
                <div className="px-1.5 pb-1.5 space-y-0.5">
                    {nodePalette.map((item) => (
                        <button
                            key={item.type}
                            onClick={() =>
                                addNode({
                                    id: `${item.type}-${Date.now()}`,
                                    type: item.type,
                                    position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
                                    data: { label: item.label, description: `New ${item.label.toLowerCase()}`, technologyId: '', port: '', envVars: '', notes: '' },
                                })
                            }
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left group transition-all"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div className="shrink-0 transition-transform group-hover:scale-110" style={{ color: item.color }}>
                                {paletteIcons[item.type]}
                            </div>
                            <span className="text-[10px] transition-colors leading-none" style={{ color: 'var(--txt-secondary)' }}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
