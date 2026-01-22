'use client'

import { useState, useEffect } from 'react'
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

    useEffect(() => {
        // 1. 随机抽取签文
        const randomIndex = Math.floor(Math.random() * fortunesData.length)
        setFortune(fortunesData[randomIndex])

        // 2. 模拟进度条 (20秒左右跑完)
        const duration = 20000 // 20s
        const interval = 100 // update every 100ms
        const steps = duration / interval
        const increment = 100 / steps

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + increment
                if (next >= 99) {
                    clearInterval(timer)
                    return 99
                }
                return next
            })
        }, interval)

        return () => clearInterval(timer)
    }, [])

    if (!fortune) return null

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F6F3] text-herb-dark px-6">
            {/* 顶部的 Loading 动画圈 */}
            <div className="relative mb-12">
                <div className="w-16 h-16 border-2 border-herb-accent/20 rounded-full animate-spin-slow" />
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-herb-dark rounded-full animate-spin" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-serif text-xs tracking-wider">
                    {Math.round(progress)}%
                </div>
            </div>

            {/* 签文展示区 - 竖排版式增加东方感 */}
            <div className="flex flex-col items-center animate-fade-in-up space-y-6 max-w-sm">

                {/* 装饰线 */}
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-herb-accent/50 mb-4" />

                <div className="text-center space-y-2">
                    <p className="text-[10px] tracking-[0.4em] text-herb-accent uppercase mb-2 opacity-60">
                        HERBAL FORTUNE
                    </p>
                    <h2 className="text-xl md:text-2xl font-serif tracking-widest leading-relaxed text-[#8B1A1A]">
                        {/* 尝试竖排效果不好控制，这里先用横排但加宽间距 */}
                        「 {fortune.text} 」
                    </h2>
                </div>

                <div className="w-8 h-[1px] bg-herb-dark/20 my-4" />

                <p className="text-sm font-light text-herb-dark/80 tracking-wide text-center leading-relaxed italic">
                    {fortune.interpret}
                </p>

                {/* 装饰线 */}
                <div className="w-[1px] h-12 bg-gradient-to-t from-transparent to-herb-accent/50 mt-4" />

            </div>

            {/* 底部提示 */}
            <div className="absolute bottom-10 text-center space-y-1 opacity-50">
                <p className="text-[9px] tracking-[0.2em] font-light">
                    正在调配您的五行专属配方...
                </p>
                <p className="text-[8px] tracking-widest font-mono text-herb-accent">
                    AI GENERATING
                </p>
            </div>
        </div>
    )
}
