'use client'

import Image from 'next/image'

export default function Header() {
    return (
        <header className="w-full pt-8 pb-6 px-6">
            {/* 顶部标签 - 极简线条装饰 */}
            <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#8B7355]" />
                <span className="text-[10px] text-[#8B7355] tracking-[0.3em] font-light uppercase">
                    BA 专属 · UGC 内容创作
                </span>
                <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#8B7355]" />
            </div>

            {/* 核心区域：Logo 主导 + 文字辅助 */}
            <div className="flex flex-row items-center justify-center gap-5 py-1">
                {/* Logo - 视觉核心 */}
                <div className="relative w-[130px] h-[65px] flex-shrink-0 drop-shadow-sm filter contrast-[1.05]">
                    <Image
                        src="/logo-opt.png"
                        alt="佰草集 HERBORIST"
                        fill
                        className="object-contain scale-110"
                        priority
                        unoptimized
                    />
                </div>

                {/* 分割线 - 极淡 */}
                <div className="w-[1px] h-8 bg-[#8B7355]/20" />

                {/* 标语 - 精致化，不抢 Logo 风头 */}
                <div className="flex flex-col justify-center gap-0.5 text-left">
                    <h1 className="text-lg font-serif text-herb-dark/90 tracking-[0.15em] leading-none whitespace-nowrap">
                        修源五行系列
                    </h1>
                    <p className="text-[8px] text-[#8B7355] font-light tracking-[0.4em] uppercase leading-none opacity-80 pl-[1px] mt-1">
                        HERBORIST · TAICHI
                    </p>
                </div>
            </div>
        </header>
    )
}
