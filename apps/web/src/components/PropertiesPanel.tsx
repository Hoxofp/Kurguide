import { useUIStore } from '../store/uiStore'
import { useCanvasStore, TECH_CATALOG } from '../store/canvasStore'

export function PropertiesPanel() {
    const selectedNodeId = useUIStore((s) => s.selectedNodeId)
    const closePanel = useUIStore((s) => s.closePanel)
    const isPanelOpen = useUIStore((s) => s.isPanelOpen)
    const nodes = useCanvasStore((s) => s.nodes)
    const updateNodeData = useCanvasStore((s) => s.updateNodeData)
    const removeNode = useCanvasStore((s) => s.removeNode)

    if (!isPanelOpen || !selectedNodeId) return null

    const node = nodes.find((n) => n.id === selectedNodeId)
    if (!node) return null

    const data = node.data as Record<string, string>
    const selectedTech = TECH_CATALOG.find((t) => t.id === data.technologyId)
    const compatibleTechs = TECH_CATALOG.filter((t) => t.category === node.type)

    const handleChange = (key: string, value: string) => updateNodeData(selectedNodeId, { [key]: value })

    const handleDelete = () => {
        removeNode(selectedNodeId)
        closePanel()
    }

    const typeColors: Record<string, { bg: string; text: string }> = {
        service: { bg: 'rgba(104, 90, 255, 0.1)', text: '#685AFF' },
        database: { bg: 'rgba(68, 161, 148, 0.1)', text: '#44A194' },
        cache: { bg: 'rgba(255, 68, 0, 0.1)', text: '#FF4400' },
        gateway: { bg: 'rgba(68, 161, 148, 0.1)', text: '#44A194' },
    }

    const tc = typeColors[node.type || ''] || typeColors.service

    return (
        <div
            className="absolute top-0 left-0 h-full z-40 flex flex-col select-none overflow-hidden"
            style={{
                width: 280,
                background: 'var(--surface-secondary)',
                borderRight: '1px solid var(--surface-border)',
                backdropFilter: 'blur(16px)',
                transition: 'background-color 0.35s ease',
            }}
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
                <div className="min-w-0">
                    <p className="text-[8px] font-mono uppercase tracking-[0.15em] leading-none" style={{ color: 'var(--txt-muted)' }}>Properties</p>
                    <p className="text-[12px] font-semibold mt-1 leading-none truncate" style={{ color: 'var(--txt-primary)' }}>{data.label || 'Unnamed'}</p>
                </div>
                <button onClick={closePanel} className="w-6 h-6 rounded-md flex items-center justify-center transition-all shrink-0"
                    style={{ color: 'var(--txt-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--txt-primary)'; e.currentTarget.style.background = 'var(--surface-hover)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--txt-muted)'; e.currentTarget.style.background = 'transparent' }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
            </div>

            <div className="mx-4 h-px shrink-0" style={{ background: 'var(--surface-border)' }} />

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* Type Badge */}
                <div>
                    <p className="text-[8px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--txt-muted)' }}>Type</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: tc.bg, color: tc.text }}>
                        {node.type}
                    </span>
                </div>

                <Field label="Name" value={data.label} onChange={(v) => handleChange('label', v)} placeholder="Node name" />
                <Field label="Description" value={data.description} onChange={(v) => handleChange('description', v)} placeholder="Short description" />

                {/* ── Technology Selection ── */}
                <div>
                    <p className="text-[8px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--txt-muted)' }}>Technology</p>
                    <select
                        value={data.technologyId || ''}
                        onChange={(e) => {
                            const tech = TECH_CATALOG.find((t) => t.id === e.target.value)
                            handleChange('technologyId', e.target.value)
                            if (tech) handleChange('port', tech.defaultPort)
                        }}
                        className="w-full text-[11px] px-2.5 py-1.5 rounded-md outline-none appearance-none cursor-pointer transition-colors"
                        style={{ background: 'var(--surface-base)', color: 'var(--txt-primary)', border: '1px solid var(--surface-border)' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
                    >
                        <option value="">Select technology...</option>
                        {compatibleTechs.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Tech Specs Card */}
                {selectedTech && (
                    <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--accent-muted)', border: '1px solid var(--surface-border)' }}>
                        <p className="text-[9px] leading-tight" style={{ color: 'var(--txt-secondary)' }}>{selectedTech.description}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            <SpecBadge label="Language" value={selectedTech.specs.language} />
                            <SpecBadge label="Latency" value={selectedTech.specs.latency} />
                            <SpecBadge label="Scaling" value={selectedTech.specs.scalability} />
                            <SpecBadge label="Storage" value={selectedTech.specs.persistence} />
                        </div>
                    </div>
                )}

                <Field label="Port" value={data.port} onChange={(v) => handleChange('port', v)} placeholder="e.g. 4000" />

                <div>
                    <p className="text-[8px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--txt-muted)' }}>Environment Variables</p>
                    <textarea
                        value={data.envVars || ''}
                        onChange={(e) => handleChange('envVars', e.target.value)}
                        placeholder="KEY=value (one per line)"
                        rows={3}
                        className="w-full text-[10px] font-mono px-2.5 py-1.5 rounded-md outline-none resize-none transition-colors leading-relaxed"
                        style={{ background: 'var(--surface-base)', color: 'var(--txt-primary)', border: '1px solid var(--surface-border)' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
                    />
                </div>

                <div>
                    <p className="text-[8px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--txt-muted)' }}>Notes</p>
                    <textarea
                        value={data.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Additional notes..."
                        rows={2}
                        className="w-full text-[11px] px-2.5 py-1.5 rounded-md outline-none resize-none transition-colors"
                        style={{ background: 'var(--surface-base)', color: 'var(--txt-primary)', border: '1px solid var(--surface-border)' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
                    />
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-2 flex items-center justify-between shrink-0" style={{ borderTop: '1px solid var(--surface-border)' }}>
                <p className="text-[8px] font-mono truncate" style={{ color: 'var(--txt-muted)' }}>{node.id}</p>
                <button onClick={handleDelete} className="text-[9px] font-mono text-flame/60 hover:text-flame transition-colors">
                    Delete
                </button>
            </div>
        </div>
    )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div>
            <p className="text-[8px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--txt-muted)' }}>{label}</p>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-[11px] px-2.5 py-1.5 rounded-md outline-none transition-colors"
                style={{ background: 'var(--surface-base)', color: 'var(--txt-primary)', border: '1px solid var(--surface-border)' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
            />
        </div>
    )
}

function SpecBadge({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded px-1.5 py-1" style={{ background: 'var(--surface-base)' }}>
            <p className="text-[7px] font-mono uppercase leading-none" style={{ color: 'var(--txt-muted)' }}>{label}</p>
            <p className="text-[9px] font-mono mt-0.5 leading-none truncate" style={{ color: 'var(--txt-primary)' }}>{value}</p>
        </div>
    )
}
