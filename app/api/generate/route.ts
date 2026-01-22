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


        // 2. 准备 Logo (作为 AI 参考图，非合成)
        const logoPath = path.join(process.cwd(), 'public', 'logo.png')
        let logoBase64 = ''
        try {
            const rawLogoBuffer = fs.readFileSync(logoPath)
            // 优化 1：输入端极速压缩 (Strategy 1)
            // Logo 只需要参考轮廓和文字，512px 足够清晰
            const processedLogo = await sharp(rawLogoBuffer)
                .resize(512, null, { withoutEnlargement: true })
                .png({ quality: 60, compressionLevel: 9 }) // 强力压缩
                .toBuffer()
            logoBase64 = processedLogo.toString('base64')
            console.log('[API] Logo prepared as reference')
        } catch (e) {
            console.warn('[API] Failed to load logo:', e)
        }

        // 3. 准备产品图片 (AI 参考图)
        const productImagePath = path.join(process.cwd(), 'public', 'products-ai', `${productId}.png`)
        const productBuffer = fs.readFileSync(productImagePath)
        let processedProductBuffer: Buffer
        try {
            // 优化 1：产品图缩小至 512px，质量 60
            processedProductBuffer = await sharp(productBuffer)
                .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 60, mozjpeg: true }) // 使用 mozjpeg 算法获得更小体积
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
                // 优化 1：环境图同样缩小至 512px
                processedEnvBuffer = await sharp(envBuffer)
                    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 60, mozjpeg: true })
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

        // 4. 并行生成：图片（含 Logo 修复指令） + 文案
        const [rawImageBase64, copyResult] = await Promise.all([
            generateProductImage(logoBase64, productBase64, envBase64, product.name),
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
