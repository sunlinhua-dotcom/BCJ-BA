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
        const envFile = formData.get('envFile') as File | null
        const role = (formData.get('role') as string || 'KOC') as 'BA' | 'KOC'
        const skinType = formData.get('skinType') as string | null
        const ageGroup = formData.get('ageGroup') as string | null
        const scene = formData.get('scene') as string | null

        const labels = role === 'KOC' ? {
            skinType: skinType || undefined,
            ageGroup: ageGroup || undefined,
            scene: scene || undefined,
        } : undefined

        console.log('[API] Request params:', { productId, hasEnvFile: !!envFile, role, labels })

        if (!productId) {
            return NextResponse.json({ error: "缺少产品选择" }, { status: 400 })
        }

        const product = PRODUCTS.find(p => p.id === productId)
        if (!product) {
            return NextResponse.json({ error: "无效的产品选择" }, { status: 400 })
        }

        // 准备 Logo（作为 AI 参考图）
        const logoPath = path.join(process.cwd(), 'public', 'logo.png')
        let logoBase64 = ''
        try {
            const rawLogoBuffer = fs.readFileSync(logoPath)
            const processedLogo = await sharp(rawLogoBuffer)
                .resize(512, null, { withoutEnlargement: true })
                .png({ quality: 90, compressionLevel: 9 })
                .toBuffer()
            logoBase64 = processedLogo.toString('base64')
        } catch (e) {
            console.warn('[API] Failed to load logo:', e)
        }

        // 准备产品图片
        const productImagePath = path.join(process.cwd(), 'public', 'products-ai', `${productId}.png`)
        const productBuffer = fs.readFileSync(productImagePath)
        let processedProductBuffer: Buffer
        try {
            processedProductBuffer = await sharp(productBuffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 95, mozjpeg: true })
                .toBuffer()
        } catch {
            processedProductBuffer = productBuffer
        }
        const productBase64 = processedProductBuffer.toString('base64')

        // 处理环境图（可选）
        let envBase64: string | undefined
        if (envFile) {
            const envBuffer = Buffer.from(await envFile.arrayBuffer())
            try {
                const processedEnvBuffer = await sharp(envBuffer)
                    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 75, mozjpeg: true })
                    .toBuffer()
                envBase64 = processedEnvBuffer.toString('base64')
            } catch {
                envBase64 = envBuffer.toString('base64')
            }
        }

        console.log('[API] Starting parallel generation...')

        // 并行生成：图片 + 文案（传入角色和标签）
        const [rawImageBase64, copyResult] = await Promise.all([
            generateProductImage(logoBase64, productBase64, envBase64, product.name),
            generateUGCCopy(product.name, role, labels)
        ])

        // 记录日志
        try {
            addRecord({
                timestamp: new Date().toISOString(),
                productId: product.id,
                role,
                hasEnv: !!envFile,
                imageSizeKB: Math.round(Buffer.from(rawImageBase64, 'base64').length / 1024),
                copyTexts: copyResult
            })
        } catch (e) {
            console.error('[API] Failed to log record:', e)
        }

        return NextResponse.json({
            success: true,
            imageData: rawImageBase64,
            copyTexts: copyResult,
            productName: product.name,
            role,
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "内部错误"
        console.error("[API] Generation error:", error)
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
