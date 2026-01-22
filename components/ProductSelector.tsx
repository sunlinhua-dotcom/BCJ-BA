'use client'

import Image from 'next/image'
import { PRODUCTS } from '@/lib/constants'

// 已移动到 @/lib/constants

interface ProductSelectorProps {
    selectedProduct: string | null
    onSelect: (productId: string) => void
}

export function ProductSelector({ selectedProduct, onSelect }: ProductSelectorProps) {
    return (
        <div className="w-full px-5">
            <div className="flex items-end justify-between mb-6 px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-herb-accent/60 tracking-[0.2em] font-light uppercase mb-1">
                        Select Product
                    </span>
                    <h2 className="text-sm font-serif text-herb-dark tracking-wider">选择产品</h2>
                </div>
                <span className="text-[10px] text-herb-accent/40 font-light italic">
                    {PRODUCTS.length} ITEMS
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {PRODUCTS.map((product, index) => {
                    const isSelected = selectedProduct === product.id
                    return (
                        <button
                            key={product.id}
                            onClick={() => onSelect(product.id)}
                            className="group relative flex flex-col items-center text-center focus:outline-none"
                        >
                            {/* Card Container - Museum Glass Style */}
                            <div className={`
                                relative w-full aspect-[4/5] rounded-[24px] mb-4 overflow-hidden
                                transition-all duration-500 ease-out
                                flex items-center justify-center
                                ${isSelected
                                    ? 'bg-white shadow-[0_20px_40px_-12px_rgba(139,115,85,0.2)] ring-1 ring-[#8B7355]/30 translate-y-[-4px]'
                                    : 'bg-white/40 border border-white/60 hover:bg-white/80 hover:shadow-lg hover:shadow-herb-dark/5'}
                            `}>
                                {/* Subtle Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-[#8B7355]/5 opacity-0 transition-opacity duration-500 ${isSelected ? 'opacity-100' : ''}`} />

                                {/* Product Image - Pop Art Style */}
                                <div className="relative w-[75%] h-[75%] z-10">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        unoptimized
                                        priority={index < 2}
                                        className={`
                                            object-contain drop-shadow-xl transition-all duration-700
                                            ${isSelected ? 'scale-110 saturate-110' : 'scale-95 saturate-[0.85] opacity-90 group-hover:scale-100 group-hover:opacity-100'}
                                        `}
                                    />
                                    {/* Contact Shadow */}
                                    <div className="absolute bottom-[-10%] left-[10%] right-[10%] h-[20%] bg-black/20 blur-xl rounded-full opacity-60" />
                                </div>

                                {/* "Seal" Selection Indicator (Top Right) */}
                                <div className={`
                                    absolute top-3 right-3 z-20 transition-all duration-500
                                    ${isSelected ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-[-45deg]'}
                                `}>
                                    <div className="w-6 h-6 rounded-lg bg-[#8B1A1A] shadow-sm flex items-center justify-center backdrop-blur-[1px] ring-1 ring-white/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F8F6F3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Product Info - Minimalist & Elegant */}
                            <div className="space-y-1 transition-colors duration-300">
                                <h3 className={`text-base font-serif tracking-[0.1em] ${isSelected ? 'text-herb-dark font-semibold' : 'text-herb-dark/70'}`}>
                                    {product.name}
                                </h3>
                                <p className="text-[9px] text-herb-accent tracking-[0.3em] uppercase opacity-80">
                                    {product.sub}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
