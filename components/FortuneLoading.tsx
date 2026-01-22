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

export default function FortuneLoading() {
    const [fortune, setFortune] = useState<Fortune | null>(null)
    const [progress, setProgress] = useState(0)
    const [showText, setShowText] = useState(false)

    useEffect(() => {
        // 1. 随机抽取签文
        const randomIndex = Math.floor(Math.random() * fortunesData.length)
        setFortune(fortunesData[randomIndex])

        // 2. 延迟显示文字，制造"显影"的仪式感
        setTimeout(() => setShowText(true), 1500)

        // 3. 进度条逻辑
        const duration = 25000
        const interval = 100
        const step = 100 / (duration / interval)

        const timer = setInterval(() => {
            setProgress(prev => Math.min(prev + step, 99))
        }, interval)

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
                        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
                    />
                </div>
                <span className="text-[9px] text-[#8B7355]/40 tracking-[0.3em] font-mono uppercase animate-pulse">
                    AI Generating · {Math.floor(progress)}%
                </span>
            </div>
        </div>
    )
}
