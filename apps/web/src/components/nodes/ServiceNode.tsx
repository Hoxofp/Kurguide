import { type NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'

const ServiceIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 12h6" />
        <path d="M9 15h4" />
    </svg>
)

export function ServiceNode({ id, data, selected }: NodeProps) {
    return <BaseNode nodeId={id} data={data as any} icon={ServiceIcon} accentColor="#685AFF" selected={selected} />
}
