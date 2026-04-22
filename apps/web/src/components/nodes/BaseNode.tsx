import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useUIStore } from '../../store/uiStore'

interface BaseNodeData {
    label: string
    description?: string
    isGhost?: boolean
}

interface BaseNodeProps {
    nodeId: string
    data: BaseNodeData
    icon: React.ReactNode
    accentColor: string
    selected?: boolean
}

/**
 * Compact square node — shows only an icon.
 * Hover reveals the label + description in a floating tooltip.
 */
export function BaseNode({ nodeId, data, icon, accentColor, selected }: BaseNodeProps) {
    const [hovered, setHovered] = useState(false)
    const selectNode = useUIStore((s) => s.selectNode)

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => selectNode(nodeId)}
        >
            {/* ── Target Handle ── */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-1.5 !h-1.5 !rounded-full !-top-0.5 !border-0"
                style={{ backgroundColor: accentColor }}
            />

            {/* ── The Square ── */}
            <div
                className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          transition-all duration-200 ease-out cursor-pointer
          ${selected ? 'scale-110' : 'hover:scale-105'}
          ${data.isGhost ? 'opacity-40 animate-ghost-pulse pointer-events-none border-dashed' : ''}
        `}
                style={{
                    background: 'var(--surface-raised)',
                    border: `1.5px solid ${selected ? accentColor : 'var(--surface-border)'}`,
                    borderStyle: data.isGhost ? 'dashed' : 'solid',
                    boxShadow: selected
                        ? `0 0 16px ${accentColor}30, 0 2px 8px rgba(0,0,0,0.3)`
                        : (hovered && !data.isGhost)
                            ? '0 8px 24px rgba(0,0,0,0.4)'
                            : '0 2px 8px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ color: accentColor }} className="text-lg">
                    {icon}
                </div>
            </div>

            {/* ── Hover Tooltip ── */}
            {hovered && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-50 pointer-events-none"
                    style={{ minWidth: 140 }}
                >
                    <div className="bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 shadow-tooltip">
                        <p className="text-[11px] font-semibold text-txt-primary whitespace-nowrap leading-none">
                            {data.label}
                        </p>
                        {data.description && (
                            <p className="text-[9px] text-txt-secondary font-mono mt-1 whitespace-nowrap leading-none">
                                {data.description}
                            </p>
                        )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 bg-surface-overlay border-l border-t border-surface-border" />
                </div>
            )}

            {/* ── Source Handle ── */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-1.5 !h-1.5 !rounded-full !-bottom-0.5 !border-0"
                style={{ backgroundColor: accentColor }}
            />
        </div>
    )
}
