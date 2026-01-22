import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { generateProductImage, generateUGCCopy } from '@/lib/gemini'
import { PRODUCTS } from '@/lib/constants'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
    console.log('[API] Generate request received')

    try {
        const formData = await req.formData()
        const productId = formData.get('productId') as string
        const envFile = formData.get('envFile') as File

        console.log('[API] Request params:', { productId, hasEnvFile: !!envFile })

        if (!productId) {
            return NextResponse.json({ error: "缺少产品选择" }, { status: 400 })
        }

        // 获取产品信息
        const product = PRODUCTS.find(p => p.id === productId)
        if (!product) {
            return NextResponse.json({ error: "无效的产品选择" }, { status: 400 })
        }

        // 1. 准备 Logo Buffer (用于后续合成)
        const logoPath = path.join(process.cwd(), 'public', 'logo.png')
        let compositionLogoBuffer: Buffer
        try {
            const rawLogoBuffer = fs.readFileSync(logoPath)
            // 调整 Logo 大小供合成使用 (宽 180px，适合 1024x1024 图片)
            compositionLogoBuffer = await sharp(rawLogoBuffer)
                .resize(180, null) // 自适应高度
                .toBuffer()
            console.log('[API] Logo prepared for composition')
        } catch (e) {
            console.error('[API] Failed to load logo:', e)
            throw new Error('服务器缺少 Logo 文件')
        }

        // 2. 准备产品图片 (AI 参考图)
        const productImagePath = path.join(process.cwd(), 'public', 'products-ai', `${productId}.png`)
        const productBuffer = fs.readFileSync(productImagePath)
        let processedProductBuffer: Buffer
        try {
            processedProductBuffer = await sharp(productBuffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 75 })
                .toBuffer()
        } catch (e) {
            console.warn('[API] Product compression failed:', e)
            processedProductBuffer = productBuffer
        }
        const productBase64 = processedProductBuffer.toString('base64')

        // 3. 处理环境图 (如果存在)
        let envBase64: string | undefined
        if (envFile) {
            const envBuffer = Buffer.from(await envFile.arrayBuffer())
            let processedEnvBuffer: Buffer
            try {
                processedEnvBuffer = await sharp(envBuffer)
                    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 75 })
                    .toBuffer()
                envBase64 = processedEnvBuffer.toString('base64')
                console.log('[API] Env compressed:', (processedEnvBuffer.length / 1024).toFixed(0), 'KB')
            } catch (e) {
                console.warn('[API] Env compression failed:', e)
                envBase64 = envBuffer.toString('base64')
            }
        } else {
            console.log('[API] No environment file provided, will generate background')
        }

        console.log('[API] Starting parallel generation...')

        // 4. 并行生成：图片（含 LOGO） + 文案
        // 注意：generateProductImage 不再负责生成 Logo，传入空字符串也没关系，但为了类型匹配传入 compositionLogoBuffer 的 base64
        const [rawImageBase64, copyResult] = await Promise.all([
            generateProductImage(compositionLogoBuffer.toString('base64'), productBase64, envBase64, product.name),
            generateUGCCopy(product.name)
        ])

        // 5. 后处理：合成 Logo (Server-side Composition)
        console.log('[API] Compositing Logo onto AI image...')
        const rawImageBuffer = Buffer.from(rawImageBase64, 'base64')
        const finalImageBuffer = await sharp(rawImageBuffer)
            .composite([{
                input: compositionLogoBuffer,
                top: 40,  // 距离顶部像素
                left: 40, // 距离左侧像素
                // blend: 'over' // 默认覆盖
            }])
            .jpeg({ quality: 90 }) // 输出高质量 JPEG
            .toBuffer()

        const finalImageBase64 = finalImageBuffer.toString('base64')
        console.log('[API] Generation & Composition complete!')

        return NextResponse.json({
            success: true,
            imageData: finalImageBase64,
            copyTexts: copyResult,
            productName: product.name
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "内部错误"
        console.error("[API] Generation error:", error)
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
