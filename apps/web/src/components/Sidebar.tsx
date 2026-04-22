import { useCanvasStore } from '../store/canvasStore'
import { nodePalette } from './nodes'

// Small SVG icons for sidebar (matching node SVGs)
const sidebarIcons: Record<string, React.ReactNode> = {
    gateway: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
    ),
    service: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6" /><path d="M9 12h6" /><path d="M9 15h4" />
        </svg>
    ),
    database: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
    ),
    cache: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    ),
}

export function Sidebar() {
    const addNode = useCanvasStore((s) => s.addNode)

    return (
        <aside className="w-[200px] h-full bg-surface-raised border-r border-surface-border shadow-sidebar flex flex-col select-none">
            {/* Brand */}
            <div className="px-4 pt-5 pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-violet/10 border border-violet/20">
                        <span className="text-violet text-[10px] font-bold leading-none">K</span>
                    </div>
                    <div>
                        <h1 className="text-[12px] font-semibold text-txt-primary tracking-tight leading-none">Kurguide</h1>
                        <p className="text-[8px] text-txt-muted font-mono uppercase tracking-[0.1em] mt-0.5 leading-none">Canvas</p>
                    </div>
                </div>
            </div>

            <div className="mx-4 h-px bg-surface-border" />

            {/* Components */}
            <div className="px-3 pt-3 pb-2">
                <p className="text-[8px] font-medium text-txt-muted uppercase tracking-[0.15em] px-1.5 mb-2 leading-none">
                    Components
                </p>

                <div className="space-y-0.5">
                    {nodePalette.map((item) => (
                        <button
                            key={item.type}
                            onClick={() =>
                                addNode({
                                    id: `${item.type}-${Date.now()}`,
                                    type: item.type,
                                    position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
                                    data: { label: item.label, description: `New ${item.label.toLowerCase()}` },
                                })
                            }
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left group hover:bg-surface-hover transition-all duration-100"
                        >
                            <div className="shrink-0 transition-transform duration-150 group-hover:scale-110" style={{ color: item.color }}>
                                {sidebarIcons[item.type]}
                            </div>
                            <p className="text-[11px] text-txt-secondary font-medium group-hover:text-txt-primary transition-colors leading-none">
                                {item.label}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1" />

            <div className="px-4 py-3 border-t border-surface-border">
                <p className="text-[8px] text-txt-muted font-mono leading-none">v0.1.0</p>
            </div>
        </aside>
    )
}
