'use client'
import { motion } from 'framer-motion'

interface StepIndicatorProps {
    currentStep: number  // 1=角色, 2=产品, 3=场景
    totalSteps?: number
}

const STEP_LABELS = ['选角色', '选产品', '上传场景']

export default function StepIndicator({ currentStep, totalSteps = 3 }: StepIndicatorProps) {
    return (
        <div className="step-indicator">
            {Array.from({ length: totalSteps }, (_, i) => {
                const step = i + 1
                const isDone = step < currentStep
                const isCurrent = step === currentStep
                return (
                    <div key={step} className="step-item">
                        <div className="step-item__dot-wrap">
                            <motion.div
                                className={`step-dot ${isDone ? 'step-dot--done' : ''} ${isCurrent ? 'step-dot--current' : ''}`}
                                animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                                transition={{ duration: 0.6, repeat: isCurrent ? Infinity : 0, repeatDelay: 2 }}
                            >
                                {isDone ? (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <span>{step}</span>
                                )}
                            </motion.div>
                            {step < totalSteps && (
                                <div className={`step-line ${isDone ? 'step-line--done' : ''}`} />
                            )}
                        </div>
                        <span className={`step-label ${isCurrent ? 'step-label--current' : ''}`}>
                            {STEP_LABELS[i]}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
