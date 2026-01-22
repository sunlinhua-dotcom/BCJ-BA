'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header' // Fix: Default import
import { Download, Copy, Check, Share2 } from 'lucide-react' // Remove ArrowLeft
import { motion } from 'framer-motion'

interface ResultData {
    imageData: string
    copyTexts: {
        styleA: string
        styleB: string
        styleC: string
    }
    productName: string
}

type CopyStyle = 'styleA' | 'styleB' | 'styleC'

const STYLE_LABELS: Record<CopyStyle, string> = {
    styleA: '闺蜜分享',
    styleB: '东方美学',
    styleC: '成分科普'
}

export default function ResultPage() {
    const router = useRouter()
    const [result, setResult] = useState<ResultData | null>(null)
    const [copied, setCopied] = useState(false)
    const [activeStyle, setActiveStyle] = useState<CopyStyle>('styleA')

    useEffect(() => {
        const stored = sessionStorage.getItem('herborist_result')
        if (stored) {
            const parsed = JSON.parse(stored)
            // 兼容旧格式
            if (parsed.copyText && !parsed.copyTexts) {
                parsed.copyTexts = { styleA: parsed.copyText, styleB: parsed.copyText, styleC: parsed.copyText }
            }
            setResult(parsed)
        } else {
            router.push('/')
        }
    }, [router])

    const currentCopy = result?.copyTexts?.[activeStyle] || ''

    const handleCopy = async () => {
        if (!currentCopy) return
        try {
            await navigator.clipboard.writeText(currentCopy)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (e) {
            console.error('Copy failed:', e)
        }
    }

    const handleDownload = () => {
        if (!result) return
        const link = document.createElement('a')
        link.href = `data:image/png;base64,${result.imageData}`
        link.download = `herborist_${result.productName}_${Date.now()}.png`
        link.click()
    }

    const handleShare = async () => {
        if (!result) return

        if (typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
                // Convert base64 to blob for sharing
                const response = await fetch(`data:image/png;base64,${result.imageData}`)
                const blob = await response.blob()
                const file = new File([blob], 'herborist.png', { type: 'image/png' })

                await (navigator as Navigator & { share: (data: ShareData & { files?: File[] }) => Promise<void> }).share({
                    title: `佰草集 ${result.productName}`,
                    text: currentCopy,
                    files: [file]
                })
            } catch (e) {
                console.error('Share failed:', e)
            }
        }
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 relative animate-pulse">
                        <Image
                            src="/logo-new.png"
                            alt="Herborist"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F8F6F3] to-[#EDE8E1] pb-safe">
            {/* 复用全局 Header */}
            <Header />

            <div className="px-5 pb-8 space-y-8">
                {/* 状态提示 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-1 pt-2"
                >
                    <p className="text-[10px] text-herb-accent tracking-[0.3em] font-light uppercase">
                        Generation Complete
                    </p>
                    <h2 className="text-xl font-serif text-herb-dark tracking-wider">
                        您的专属{result.productName}场景
                    </h2>
                </motion.div>

                {/* 生成图片 - 拍立得/相纸风格 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-full aspect-square rounded-2xl bg-white p-3 shadow-2xl shadow-herb-primary/10 ring-1 ring-herb-primary/5"
                >
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <Image
                            src={`data:image/png;base64,${result.imageData}`}
                            alt="生成结果"
                            fill // Changed from layout="fill" to fill
                            className="object-cover"
                        />
                    </div>
                    {/* 装饰性水印或纹理可在此处添加 */}
                </motion.div>

                {/* 种草文案卡片 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    {/* 风格切换标签 */}
                    <div className="flex items-center gap-2 px-1 overflow-x-auto pb-1">
                        {(['styleA', 'styleB', 'styleC'] as CopyStyle[]).map((style) => (
                            <button
                                key={style}
                                onClick={() => setActiveStyle(style)}
                                className={`
                                    px-3 py-1.5 rounded-full text-[10px] tracking-wider whitespace-nowrap transition-all duration-300
                                    ${activeStyle === style
                                        ? 'bg-herb-primary text-white shadow-sm'
                                        : 'bg-white/60 text-herb-dark/70 hover:bg-white border border-herb-gold/20'}
                                `}
                            >
                                {STYLE_LABELS[style]}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-herb-accent tracking-[0.2em] uppercase font-light">
                            {STYLE_LABELS[activeStyle]}
                        </span>
                        <button
                            onClick={handleCopy}
                            className={`
                                flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-wider transition-all duration-300
                                ${copied
                                    ? 'bg-herb-primary text-white shadow-md'
                                    : 'bg-herb-gold/10 text-herb-dark hover:bg-herb-gold/20'}
                            `}
                        >
                            {copied ? (
                                <>
                                    <Check size={12} strokeWidth={2.5} />
                                    <span>已复制</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={12} />
                                    <span>复制文案</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm">
                        <p className="font-serif text-sm text-herb-dark/90 leading-loose text-justify whitespace-pre-wrap">
                            {currentCopy}
                        </p>
                        {/* 装饰角标 */}
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Image src="/logo-new.png" alt="watermark" width={24} height={24} />
                        </div>
                    </div>
                </motion.div>

                {/* 操作按钮组 - 3个按钮 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3 pt-2"
                >
                    {/* 保存图片 - 主按钮 */}
                    <button
                        onClick={handleDownload}
                        className="w-full h-14 rounded-full bg-gradient-to-r from-herb-dark to-[#3D5A43] text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-herb-dark/20 active:scale-[0.98] transition-all"
                    >
                        <Download size={18} />
                        <span className="tracking-widest text-sm">保存图片</span>
                    </button>

                    {/* 次要按钮组 */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="h-12 rounded-full bg-white text-herb-dark font-medium flex items-center justify-center gap-2 border border-herb-gold/30 shadow-sm active:scale-[0.98] transition-all"
                        >
                            <span className="tracking-wider text-sm">继续生成</span>
                        </button>

                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                            <button
                                onClick={handleShare}
                                className="h-12 rounded-full bg-white text-herb-dark font-medium flex items-center justify-center gap-2 border border-herb-gold/30 shadow-sm active:scale-[0.98] transition-all"
                            >
                                <Share2 size={16} />
                                <span className="tracking-wider text-sm">分享</span>
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
