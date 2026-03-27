'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { KOC_SKIN_TYPES, KOC_AGE_GROUPS, KOC_SCENES } from '@/lib/constants'

interface KOCLabelsProps {
    visible: boolean
    skinType: string
    ageGroup: string
    scene: string
    onSkinTypeChange: (v: string) => void
    onAgeGroupChange: (v: string) => void
    onSceneChange: (v: string) => void
}

function ChipGroup({
    label,
    options,
    selected,
    onChange,
}: {
    label: string
    options: { id: string; label: string }[]
    selected: string
    onChange: (id: string) => void
}) {
    return (
        <div className="chip-group">
            <span className="chip-group__label">{label}</span>
            <div className="chip-group__chips">
                {options.map(opt => (
                    <button
                        key={opt.id}
                        className={`chip ${selected === opt.id ? 'chip--selected' : ''}`}
                        onClick={() => onChange(opt.id)}
                        type="button"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function KOCLabels({
    visible,
    skinType, ageGroup, scene,
    onSkinTypeChange, onAgeGroupChange, onSceneChange
}: KOCLabelsProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="koc-labels"
                    key="koc-labels"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="koc-labels__inner">
                        <div className="koc-labels__header">
                            <span className="koc-labels__title">🎯 精准种草标签</span>
                            <span className="koc-labels__hint">选择后文案更精准匹配你的目标用户</span>
                        </div>
                        <ChipGroup
                            label="肤质"
                            options={KOC_SKIN_TYPES}
                            selected={skinType}
                            onChange={onSkinTypeChange}
                        />
                        <ChipGroup
                            label="年龄段"
                            options={KOC_AGE_GROUPS}
                            selected={ageGroup}
                            onChange={onAgeGroupChange}
                        />
                        <ChipGroup
                            label="场景"
                            options={KOC_SCENES}
                            selected={scene}
                            onChange={onSceneChange}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
