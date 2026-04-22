import { useCanvasStore } from '../store/canvasStore'
import { TradeoffCards } from './TradeoffCards'

export function AlternativesOverlay() {
    const { alternatives, activeAlternativeIndex, previewMode, clearAlternatives, previewAlternative, selectAlternative } = useCanvasStore()

    if (!previewMode || alternatives.length === 0 || activeAlternativeIndex === null) return null

    const activeAlt = alternatives[activeAlternativeIndex]

    return (
        <div className="absolute top-16 left-4 z-50 w-72 flex flex-col gap-4">
            {/* Header / Tabs */}
            <div
                className="rounded-xl overflow-hidden shadow-node"
                style={{
                    background: 'rgba(19, 19, 22, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--surface-border)',
                }}
            >
                <div className="flex p-1 gap-1" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    {alternatives.map((alt, i) => (
                        <button
                            key={alt.id}
                            onClick={() => previewAlternative(i)}
                            className={`flex-1 py-1.5 text-[10px] rounded hover:bg-surface-hover transition-colors font-semibold ${
                                i === activeAlternativeIndex ? 'text-txt-primary bg-surface-hover shadow-sm' : 'text-txt-muted'
                            }`}
                        >
                            Alt {i + 1}
                        </button>
                    ))}
                </div>

                <div className="p-4">
                    <h3 className="text-sm font-semibold text-txt-primary leading-tight mb-1">{activeAlt.name}</h3>
                    <p className="text-[11px] text-txt-secondary leading-snug">{activeAlt.description}</p>
                    
                    <TradeoffCards tradeoffs={activeAlt.tradeoffs} />
                </div>
                
                <div className="flex bg-surface-secondary">
                    <button 
                        onClick={() => selectAlternative(activeAlternativeIndex)}
                        className="flex-1 py-2 text-[11px] font-semibold text-cream bg-accent hover:bg-opacity-90 transition-all border-r border-surface-border"
                    >
                        Apply This
                    </button>
                    <button 
                        onClick={clearAlternatives}
                        className="py-2 px-4 text-[11px] font-semibold text-txt-muted hover:text-txt-primary hover:bg-surface-hover transition-all"
                    >
                        Discard
                    </button>
                </div>
            </div>
        </div>
    )
}
