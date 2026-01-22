'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import { ProductSelector } from '@/components/ProductSelector'
import { PRODUCTS } from '@/lib/constants'
import { EnvironmentUploader } from '@/components/EnvironmentUploader'
import { Sparkles, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { compressImage } from '@/lib/client-compression'

export default function HomePage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [envFile, setEnvFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const canSubmit = selectedProduct && envFile && !isSubmitting

  const [realProgress, setRealProgress] = useState(0) // 真实进度百分比

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setProgress('正在压缩图片...')
    setRealProgress(0)

    // 模拟平滑进度增长
    let progressInterval: NodeJS.Timeout | null = null
    const smoothProgress = (start: number, end: number, duration: number) => {
      const startTime = Date.now()
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const percent = Math.min(elapsed / duration, 1)

        const current = start + (end - start) * percent
        setRealProgress(Math.floor(current))
        if (percent >= 1 && progressInterval) clearInterval(progressInterval)
      }, 100)
    }

    try {
      // 阶段1: 客户端压缩 (0% -> 10%, 约2秒)
      smoothProgress(0, 10, 2000)
      const compressedEnv = await compressImage(envFile, 1200, 0.8)
      if (progressInterval) clearInterval(progressInterval)

      // 阶段2: 上传 (10% -> 30%, 约3-5秒)
      setProgress('正在上传至服务器...')
      smoothProgress(10, 30, 4000)

      const formData = new FormData()
      formData.append('productId', selectedProduct)
      formData.append('envFile', compressedEnv)

      // 阶段3: AI 处理 (30% -> 95%, 约25-35秒)
      setProgress('AI正在创作中...')
      smoothProgress(30, 95, 30000)

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      if (progressInterval) clearInterval(progressInterval)
      setRealProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      // 存储结果并跳转
      sessionStorage.setItem('herborist_result', JSON.stringify({
        imageData: data.imageData,
        copyTexts: data.copyTexts,
        productName: data.productName
      }))

      router.push('/result')

    } catch (error: unknown) {
      if (progressInterval) clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : '生成失败'
      console.error('Submit error:', errorMessage)

      // 友好的错误提示
      let userMessage = errorMessage
      if (errorMessage.includes('503')) {
        userMessage = 'AI 服务繁忙，请稍后再试（503）'
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        userMessage = '请求超时，请检查网络后重试'
      } else if (errorMessage.includes('Failed to fetch')) {
        userMessage = '网络连接失败，请检查网络'
      }

      alert(userMessage)
    } finally {
      setIsSubmitting(false)
      setProgress('')
    }
  }

  const selectedProductInfo = PRODUCTS.find(p => p.id === selectedProduct)

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {/* 顶级质感：模拟宣纸/磨砂颗粒纹理 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 柔和环境光 - 顶部暖光 */}
      <div className="fixed top-[-20%] left-[-10%] w-[120%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(255,253,250,1)_0%,rgba(240,238,233,0)_70%)] z-0 pointer-events-none opacity-60" />

      {/* 底部氛围光 */}
      <div className="fixed bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#F0ECE6] via-[#F8F6F3]/50 to-transparent z-0 pointer-events-none" />

      {/* Header (Relative to stay above background) */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pb-32 space-y-8">
        {/* Product Selector */}
        <section>
          <ProductSelector
            selectedProduct={selectedProduct}
            onSelect={setSelectedProduct}
          />
        </section>

        {/* Environment Uploader */}
        <section>
          <EnvironmentUploader
            file={envFile}
            onFileChange={setEnvFile}
          />
        </section>

        {/* Selected Product Info */}
        {selectedProductInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#4A6B50]/10"
          >
            <p className="text-xs text-[#8B7355] mb-1">已选择</p>
            <p className="text-base font-semibold text-[#4A6B50]">
              {selectedProductInfo.name} · {selectedProductInfo.sub}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedProductInfo.description}
            </p>
          </motion.div>
        )}
      </main>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#F8F6F3] via-[#F8F6F3] to-transparent pt-8">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
                        w-full h-14 rounded-full flex items-center justify-center gap-2
                        font-semibold text-base transition-all duration-300
                        ${canSubmit
              ? 'bg-gradient-to-r from-[#4A6B50] to-[#3D5A43] text-white shadow-lg shadow-[#4A6B50]/30 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
        >
          {/* Prevent Hydration Mismatch: Only render dynamic text on client */}
          {!isMounted ? (
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-gray-400" />
              <span>Loading...</span>
            </div>
          ) : isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>{progress || '处理中...'}</span>
            </>
          ) : (
            <>
              {canSubmit ? (
                <>
                  <Sparkles size={20} />
                  <span>生成合成图片</span>
                </>
              ) : (
                <span>
                  {!selectedProduct ? '请先选择产品' : !envFile ? '请上传环境图' : '准备就绪'}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Loading Overlay - 优化版 */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a1a1a] via-[#0f1510] to-[#1a1a1a] flex flex-col items-center justify-center px-8"
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-herb-gold/5"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-herb-primary/10 border-dashed"
              />
            </div>

            {/* 主要内容 */}
            <div className="relative flex flex-col items-center justify-center max-w-sm w-full">
              {/* Logo 动画 */}
              <div className="relative w-20 h-20 mb-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <Image src="/logo-new.png" alt="Loading" fill unoptimized className="object-contain" />
                </motion.div>
                {/* 发光效果 */}
                <div className="absolute inset-0 bg-herb-gold/20 blur-2xl rounded-full -z-10" />
              </div>

              {/* 标题 */}
              <h2 className="text-lg font-serif text-white/90 tracking-[0.15em] mb-2">
                正在凝练东方美学
              </h2>
              <p className="text-herb-gold/60 text-xs tracking-wider mb-6 font-light">
                {progress === '正在压缩图片...' ? '准备素材中...' :
                  progress === '正在上传至服务器...' ? '上传图片中...' :
                    progress === 'AI正在创作中...' ? 'AI 融合仙草精粹...' : 'Processing...'}
              </p>

              {/* 进度条 */}
              <div className="w-full bg-white/5 rounded-full h-1.5 mb-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-herb-gold/60 via-herb-gold to-herb-gold/60 rounded-full"
                  animate={{ width: `${realProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* 进度百分比 */}
              <div className="flex items-center justify-between text-white/40 text-[10px] tracking-wider mb-2">
                <span>{realProgress}%</span>
                <span>预计 {realProgress < 30 ? '30-40' : realProgress < 70 ? '20-30' : '10-20'} 秒</span>
              </div>

              {/* 底部提示 */}
              <div className="mt-8 flex items-center gap-3 bg-white/5 rounded-full px-5 py-2.5 border border-white/5">
                <div className="flex gap-0.5">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-herb-gold/80 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-herb-gold/60 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-herb-gold/40 rounded-full" />
                </div>
                <span className="text-[10px] text-white/50 font-light tracking-wide">
                  五大仙草 · 凝练精粹
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
