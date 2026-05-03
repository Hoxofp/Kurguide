import { useCanvasStore } from '../store/canvasStore'
import { TradeoffCards } from './TradeoffCards'
import { motion, AnimatePresence } from 'framer-motion'

export function AlternativesOverlay() {
    const { alternatives, activeAlternativeIndex, previewMode, clearAlternatives, previewAlternative, selectAlternative } = useCanvasStore()

    return (
        <AnimatePresence>
            {previewMode && alternatives.length > 0 && activeAlternativeIndex !== null && (
                <motion.div 
                    initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute top-16 left-4 z-50 w-72 flex flex-col gap-4"
                >
                    <div
                        className="rounded-xl overflow-hidden shadow-node"
                        style={{
                            background: 'rgba(19, 19, 22, 0.85)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--surface-border)',
                        }}
                    >
                        {/* Header / Tabs */}
                        <div className="flex p-1 gap-1 relative" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                            {alternatives.map((alt, i) => (
                                <button
                                    key={alt.id}
                                    onClick={() => previewAlternative(i)}
                                    className={`relative flex-1 py-1.5 text-[10px] rounded transition-colors font-semibold z-10 ${
                                        i === activeAlternativeIndex ? 'text-txt-primary' : 'text-txt-muted hover:bg-surface-hover'
                                    }`}
                                >
                                    {i === activeAlternativeIndex && (
                                        <motion.div 
                                            layoutId="activeTab" 
                                            className="absolute inset-0 bg-surface-hover rounded shadow-sm z-[-1]"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    Alt {i + 1}
                                </button>
                            ))}
                        </div>

                        <div className="p-4 relative min-h-[140px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeAlternativeIndex}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className="text-sm font-semibold text-txt-primary leading-tight mb-1">
                                        {alternatives[activeAlternativeIndex].name}
                                    </h3>
                                    <p className="text-[11px] text-txt-secondary leading-snug mb-3">
                                        {alternatives[activeAlternativeIndex].description}
                                    </p>
                                    
                                    <TradeoffCards tradeoffs={alternatives[activeAlternativeIndex].tradeoffs} />
                                </motion.div>
                            </AnimatePresence>
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
                </motion.div>
            )}
        </AnimatePresence>
    )
}
