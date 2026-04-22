import { Tradeoffs } from '../store/canvasStore'

interface TradeoffCardsProps {
    tradeoffs: Tradeoffs
}

const TRADEOFF_LABELS = {
    speed: 'Speed',
    cost: 'Cost',
    scalability: 'Scalability',
    complexity: 'Complexity',
    simplicity: 'Simplicity',
}

function getColor(value: number) {
    if (value >= 4) return '#44A194' // Teal / Good
    if (value >= 3) return '#E8913A' // Orange / Medium
    return '#FF4400' // Red / Bad
}

export function TradeoffCards({ tradeoffs }: TradeoffCardsProps) {
    return (
        <div className="flex flex-col gap-2 mt-4">
            <h4 className="text-[10px] font-mono text-txt-muted uppercase tracking-[0.1em] mb-1">Tradeoffs</h4>
            <div className="space-y-2">
                {(Object.keys(tradeoffs) as Array<keyof Tradeoffs>).map((key) => {
                    const value = tradeoffs[key]
                    return (
                        <div key={key} className="flex items-center justify-between text-[11px]">
                            <span className="text-txt-secondary">{TRADEOFF_LABELS[key]}</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-3 rounded-[1px] transition-all duration-300"
                                        style={{
                                            background: i <= value ? getColor(value) : 'var(--surface-border)',
                                            opacity: i <= value ? 1 : 0.3
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
