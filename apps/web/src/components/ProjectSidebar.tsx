import { useState, useRef } from 'react'
import { useCanvasStore, type Checkpoint } from '../store/canvasStore'
import { useProjectStore } from '../store/projectStore'
import { generateAllExports } from '../services/exportService'

/* ═══════════════════════════════════════════════════════
   PROJECT SIDEBAR — Hafta 6+7+8
   - Proje oluşturma / adlandırma / silme
   - Proje listesi
   - Checkpoint geçmişi
   - JSON export / import
   ═══════════════════════════════════════════════════════ */

export function ProjectSidebar() {
    const { nodes, edges, checkpoints, restoreCheckpoint, deleteCheckpoint, setCanvas } = useCanvasStore()
    const { projects, activeProjectId, createProject, deleteProject, renameProject, switchProject,
        saveCurrentProject, exportProjectJSON, importProjectJSON } = useProjectStore()

    const [view, setView] = useState<'projects' | 'checkpoints' | 'export'>('projects')
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [exportFormat, setExportFormat] = useState<'docker' | 'claude' | 'json' | 'structure'>('docker')
    const [copied, setCopied] = useState(false)
    const [importError, setImportError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Save current canvas to active project on every render tick
    // (we call this when switching projects or exporting)
    const handleSaveAndSwitch = (id: string) => {
        saveCurrentProject(nodes, edges, checkpoints)
        const target = projects.find((p) => p.id === id)
        if (!target) return
        switchProject(id)
        setCanvas(target.nodes, target.edges, target.checkpoints)
    }

    const handleCreateProject = () => {
        if (!newName.trim()) return
        saveCurrentProject(nodes, edges, checkpoints)
        createProject(newName.trim())
        // New project starts with empty canvas
        setCanvas([], [], [])
        setNewName('')
        setCreating(false)
    }

    const handleDeleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (projects.length <= 1) return
        if (id === activeProjectId) {
            const next = projects.find((p) => p.id !== id)
            if (next) {
                switchProject(next.id)
                setCanvas(next.nodes, next.edges, next.checkpoints)
            }
        }
        deleteProject(id)
    }

    const handleRenameStart = (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingId(id)
        setEditName(name)
    }

    const handleRenameCommit = () => {
        if (editingId && editName.trim()) renameProject(editingId, editName.trim())
        setEditingId(null)
        setEditName('')
    }

    // Export
    const activeProject = projects.find((p) => p.id === activeProjectId)
    const exportData = activeProject
        ? (() => {
            const merged = { ...activeProject, nodes, edges, checkpoints }
            const all = generateAllExports(merged)
            if (exportFormat === 'docker') return all.dockerCompose
            if (exportFormat === 'claude') return all.claudeMd
            if (exportFormat === 'json') return exportProjectJSON(activeProjectId!)
            return all.fileStructure
        })()
        : ''

    const handleCopy = async () => {
        await navigator.clipboard.writeText(exportData)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExportFile = () => {
        const filename = exportFormat === 'docker' ? 'docker-compose.yml' : exportFormat === 'claude' ? 'CLAUDE.md' : exportFormat === 'json' ? 'project.json' : 'file-structure.md'
        const blob = new Blob([exportData], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImportError('')
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                importProjectJSON(ev.target?.result as string)
                setView('projects')
            } catch (err) {
                setImportError(String(err))
            }
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    return (
        <aside
            className="w-[200px] h-full flex flex-col select-none shrink-0"
            style={{
                background: 'var(--surface-secondary)',
                borderRight: '1px solid var(--surface-border)',
                transition: 'background-color 0.35s ease, border-color 0.35s ease',
            }}
        >
            {/* ── Header ── */}
            <div className="px-4 pt-5 pb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ background: 'var(--accent-muted)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}
                    >
                        <span className="text-[9px] font-bold leading-none" style={{ color: 'var(--accent)' }}>K</span>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-[11px] font-semibold tracking-tight leading-none truncate" style={{ color: 'var(--txt-primary)' }}>Kurguide</h1>
                        <p className="text-[7px] font-mono uppercase tracking-[0.1em] mt-0.5 leading-none" style={{ color: 'var(--txt-muted)' }}>
                            {activeProject?.name || 'No project'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="flex px-2 pb-2 gap-0.5">
                {(['projects', 'checkpoints', 'export'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setView(tab)}
                        className="flex-1 py-1 rounded text-[8px] font-mono uppercase tracking-[0.08em] transition-all"
                        style={{
                            color: view === tab ? 'var(--accent)' : 'var(--txt-muted)',
                            background: view === tab ? 'var(--accent-muted)' : 'transparent',
                        }}
                    >
                        {tab === 'projects' ? 'Proj' : tab === 'checkpoints' ? 'CPs' : 'Exp'}
                    </button>
                ))}
            </div>

            <div className="mx-3 h-px shrink-0" style={{ background: 'var(--surface-border)' }} />

            {/* ── Projects View ── */}
            {view === 'projects' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-3 pt-3 flex-1 overflow-y-auto">
                        <div className="space-y-0.5">
                            {projects.map((proj) => (
                                <div
                                    key={proj.id}
                                    className="group relative flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all cursor-pointer"
                                    style={{
                                        background: proj.id === activeProjectId ? 'var(--accent-muted)' : 'transparent',
                                        border: proj.id === activeProjectId ? '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' : '1px solid transparent',
                                    }}
                                    onMouseEnter={(e) => { if (proj.id !== activeProjectId) e.currentTarget.style.background = 'var(--surface-hover)' }}
                                    onMouseLeave={(e) => { if (proj.id !== activeProjectId) e.currentTarget.style.background = 'transparent' }}
                                    onClick={() => proj.id !== activeProjectId && handleSaveAndSwitch(proj.id)}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: proj.id === activeProjectId ? 'var(--accent)' : 'var(--surface-border)' }} />

                                    {editingId === proj.id ? (
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={handleRenameCommit}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameCommit(); if (e.key === 'Escape') setEditingId(null) }}
                                            className="flex-1 bg-transparent text-[10px] outline-none border-b"
                                            style={{ color: 'var(--txt-primary)', borderColor: 'var(--accent)' }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <p className="flex-1 text-[10px] font-medium truncate leading-none"
                                            style={{ color: proj.id === activeProjectId ? 'var(--accent)' : 'var(--txt-primary)' }}>
                                            {proj.name}
                                        </p>
                                    )}

                                    {/* Action buttons on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                                        <button
                                            title="Rename"
                                            onClick={(e) => handleRenameStart(proj.id, proj.name, e)}
                                            className="w-4 h-4 rounded flex items-center justify-center"
                                            style={{ color: 'var(--txt-muted)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--txt-muted)'}
                                        >
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        {projects.length > 1 && (
                                            <button
                                                title="Delete"
                                                onClick={(e) => handleDeleteProject(proj.id, e)}
                                                className="w-4 h-4 rounded flex items-center justify-center"
                                                style={{ color: 'var(--txt-muted)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#FF4400'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--txt-muted)'}
                                            >
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Create project */}
                    <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid var(--surface-border)' }}>
                        {creating ? (
                            <div className="flex gap-1">
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreateProject(); if (e.key === 'Escape') setCreating(false) }}
                                    placeholder="Project name..."
                                    className="flex-1 bg-transparent text-[10px] border-b outline-none leading-6"
                                    style={{ color: 'var(--txt-primary)', borderColor: 'var(--accent)' }}
                                />
                                <button onClick={handleCreateProject} className="text-[8px] font-mono px-1.5 rounded"
                                    style={{ color: 'var(--accent)', background: 'var(--accent-muted)' }}>
                                    Add
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setCreating(true)}
                                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[9px] font-mono transition-all"
                                style={{ color: 'var(--txt-muted)', border: '1px dashed var(--surface-border)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--txt-muted)'; e.currentTarget.style.borderColor = 'var(--surface-border)' }}
                            >
                                <span>+ New Project</span>
                            </button>
                        )}

                        {/* Import */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full mt-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[9px] font-mono transition-all"
                            style={{ color: 'var(--txt-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--txt-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--txt-muted)'}
                        >
                            ↑ Import JSON
                        </button>
                        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                        {importError && <p className="text-[8px] mt-1" style={{ color: '#FF4400' }}>{importError}</p>}
                    </div>
                </div>
            )}

            {/* ── Checkpoints View ── */}
            {view === 'checkpoints' && (
                <div className="px-3 pt-3 flex-1 overflow-y-auto">
                    {checkpoints.length === 0 ? (
                        <p className="text-[9px] px-1 leading-relaxed" style={{ color: 'var(--txt-muted)' }}>
                            No checkpoints yet. Use the save button in the toolbar.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {checkpoints.map((cp) => (
                                <CheckpointItem
                                    key={cp.id}
                                    checkpoint={cp}
                                    onRestore={() => restoreCheckpoint(cp.id)}
                                    onDelete={() => deleteCheckpoint(cp.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Export View ── */}
            {view === 'export' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Format selector */}
                    <div className="px-3 pt-3 pb-2 space-y-1 shrink-0">
                        <p className="text-[8px] font-mono uppercase tracking-[0.12em]" style={{ color: 'var(--txt-muted)' }}>Format</p>
                        <div className="grid grid-cols-2 gap-1">
                            {([
                                { id: 'docker', label: 'Docker' },
                                { id: 'claude', label: 'CLAUDE.md' },
                                { id: 'json', label: 'JSON' },
                                { id: 'structure', label: 'Files' },
                            ] as const).map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setExportFormat(f.id)}
                                    className="py-1 rounded text-[9px] font-mono transition-all"
                                    style={{
                                        color: exportFormat === f.id ? 'var(--accent)' : 'var(--txt-muted)',
                                        background: exportFormat === f.id ? 'var(--accent-muted)' : 'var(--surface-base)',
                                        border: `1px solid ${exportFormat === f.id ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--surface-border)'}`,
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="flex-1 overflow-y-auto mx-3 mb-2 rounded-md" style={{ background: 'var(--surface-base)', border: '1px solid var(--surface-border)' }}>
                        <pre className="p-2 text-[7.5px] font-mono leading-relaxed whitespace-pre-wrap break-all"
                            style={{ color: 'var(--txt-secondary)' }}>
                            {exportData || '# No data yet'}
                        </pre>
                    </div>

                    {/* Actions */}
                    <div className="px-3 pb-3 flex gap-1 shrink-0">
                        <button
                            onClick={handleCopy}
                            className="flex-1 py-1.5 rounded-md text-[9px] font-mono transition-all"
                            style={{ color: 'var(--accent)', background: 'var(--accent-muted)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                        <button
                            onClick={handleExportFile}
                            className="flex-1 py-1.5 rounded-md text-[9px] font-mono transition-all"
                            style={{ color: 'var(--txt-muted)', background: 'var(--surface-base)', border: '1px solid var(--surface-border)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--txt-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--txt-muted)'}
                        >
                            Download
                        </button>
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="px-4 py-2 shrink-0" style={{ borderTop: '1px solid var(--surface-border)' }}>
                <p className="text-[7px] font-mono leading-none" style={{ color: 'var(--txt-muted)' }}>
                    v0.8.0 · {projects.length} project{projects.length !== 1 ? 's' : ''}
                </p>
            </div>
        </aside>
    )
}

/* ─── Checkpoint Item ────────────────────────────────── */

function CheckpointItem({ checkpoint, onRestore, onDelete }: { checkpoint: Checkpoint; onRestore: () => void; onDelete: () => void }) {
    const time = new Date(checkpoint.timestamp)
    const timeStr = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

    return (
        <div className="group flex items-center gap-1.5 px-1.5 py-1.5 rounded-md transition-all"
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)', opacity: 0.5 }} />

            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium truncate leading-none" style={{ color: 'var(--txt-primary)' }}>{checkpoint.name}</p>
                <p className="text-[8px] font-mono mt-0.5 leading-none" style={{ color: 'var(--txt-muted)' }}>
                    {timeStr} · {checkpoint.nodes.length}n · {checkpoint.edges.length}e
                </p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                <button onClick={onRestore} title="Restore"
                    className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                    style={{ color: 'var(--txt-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--txt-muted)'}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>
                <button onClick={onDelete} title="Delete"
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ color: 'var(--txt-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FF4400'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--txt-muted)'}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
