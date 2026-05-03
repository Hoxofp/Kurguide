import { useState, useCallback } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { PocketAdvisor } from './PocketAdvisor'
import { generateAlternatives, generateClarifyingQuestions, type AIQuestion } from '../services/geminiService'

export function PromptBar() {
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')
    const [showAdvisor, setShowAdvisor] = useState(false)
    const { setAlternatives, previewMode } = useCanvasStore()

    const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([])

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim() || loading || previewMode) return
        setLoading(true)
        setStatus('✦ Analyzing requirements...')

        try {
            const questions = await generateClarifyingQuestions(prompt)
            setAiQuestions(questions)
            setShowAdvisor(true)
            setStatus('')
        } catch (err: any) {
            console.error('Failed to generate questions:', err)
            const msg = err?.message || 'Unknown error'
            setStatus(`Error: ${msg.substring(0, 40)}`)
            setTimeout(() => setStatus(''), 5000)
        } finally {
            setLoading(false)
        }
    }, [prompt, loading, previewMode])

    const handleAdvisorComplete = async (answers: Record<string, string>) => {
        setShowAdvisor(false)
        setLoading(true)
        setStatus('✦ Generating with Gemini AI...')

        try {
            const alts = await generateAlternatives(prompt, answers, setStatus)
            setAlternatives(alts)
            setPrompt('')
            setStatus('')
        } catch (err: any) {
            console.error('Generation failed:', err)
            const msg = err?.message || 'Unknown error'
            setStatus(`Error: ${msg.substring(0, 40)}`)
            setTimeout(() => setStatus(''), 5000)
        } finally {
            setLoading(false)
            setAiQuestions([])
        }
    }

    return (
        <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[400px] px-4">
                <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2 shadow-prompt transition-opacity"
                    style={{
                        background: 'rgba(19, 19, 22, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid #252529',
                        opacity: previewMode ? 0.3 : 1,
                        pointerEvents: previewMode ? 'none' : 'auto'
                    }}
                >
                    <button
                        onClick={handleSubmit} // Trigger AI flow manually if desired
                        disabled={loading || previewMode}
                        title="Pocket Advisor"
                        className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors disabled:opacity-20 shrink-0"
                    >
                        🧙‍♂️
                    </button>

                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${loading ? 'bg-violet animate-pulse-slow' : 'bg-surface-border'}`} />

                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Describe an architecture or use the Advisor..."
                        disabled={loading || previewMode}
                        className="flex-1 bg-transparent text-txt-primary text-[11px] font-sans placeholder:text-txt-muted outline-none disabled:opacity-40"
                    />

                    {status ? (
                        <span className="text-[9px] text-violet font-mono whitespace-nowrap animate-pulse">{status}</span>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !prompt.trim() || previewMode}
                            className="px-2 py-1 rounded-md text-[9px] font-mono text-violet hover:text-cream transition-colors disabled:opacity-20"
                            style={{ background: 'rgba(104, 90, 255, 0.08)', border: '1px solid rgba(104, 90, 255, 0.15)' }}
                        >
                            Generate
                        </button>
                    )}
                </div>
            </div>

            {showAdvisor && aiQuestions.length > 0 && (
                <PocketAdvisor 
                    questions={aiQuestions}
                    prompt={prompt}
                    onClose={() => {
                        setShowAdvisor(false)
                        setAiQuestions([])
                    }} 
                    onComplete={handleAdvisorComplete} 
                />
            )}
        </>
    )
}

