import { type NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'

const DatabaseIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
)

export function DatabaseNode({ id, data, selected }: NodeProps) {
    return <BaseNode nodeId={id} data={data as any} icon={DatabaseIcon} accentColor="#44A194" selected={selected} />
}
