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

        // 读取品牌 LOGO 并压缩 (使用新的 logo.png)
        const logoPath = path.join(process.cwd(), 'public', 'logo.png')
        let logoBase64: string
        try {
            const logoBuffer = fs.readFileSync(logoPath)
            const compressedLogo = await sharp(logoBuffer)
                .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
                .png({ quality: 70 })
                .toBuffer()
            logoBase64 = compressedLogo.toString('base64')
            console.log('[API] Logo compressed:', (compressedLogo.length / 1024).toFixed(0), 'KB')
        } catch (e) {
            console.error('[API] Failed to load logo:', e)
            throw new Error('服务器缺少 Logo 文件')
        }

        // 读取产品图片（AI 专用参考图，与页面展示图分开）
        const productImagePath = path.join(process.cwd(), 'public', 'products-ai', `${productId}.png`)
        const productBuffer = fs.readFileSync(productImagePath)
        console.log('[API] Product AI reference image loaded:', productId)
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
        console.log('[API] Product compressed:', (processedProductBuffer.length / 1024).toFixed(0), 'KB')

        // 处理环境图 (如果存在)
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
                // fallback to raw buffer if compression fails
                envBase64 = envBuffer.toString('base64')
            }
        } else {
            console.log('[API] No environment file provided, will generate background')
        }


        console.log('[API] Images compressed, starting parallel generation...')

        // 并行生成：图片（含 LOGO） + 文案
        const [imageResult, copyResult] = await Promise.all([
            generateProductImage(logoBase64, productBase64, envBase64, product.name),
            generateUGCCopy(product.name)
        ])

        console.log('[API] Generation complete!')

        return NextResponse.json({
            success: true,
            imageData: imageResult,
            copyTexts: copyResult, // { styleA, styleB, styleC }
            productName: product.name
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "内部错误"
        console.error("[API] Generation error:", error)
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
