import { useState } from 'react'
import { useThemeStore, THEMES } from '../store/themeStore'

export function ThemePicker() {
    const { activeTheme, setTheme } = useThemeStore()
    const [expanded, setExpanded] = useState(false)

    const isLightTheme = (id: string) => ['ivory', 'lavender', 'pistachio', 'peach', 'cloud', 'arctic'].includes(id)

    return (
        <div className="absolute bottom-3 right-3 z-50">
            {/* Expanded palette */}
            {expanded && (
                <div
                    className="mb-1.5 rounded-xl p-3"
                    style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--surface-border)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                >
                    <p className="text-[8px] font-mono uppercase tracking-[0.12em] mb-2.5" style={{ color: 'var(--txt-muted)' }}>
                        Choose Theme
                    </p>

                    {/* Dark themes */}
                    <p className="text-[7px] font-mono uppercase tracking-[0.1em] mb-1.5" style={{ color: 'var(--txt-muted)', opacity: 0.6 }}>Dark</p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {THEMES.filter(t => !isLightTheme(t.id)).map((theme) => (
                            <ThemeDot key={theme.id} theme={theme} active={activeTheme === theme.id}
                                onClick={() => { setTheme(theme.id); setExpanded(false) }} isLight={false} />
                        ))}
                    </div>

                    {/* Light themes */}
                    <p className="text-[7px] font-mono uppercase tracking-[0.1em] mb-1.5" style={{ color: 'var(--txt-muted)', opacity: 0.6 }}>Light</p>
                    <div className="grid grid-cols-4 gap-2">
                        {THEMES.filter(t => isLightTheme(t.id)).map((theme) => (
                            <ThemeDot key={theme.id} theme={theme} active={activeTheme === theme.id}
                                onClick={() => { setTheme(theme.id); setExpanded(false) }} isLight={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all"
                style={{
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--surface-border)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                }}
            >
                {/* 3-color preview of current theme */}
                <ThreeColorPreview theme={THEMES.find(t => t.id === activeTheme)!} size={14} />
                <span className="text-[9px] font-mono" style={{ color: 'var(--txt-secondary)' }}>
                    {THEMES.find(t => t.id === activeTheme)?.name}
                </span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--txt-muted)' }}
                    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
        </div>
    )
}

/* 3-color stacked preview showing 60-30-10 */
function ThreeColorPreview({ theme, size }: { theme: { preview: [string, string, string] }; size: number }) {
    return (
        <div className="flex" style={{ gap: 1 }}>
            <div className="rounded-sm" style={{ width: size * 0.6, height: size, backgroundColor: theme.preview[0], border: '0.5px solid rgba(128,128,128,0.2)' }} />
            <div className="rounded-sm" style={{ width: size * 0.3, height: size, backgroundColor: theme.preview[1], border: '0.5px solid rgba(128,128,128,0.2)' }} />
            <div className="rounded-sm" style={{ width: size * 0.2, height: size, backgroundColor: theme.preview[2], border: '0.5px solid rgba(128,128,128,0.2)' }} />
        </div>
    )
}

/* Individual theme dot in the picker grid */
function ThemeDot({ theme, active, onClick, isLight }: {
    theme: { id: string; name: string; preview: [string, string, string] }; active: boolean; onClick: () => void; isLight: boolean
}) {
    return (
        <button onClick={onClick} className="group flex flex-col items-center gap-1">
            <div
                className={`rounded-md overflow-hidden flex transition-all duration-200 ${active ? 'scale-110' : 'opacity-75 hover:opacity-100 hover:scale-105'}`}
                style={{
                    width: 32, height: 20,
                    outline: active ? '2px solid var(--accent)' : 'none',
                    outlineOffset: 2,
                    border: isLight ? '0.5px solid #bbb' : '0.5px solid rgba(255,255,255,0.08)',
                }}
            >
                <div style={{ width: '60%', height: '100%', backgroundColor: theme.preview[0] }} />
                <div style={{ width: '30%', height: '100%', backgroundColor: theme.preview[1] }} />
                <div style={{ width: '10%', height: '100%', backgroundColor: theme.preview[2] }} />
            </div>
            <span className="text-[7px] font-mono leading-none" style={{ color: active ? 'var(--txt-primary)' : 'var(--txt-muted)' }}>
                {theme.name}
            </span>
        </button>
    )
}
