'use client'

import { useCallback, useState } from 'react'
// Lucide icons replaced with inline SVGs for stability
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface EnvironmentUploaderProps {
    file: File | null
    onFileChange: (file: File | null) => void
}

export function EnvironmentUploader({ file, onFileChange }: EnvironmentUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.[0]) {
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile.type.startsWith('image/')) {
                onFileChange(droppedFile)
            }
        }
    }, [onFileChange])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onFileChange(e.target.files[0])
        }
    }, [onFileChange])

    return (
        <div className="w-full px-5">
            <div className="flex items-center justify-between mb-4 pl-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-herb-accent/60 tracking-[0.2em] font-light uppercase mb-1">
                        Upload Environment
                    </span>
                    <h2 className="text-sm font-serif text-herb-dark tracking-wider">上传环境图</h2>
                </div>
                {file && (
                    <button
                        onClick={() => onFileChange(null)}
                        className="text-[10px] text-herb-accent hover:text-red-400 transition-colors tracking-wider"
                    >
                        清除 REMOVE
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onDragOver={handleDragOver}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`
                            relative h-48 rounded-[20px] overflow-hidden transition-all duration-300 group
                            border border-dashed border-[#8B7355]/30
                            ${isDragging
                                ? 'bg-[#8B7355]/10 border-[#8B7355]'
                                : 'bg-white/40 hover:bg-white/60 hover:border-[#8B7355]/50'}
                        `}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileSelect}
                        />

                        {/* 装饰性 "画框" 四角标记 */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#8B7355]/40 rounded-tl-xl m-2" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#8B7355]/40 rounded-tr-xl m-2" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#8B7355]/40 rounded-bl-xl m-2" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#8B7355]/40 rounded-br-xl m-2" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <motion.div
                                animate={{ scale: isDragging ? 1.1 : 1 }}
                                className={`
                                    w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300
                                    ${isDragging ? 'bg-[#8B7355] text-white shadow-lg' : 'bg-white text-[#8B7355] shadow-sm'}
                                `}
                            >
                                {/* Using inline SVG icons */}
                                {isDragging ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                )}
                            </motion.div>

                            <h3 className="text-sm font-serif text-herb-dark mb-1 tracking-wider">
                                {isDragging ? '松开以上传' : '点此上传环境图'}
                            </h3>
                            <p className="text-[10px] text-herb-accent/70 tracking-widest uppercase opacity-60">
                                Drag & Drop or Click to Browse
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-48 rounded-[20px] overflow-hidden shadow-xl shadow-[#8B7355]/10 ring-1 ring-white group"
                    >
                        <Image
                            src={URL.createObjectURL(file)}
                            alt="环境预览"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105 saturate-[0.95] group-hover:saturate-100"
                        />

                        {/* Elegant Vignette */}
                        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.1)] pointer-events-none" />

                        {/* Remove button */}
                        <button
                            onClick={() => onFileChange(null)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 z-20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        {/* File info - Elegant Badge */}
                        <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md border border-white/20 rounded-full py-1 px-3 flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] shadow-[0_0_8px_rgba(139,115,85,0.8)] animate-pulse" />
                            <span className="text-[10px] font-medium tracking-widest uppercase">Environment Ready</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
