'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import fortunesData from '@/app/data/fortunes.json'

// 定义签文类型
type Fortune = {
    id: number
    text: string
    interpret: string
}

export default function FortuneLoading({ externalProgress }: { externalProgress?: number }) {
    const [fortune, setFortune] = useState<Fortune | null>(null)
    const [internalProgress, setInternalProgress] = useState(0)
    const [showText, setShowText] = useState(false)

    // 最终显示的进度位
    const displayProgress = externalProgress !== undefined ? externalProgress : internalProgress

    useEffect(() => {
        // 1. 随机抽取签文
        const randomIndex = Math.floor(Math.random() * fortunesData.length)
        setFortune(fortunesData[randomIndex])

        // 2. 延迟显示文字，制造"显影"的仪式感
        setTimeout(() => setShowText(true), 1500)

        // 3. 仿心理学进度条逻辑：前期快，后期慢，不封顶但逼近 99
        let currentProgress = 0
        const timer = setInterval(() => {
            if (currentProgress < 70) {
                currentProgress += Math.random() * 5 // 前期爆发
            } else if (currentProgress < 90) {
                currentProgress += Math.random() * 1 // 中期沉稳
            } else if (currentProgress < 99) {
                currentProgress += (99 - currentProgress) * 0.1 // 无限逼近但不到 100
            }
            setInternalProgress(currentProgress)
        }, 300)

        return () => clearInterval(timer)
    }, [])

    if (!fortune) return null

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
            {/* 1. 深邃暗夜背景 (CSS 径向渐变，极高性能) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1A261D_0%,#0F1510_60%,#050806_100%)]" />

            {/* 2. 呼吸光晕 (太极流转暗示) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-30">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#8B7355]/20 to-transparent rounded-full blur-[80px] animate-pulse-slow" />
            </div>

            {/* 3. 核心仪式区 */}
            <div className="relative z-10 flex flex-col items-center max-w-xs text-center">

                {/* 顶部：Logo 悬浮 (呼吸感) */}
                <div className="mb-12 relative opacity-80 animate-float-slow">
                    <div className="relative w-16 h-8">
                        <Image
                            src="/logo-opt.png"
                            alt="Logo"
                            fill
                            className="object-contain brightness-0 invert opacity-60"
                        />
                    </div>
                </div>

                {/* 中间：签文显影 (Blur + FadeIn) */}
                <div className={`transition-all duration-[2000ms] ease-out transform ${showText ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-lg translate-y-4'}`}>

                    {/* 装饰线 */}
                    <div className="w-[1px] h-16 mx-auto bg-gradient-to-b from-transparent via-[#8B7355]/40 to-transparent mb-8" />

                    <h2 className="text-2xl md:text-3xl font-serif tracking-[0.2em] leading-relaxed text-[#E5Dec5] drop-shadow-[0_0_15px_rgba(229,222,197,0.3)]">
                        {fortune.text}
                    </h2>

                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#8B7355]/30 to-transparent my-8" />

                    <p className="text-sm font-light text-[#8B7355] tracking-widest italic opacity-90">
                        {fortune.interpret}
                    </p>

                    {/* 装饰线 */}
                    <div className="w-[1px] h-16 mx-auto bg-gradient-to-t from-transparent via-[#8B7355]/40 to-transparent mt-8" />
                </div>
            </div>

            {/* 4. 底部进度 (极简) */}
            <div className="absolute bottom-12 w-full px-12 flex flex-col items-center gap-3">
                <div className="w-full h-[1px] bg-white/5 relative overflow-hidden">
                    <div
                        className="absolute left-0 top-0 h-full bg-[#8B7355]/60 shadow-[0_0_10px_#8B7355]"
                        style={{ width: `${displayProgress}%`, transition: 'width 0.3s ease-out' }}
                    />
                </div>
                <span className="text-[9px] text-[#8B7355]/40 tracking-[0.3em] font-mono uppercase animate-pulse">
                    AI Generating · {Math.floor(displayProgress)}%
                </span>
            </div>
        </div>
    )
}
