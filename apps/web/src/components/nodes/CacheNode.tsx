import { type NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'

const CacheIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
)

export function CacheNode({ id, data, selected }: NodeProps) {
    return <BaseNode nodeId={id} data={data as any} icon={CacheIcon} accentColor="#FF4400" selected={selected} />
}
