'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { PRODUCTS, UserRole } from '@/lib/constants'
import Header from '@/components/Header'
import FortuneLoading from '@/components/FortuneLoading'
import RoleSelector from '@/components/RoleSelector'
import KOCLabels from '@/components/KOCLabels'
import StepIndicator from '@/components/StepIndicator'

// ─── 产品卡 ──────────────────────────────────────────────────────────────────
function ProductCard({
    product,
    selected,
    onClick,
}: {
    product: typeof PRODUCTS[0]
    selected: boolean
    onClick: () => void
}) {
    return (
        <motion.button
            className={`product-card ${selected ? 'product-card--selected' : ''}`}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-pressed={selected}
        >
            {selected && (
                <motion.div
                    className="product-card__check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                >
                    ✓
                </motion.div>
            )}
            <div className="product-card__image-wrap">
                <Image src={product.image} alt={product.name} width={80} height={80} className="product-card__image" />
            </div>
            <div className="product-card__body">
                <p className="product-card__name">{product.name}</p>
                <p className="product-card__sub">{product.sub}</p>
            </div>
        </motion.button>
    )
}

// ─── 上传区 ──────────────────────────────────────────────────────────────────
function EnvironmentUploader({
    onChange,
}: {
    file: File | null
    onChange: (f: File | null) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFile = useCallback((f: File) => {
        onChange(f)
        const reader = new FileReader()
        reader.onload = e => setPreview(e.target?.result as string)
        reader.readAsDataURL(f)
    }, [onChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const f = e.dataTransfer.files[0]
        if (f && f.type.startsWith('image/')) handleFile(f)
    }, [handleFile])

    return (
        <div className="env-uploader">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                id="env-file-input"
            />
            {preview ? (
                <motion.div className="env-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="场景预览" className="env-preview__img" />
                    <button
                        className="env-preview__remove"
                        onClick={() => { onChange(null); setPreview(null) }}
                        aria-label="移除图片"
                    >
                        ×
                    </button>
                </motion.div>
            ) : (
                <motion.label
                    htmlFor="env-file-input"
                    className={`env-dropzone ${isDragging ? 'env-dropzone--dragging' : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    whileHover={{ borderColor: 'var(--color-primary)' }}
                >
                    <div className="env-dropzone__icon">🌿</div>
                    <p className="env-dropzone__text">点击或拖拽上传拍摄场景</p>
                    <p className="env-dropzone__hint">支持 JPG / PNG，建议正方形构图</p>
                    <p className="env-dropzone__skip">不上传则自动生成唯美背景</p>
                </motion.label>
            )}
        </div>
    )
}

// ─── 主页面 ──────────────────────────────────────────────────────────────────
export default function HomePage() {
    const router = useRouter()

    // 状态
    const [role, setRole] = useState<UserRole | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
    const [skinType, setSkinType] = useState('combo')
    const [ageGroup, setAgeGroup] = useState('26-30')
    const [scene, setScene] = useState('daily')
    const [envFile, setEnvFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 步骤推算
    const currentStep = !role ? 1 : !selectedProduct ? 2 : 3

    // 是否可以提交
    const canSubmit = !!role && !!selectedProduct

    const handleGenerate = async () => {
        if (!canSubmit) return
        setIsLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('productId', selectedProduct!)
            formData.append('role', role!)
            if (envFile) formData.append('envFile', envFile)

            // KOC 精准标签 - 传中文 label 给 AI（而非英文 id）
            if (role === 'KOC') {
                const skinLabels: Record<string, string> = { dry: '干皮', oily: '油皮', combo: '混合皮', sensitive: '敏感肌' }
                const ageLabels: Record<string, string> = { '20-25': '20-25岁', '26-30': '26-30岁', '31-35': '31-35岁', '35+': '35岁以上' }
                const sceneLabels: Record<string, string> = { daily: '日常护肤', seasonal: '换季修护', travel: '出行旅行', bedtime: '睡前护理' }
                formData.append('skinType', skinLabels[skinType] || skinType)
                formData.append('ageGroup', ageLabels[ageGroup] || ageGroup)
                formData.append('scene', sceneLabels[scene] || scene)
            }

            const res = await fetch('/api/generate', { method: 'POST', body: formData })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || '生成失败，请重试')
            }

            const data = await res.json()

            // 存入 sessionStorage
            const resultKey = `result_${Date.now()}`
            sessionStorage.setItem(resultKey, JSON.stringify({
                imageData: data.imageData,
                copyTexts: data.copyTexts,
                productName: data.productName,
                role: data.role,
                timestamp: new Date().toISOString(),
            }))

            router.push(`/result?key=${resultKey}`)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '网络错误，请稍后重试')
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <FortuneLoading />
    }

    const product = PRODUCTS.find(p => p.id === selectedProduct)

    return (
        <div className="page-container">
            <Header />

            {/* 步骤指示 */}
            <motion.div
                className="section section--step"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <StepIndicator currentStep={currentStep} />
            </motion.div>

            {/* Step 1: 角色选择 */}
            <motion.div
                className="section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <RoleSelector selected={role} onSelect={setRole} />
            </motion.div>

            {/* Step 2: 产品选择（角色选了才展开） */}
            <AnimatePresence>
                {role && (
                    <motion.div
                        className="section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <h2 className="section-title">
                            <span className="section-num">02</span> 选择产品
                        </h2>
                        <div className="product-grid">
                            {PRODUCTS.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    selected={selectedProduct === p.id}
                                    onClick={() => setSelectedProduct(p.id)}
                                />
                            ))}
                        </div>

                        {/* KOC 精准标签（仅 KOC 且已选产品时展开） */}
                        <KOCLabels
                            visible={role === 'KOC' && !!selectedProduct}
                            skinType={skinType}
                            ageGroup={ageGroup}
                            scene={scene}
                            onSkinTypeChange={setSkinType}
                            onAgeGroupChange={setAgeGroup}
                            onSceneChange={setScene}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step 3: 场景上传（产品选了才展开） */}
            <AnimatePresence>
                {role && selectedProduct && (
                    <motion.div
                        className="section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <h2 className="section-title">
                            <span className="section-num">03</span> 上传拍摄场景
                            <span className="section-optional">可选</span>
                        </h2>
                        <EnvironmentUploader file={envFile} onChange={setEnvFile} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 错误提示 */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="error-banner"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 生成按钮 */}
            <AnimatePresence>
                {canSubmit && (
                    <motion.div
                        className="section section--submit"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="submit-summary">
                            <span className="submit-summary__role">{role === 'BA' ? '🏪 美容顾问' : '🌟 种草达人'}</span>
                            <span className="submit-summary__sep">·</span>
                            <span className="submit-summary__product">{product?.name}</span>
                        </div>
                        <motion.button
                            className="btn-generate"
                            onClick={handleGenerate}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <span className="btn-generate__text">✨ 开始生成</span>
                            <span className="btn-generate__sub">
                                {role === 'BA' ? '合成图 + BA专属文案' : '合成图 + 精准种草文案'}
                            </span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
