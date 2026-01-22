import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { generateProductImage, generateUGCCopy } from '@/lib/gemini'
import { PRODUCTS } from '@/lib/constants'
import fs from 'fs'
import path from 'path'
import { addRecord } from '@/lib/records'


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

        // 4. 并行生成：图片（纯净无Logo） + 文案
        // generateProductImage 第一个参数现在传空字符串，因为不再需要 Logo
        const [rawImageBase64, copyResult] = await Promise.all([
            generateProductImage('', productBase64, envBase64, product.name),
            generateUGCCopy(product.name)
        ])

        // 5. 不再合成 Logo，直接使用 AI 生成的纯净图
        console.log('[API] Using clean AI image (No Logo)...')
        const finalImageBase64 = rawImageBase64
        // 6. 记录生成日志
        try {
            const record = {
                timestamp: new Date().toISOString(),
                productId: product.id,
                hasEnv: !!envFile,
                imageSizeKB: Math.round(Buffer.from(finalImageBase64, 'base64').length / 1024),
                copyTexts: copyResult
            }
            addRecord(record)
        } catch (e) {
            console.error('[API] Failed to log record:', e)
        }

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
