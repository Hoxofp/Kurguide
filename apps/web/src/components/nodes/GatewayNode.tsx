import { type NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'

const GatewayIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
    </svg>
)

export function GatewayNode({ id, data, selected }: NodeProps) {
    return <BaseNode nodeId={id} data={data as any} icon={GatewayIcon} accentColor="#44A194" selected={selected} />
}
