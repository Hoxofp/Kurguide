import { type NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'

const ClientIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
)

export function ClientNode({ id, data, selected }: NodeProps) {
    return <BaseNode nodeId={id} data={data as any} icon={ClientIcon} accentColor="#2A85FF" selected={selected} />
}
