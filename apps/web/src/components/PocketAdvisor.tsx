import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type AIQuestion } from '../services/geminiService'

interface PocketAdvisorProps {
    questions: AIQuestion[]
    prompt: string
    onClose: () => void
    onComplete: (answers: Record<string, string>) => void
}

export function PocketAdvisor({ questions, onClose, onComplete }: PocketAdvisorProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const handleAnswer = (val: string) => {
        const currentQ = questions[currentIndex]
        const newAnswers = { ...answers, [currentQ.question]: val }
        setAnswers(newAnswers)

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            // All questions answered, trigger completion
            onComplete(newAnswers)
        }
    }

    if (!questions || questions.length === 0) return null

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--surface-secondary)', border: '1px solid var(--surface-border)' }}
            >
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--surface-border)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-[14px]">🧙‍♂️</span>
                        <h2 className="text-[12px] font-semibold tracking-tight" style={{ color: 'var(--txt-primary)' }}>AI Architect Advisor</h2>
                    </div>
                    <button onClick={onClose} className="text-[10px] uppercase font-mono tracking-wider hover:opacity-100 opacity-60 transition-opacity" style={{ color: 'var(--txt-muted)' }}>Skip & Generate</button>
                </div>

                <div className="p-6 min-h-[220px] relative flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full"
                        >
                            <p className="text-[13px] font-medium mb-6 text-center" style={{ color: 'var(--txt-primary)' }}>
                                {questions[currentIndex]?.question}
                            </p>
                            
                            <div className="flex flex-col gap-2">
                                {questions[currentIndex]?.options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleAnswer(opt.label)} // Use label so the AI gets the full context
                                        className="py-2.5 px-4 rounded-lg text-[11px] font-medium transition-all text-left group"
                                        style={{ background: 'var(--surface-base)', border: '1px solid var(--surface-border)', color: 'var(--txt-secondary)' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--accent)'
                                            e.currentTarget.style.color = 'var(--txt-primary)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--surface-border)'
                                            e.currentTarget.style.color = 'var(--txt-secondary)'
                                        }}
                                    >
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-[10px]" style={{ color: 'var(--accent)' }}>▶</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="px-6 py-3 flex gap-1 justify-center border-t" style={{ borderColor: 'var(--surface-border)' }}>
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className="h-1 rounded-full transition-all"
                            style={{ 
                                width: i === currentIndex ? '16px' : '4px',
                                background: i <= currentIndex ? 'var(--accent)' : 'var(--surface-border)',
                                opacity: i === currentIndex ? 1 : 0.4
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
