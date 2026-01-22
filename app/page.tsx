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
import FortuneLoading from '@/components/FortuneLoading'

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

  const canSubmit = selectedProduct && !isSubmitting // envFile is now optional

  const [realProgress, setRealProgress] = useState(0) // 真实进度百分比

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setProgress('正在压缩图片...')
    setRealProgress(0)

    // 模拟平滑进度增长
    let progressInterval: NodeJS.Timeout | null = null
    const smoothProgress = (start: number, end: number, duration: number) => {
      if (progressInterval) clearInterval(progressInterval)
      const startTime = Date.now()
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const percent = Math.min(elapsed / duration, 1)

        const current = start + (end - start) * percent
        setRealProgress(Math.floor(current))
        if (percent >= 1 && progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
        }
      }, 100)
    }

    try {
      // 阶段1: 客户端压缩 (0% -> 10%, 约2秒)
      smoothProgress(0, 10, 2000)

      let compressedEnv: File | null = null
      if (envFile) {
        compressedEnv = await compressImage(envFile, 1200, 0.8)
      }

      if (progressInterval) clearInterval(progressInterval)

      // 阶段2: 上传 (10% -> 30%, 约3-5秒)
      setProgress('正在上传至服务器...')
      smoothProgress(10, 30, 4000)

      const formData = new FormData()
      formData.append('productId', selectedProduct!)
      if (compressedEnv) {
        formData.append('envFile', compressedEnv)
      }

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

      {/* Loading Overlay - 本草灵签版 */}
      <AnimatePresence>
        {isSubmitting && <FortuneLoading />}
      </AnimatePresence>
    </div>
  )
}
