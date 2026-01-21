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

        if (!productId || !envFile) {
            return NextResponse.json({ error: "缺少产品选择或环境图" }, { status: 400 })
        }

        // 获取产品信息
        const product = PRODUCTS.find(p => p.id === productId)
        if (!product) {
            return NextResponse.json({ error: "无效的产品选择" }, { status: 400 })
        }

        // 读取品牌 LOGO
        const logoPath = path.join(process.cwd(), 'public', 'herborist-logo.png')
        const logoBuffer = fs.readFileSync(logoPath)
        const logoBase64 = logoBuffer.toString('base64')
        console.log('[API] Logo loaded, size:', logoBuffer.length)

        // 读取产品图片并转为 Base64
        const productImagePath = path.join(process.cwd(), 'public', 'products', `${productId}.webp`)
        const productBuffer = fs.readFileSync(productImagePath)

        // 使用 sharp 压缩产品图
        let processedProductBuffer: Buffer
        try {
            processedProductBuffer = await sharp(productBuffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer()
        } catch (e) {
            console.warn('[API] Product image compression failed, using original:', e)
            processedProductBuffer = productBuffer
        }
        const productBase64 = processedProductBuffer.toString('base64')

        // 处理环境图
        const envBuffer = Buffer.from(await envFile.arrayBuffer())
        let processedEnvBuffer: Buffer
        try {
            processedEnvBuffer = await sharp(envBuffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer()
        } catch (e) {
            console.warn('[API] Environment image compression failed, using original:', e)
            processedEnvBuffer = envBuffer
        }
        const envBase64 = processedEnvBuffer.toString('base64')

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
