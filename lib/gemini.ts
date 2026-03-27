import fs from 'fs'
import path from 'path'

/**
 * 佰草集修源五行 - Gemini API 集成（v2.0）
 * 支持 BA / KOC 双角色文案生成
 */

const API_KEY = process.env.GEMINI_API_KEY || 'sk-hUMNGKLJnZJERuBH9c6bBc14A4E145D993318583Db7f8fE9'
const TEXT_API_KEY = process.env.TEXT_API_KEY || 'sk-ceYYSJQE98KNX7tl4f364a604eB741B28d4bCe1396A878Fb'
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview'
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.1-pro-preview'
const BASE_URL = process.env.GEMINI_BASE_URL || 'https://api.apiyi.com/v1beta'

// ─── 随机辅助 ────────────────────────────────────────────────────────────────
function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

// ─── 本地兜底文案库 ───────────────────────────────────────────────────────────
function loadCopyLibrary(): Record<string, Record<string, string[]>> {
    try {
        const p = path.join(process.cwd(), 'app/data/copy_library.json')
        return JSON.parse(fs.readFileSync(p, 'utf-8'))
    } catch {
        return {}
    }
}

function getPreGeneratedCopy(
    library: Record<string, Record<string, string[]>>,
    productName: string,
    style: 'styleA' | 'styleB' | 'styleC'
): string {
    const texts = library[productName.trim()]?.[style] || []
    if (texts.length === 0) return `佰草集${productName}，修护时光，遇见更美的自己。`
    return texts[Math.floor(Math.random() * texts.length)]
}

// ─── 图像生成 ─────────────────────────────────────────────────────────────────
/**
 * 生成产品合成图片
 */
export async function generateProductImage(
    logoBase64: string,
    productBase64: string,
    envBase64: string | undefined,
    productName: string
): Promise<string> {
    const productSizes: Record<string, string> = {
        '仙草霜': '50ml cream jar, approximately 4.5-5cm tall, wide and short shape',
        '仙草露': '120ml toner bottle, approximately 13-15cm tall, slender cylindrical shape',
        '仙草油': '30ml oil bottle, approximately 8-10cm tall, small elegant bottle',
        '仙草乳': '100ml lotion bottle, approximately 13-15cm tall, medium pump bottle'
    }
    const materialInfo = `
        - **MATERIAL**: Original Bottle Material (Keep Exact Texture).
        - **COLOR**: **ORIGINAL BOTTLE COLOR** (Do not warm/cool it).
        - **FINISH**: Match the gloss/matte finish of IMAGE 1 exactly.`

    const sizeInfo = productSizes[productName] || '100ml bottle, approximately 13-15cm tall'
    const hasEnvironment = envBase64 && envBase64.length > 100

    const prompt = hasEnvironment
        ? `You are a MASTER COMMERCIAL PHOTOGRAPHER creating a premium skincare product image.

BRAND: Premium Skincare (Product: ${productName})
PRODUCT SIZE: ${sizeInfo}

INPUT IMAGES:
- IMAGE 1: Product bottle (${sizeInfo}) - Shape Reference
- IMAGE 2: Environment scene (your shooting location)
- IMAGE 3: High-Res Brand Logo (Reference for bottle details)

═══════════════════════════════════════════════════
⚠️ CRITICAL: PRODUCT ACCURACY
═══════════════════════════════════════════════════
The product bottle in IMAGE 2 MUST be reproduced with EXACT accuracy:
- Bottle shape, proportions, and silhouette must match EXACTLY
- Label design, text, and graphics must be IDENTICAL
- Color scheme must be PRECISE
- Cap/lid design must match EXACTLY
- DO NOT alter, redesign, or "improve" the product appearance
- Treat IMAGE 1 as a sacred reference for SHAPE and FORM.
- **RESTORE LOGO**: Use the distinct details from **IMAGE 3** to render the branding sharply.
- **PERSPECTIVE**: Apply the logo (from Image 3) onto the curved surface naturally.
- **NO FLOATING TEXT**: Do not add random text, watermarks, or logos to the background.

⚠️ MATERIAL & COLOR COMPLIANCE:
${materialInfo}
- STRICTLY FORBIDDEN: Changing the bottle color.
- The bottle color must be SAMPLED directly from IMAGE 1.

═══════════════════════════════════════════════════
YOUR TASK: CREATE A PROFESSIONAL PRODUCT PHOTOGRAPH
═══════════════════════════════════════════════════

STEP 1: ANALYZE THE ENVIRONMENT (IMAGE 2)
- Identify the BEST SURFACE to place the product
- Find the most visually appealing angle and composition

STEP 2: INTELLIGENT COMPOSITION
- Product placed on the best surface identified
- Background elements naturally BLURRED with depth of field

STEP 3: PRODUCT PLACEMENT
- Place the EXACT product bottle from IMAGE 1 STANDING ON the surface
- Product MUST have a contact point (not floating!)
- **SCALE**: Match real dimensions (${sizeInfo})
- Cast a NATURAL CONTACT SHADOW

STEP 4: FIVE SACRED HERBS
Place naturally ON THE SURFACE around the product:
- 长白山人参 (Ginseng root) - left side
- 灵芝 (Lingzhi) - right side
- 牡丹花瓣 (Peony petals) - scattered
- 紫苏叶 (Perilla leaves) - near product
- 北五味子 (Schisandra berries) - small cluster

STEP 5: LIGHTING & DEPTH
ALL elements share the SAME light source. Shadows point SAME direction.
Product and herbs: SHARP. Background: naturally BLURRED (f/2.8-f/4).

STEP 6: CLEAN OUTPUT
- Ensure no extra text is added to background.
- Ensure the product label text is visible and sharp.
OUTPUT: 1:1 ratio photorealistic product image.`

        : `You are a MASTER COMMERCIAL PHOTOGRAPHER creating a premium skincare product image with a DREAMY BACKGROUND.

BRAND: Premium Skincare - ${productName}
PRODUCT SIZE: ${sizeInfo}

INPUT IMAGES:
- IMAGE 1: Product bottle (${sizeInfo}) - Shape Reference
- IMAGE 2: High-Res Brand Logo (Reference for bottle details)

⚠️ CRITICAL: PRODUCT ACCURACY
The product bottle in IMAGE 1 MUST be reproduced with EXACT accuracy.
- **RESTORE LOGO**: Use **IMAGE 2** to render branding sharply.
- **NO FLOATING TEXT**: No random text in background.

⚠️ MATERIAL & COLOR COMPLIANCE:
${materialInfo}
- STRICTLY FORBIDDEN: Changing the bottle color.

YOUR TASK: CREATE BACKGROUND + PRODUCT IMAGE

STEP 1: CREATE A STUNNING INS-STYLE BACKGROUND
- Style: Instagram-worthy, high-end lifestyle aesthetic
- Mood: Warm, inviting, luxurious, Oriental zen
- Light: Soft, diffused, warm tone (golden hour preferred)

STEP 2: PLACE THE EXACT PRODUCT
- Place EXACT product from IMAGE 1 on the surface
- Product MUST have contact with surface (not floating!)
- **SCALE**: Match real dimensions (${sizeInfo})
- Cast a NATURAL CONTACT SHADOW

STEP 3: FIVE SACRED HERBS
- 长白山人参 / 灵芝 / 牡丹花瓣 / 紫苏叶 / 北五味子
Each: fresh, realistic, casting natural shadows.

STEP 4: DEPTH OF FIELD
Product and herbs: SHARP FOCUS. Background: naturally BLURRED.

OUTPUT: 1:1 ratio photorealistic product image with dreamy INS-style background.`

    const cleanLogoBase64 = logoBase64 ? logoBase64.replace(/^data:image\/\w+;base64,/, '') : ''
    const cleanProductBase64 = productBase64.replace(/^data:image\/\w+;base64,/, '')
    const cleanEnvBase64 = hasEnvironment ? envBase64.replace(/^data:image\/\w+;base64,/, '') : ''

    const url = `${BASE_URL}/models/${IMAGE_MODEL}:generateContent`
    const startTime = Date.now()
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 120000)
            console.log(`[Gemini] Image generation attempt ${attempt}/${maxRetries}...`)

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: "image/jpeg", data: cleanProductBase64 } },
                            ...(hasEnvironment ? [{ inline_data: { mime_type: "image/jpeg", data: cleanEnvBase64 } }] : []),
                            ...(cleanLogoBase64 ? [{ inline_data: { mime_type: "image/png", data: cleanLogoBase64 } }] : [])
                        ]
                    }],
                    generationConfig: {
                        responseModalities: ["IMAGE"],
                        imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
                    }
                }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
            console.log(`[Gemini] Image response in ${elapsed}s, status: ${response.status}`)

            if (response.status === 503 && attempt < maxRetries) {
                console.warn(`[Gemini] Service unavailable (503), retrying in 2s...`)
                await new Promise(resolve => setTimeout(resolve, 2000))
                continue
            }

            if (!response.ok) {
                const errorText = await response.text()
                console.error("[Gemini] Error Response:", errorText)
                throw new Error(`API Error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const candidates = data.candidates

            if (!candidates || candidates.length === 0) {
                throw new Error("No candidates returned from Gemini")
            }

            const responseParts = candidates[0].content.parts
            const imagePart = responseParts.find((p: { inlineData?: { data: string }, inline_data?: { data: string } }) => p.inlineData || p.inline_data)

            if (imagePart) {
                console.log('[Gemini] Success! Image generated.')
                return (imagePart.inlineData?.data || imagePart.inline_data?.data) as string
            }

            throw new Error("No image data in response")

        } catch (error: unknown) {
            lastError = error instanceof Error ? error : new Error(String(error))
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
            console.error(`[Gemini] Attempt ${attempt} failed after ${elapsed}s:`, lastError.message)
            if (!lastError.message.includes('503') && attempt < maxRetries) break
        }
    }

    throw lastError || new Error("Failed to generate image after retries")
}

// ─── 文案生成 ─────────────────────────────────────────────────────────────────
/**
 * 生成 UGC 文案 - 支持 BA / KOC 双角色，各三种风格
 */
export async function generateUGCCopy(
    productName: string,
    role: 'BA' | 'KOC' = 'KOC',
    labels?: { skinType?: string; ageGroup?: string; scene?: string }
): Promise<{ styleA: string; styleB: string; styleC: string }> {
    console.log('[Gemini] Generating copy | role:', role, '| product:', productName, '| labels:', labels)

    const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`

    const generateOne = async (prompt: string, fallback: string): Promise<string> => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${TEXT_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.9, maxOutputTokens: 2048 }
                })
            })
            if (!response.ok) return fallback
            const data = await response.json()
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            // 过滤 APIYI 注入的水印字符，格式如 (82)(83) 等括号数字
            const clean = raw.replace(/\(\d+\)/g, '').trim()
            return clean || fallback
        } catch (e) {
            console.error('[Gemini] Copy generation error:', e)
            return fallback
        }
    }

    // ── BA 角色 ──────────────────────────────────────────────────────────────
    if (role === 'BA') {
        const randomTime = getRandomItem(['深夜护肤后', '早上客人到店前', '周末空档', '送走最后一位客人'])

        const promptA = `你是一位佰草集专柜高级美容顾问，${randomTime}，在朋友圈分享你对【${productName}】的真实使用心得。

要求：
- **语气**：专业但有温度，像朋友圈说心里话，不是广告
- **结构**：开头有钩子（疑问句/数字/反差）→ 具体使用感受和皮肤变化细节 → 结尾留出互动空间
- **细节**：要有具体的使用细节（比如质地、气味、用完的感受），不要泛泛而谈
- **禁止**：不要用"限时特惠""立即购买"等广告词；禁止@符号
- **字数**：150-200字，内容丰富，有料有温度
- 直接输出文案正文，不要任何前缀和标题`

        const promptB = `你是佰草集专柜的美容顾问，正在给一位2-3个月没来的老客户发微信私信，真诚询问近况并推荐【${productName}】。

要求：
- **语气**：像真实朋友发微信，热情亲切有温度，有称谓感（姐/妹），绝对不像群发短信
- **内容**：先关心别来经历 → 分享自己最近发现产品有什么特别 → 자然引到这款产品的亮点 → 发出邀约（周末/下次来店）
- **真实感**：要像真人在打字，可以有语气词，加一点生活感的细节
- **字数**：100-130字，刚好是一条有温度的私信
- 直接输出正文，不要任何前缀`

        const promptC = `你是有多年经验的佰草集美容顾问，在朋友圈发关于【${productName}】的深度专业测评。

要求：
- **语气**：专业权威，但用大众听得懂的方式讲成分和功效，不堆砌晦涩术语
- **结构**：产品定位和特点 → 核心成分+功效（用比喻让人听懂）→ 亲测明显改善的方面 → 适合人群 → 真诚推荐语
- **亮点**：体现多年专业知识，让粉丝觉得找到了专属护肤顾问
- **字数**：180-220字，有深度有干货
- 直接输出文案正文，不要任何前缀`

        console.log('[Gemini] Generating 3 BA-role copy styles in parallel...')
        const [styleA, styleB, styleC] = await Promise.all([
            generateOne(promptA, `作为佰草集美容顾问，我每天都在用${productName}，真的变化很大，有姐妹想了解的欢迎来找我～`),
            generateOne(promptB, `姐，最近${productName}用得咋样？如果有任何问题都可以来店里找我哦～`),
            generateOne(promptC, `今天来聊聊${productName}，核心成分是五大仙草精粹，特别适合想改善肤质的姐妹们。`),
        ])
        return { styleA, styleB, styleC }
    }

    // ── KOC 角色 ─────────────────────────────────────────────────────────────
    const skin = labels?.skinType || '混合皮'
    const age = labels?.ageGroup || '26-30岁'
    const scene = labels?.scene || '日常护肤'

    const xhsPersona = getRandomItem([
        '你是拥有50万粉丝的小红书护肤博主，内容以真实测评著称，不接假广告',
        '你是小红书头部KOC，擅长写出让人马上去买单的种草笔记',
        '你是小红书护肤达人，用过上百款产品，分享风格犀利接地气',
    ])
    const friendPersona = getRandomItem([
        '你是一个真实的护肤爱好者，不是博主，只是在和闺蜜分享自己发现的好东西',
        '你是朋友圈里大家都信任的护肤达人，说话真实不夸张',
    ])

    const promptA = `${xhsPersona}。

请为佰草集【${productName}】写一篇小红书爆款笔记，目标读者是${skin}的${age}女生，使用场景：${scene}。

要求：
- **标题**（第一行）：爆款格式，如"干皮救星！/用了3个月告诉你/不踩雷！"
- **正文**：痛点开场 → 产品初印象 → 使用体验（有细节、有感受）→ 效果对比 → 种草总结
- **关键词**：自然植入（仙草/五行/修护/紧致等）
- **结尾**：引导评论互动
- **字数**：200-250字
- 直接输出笔记正文（含标题），不要前缀`

    const promptB = `${friendPersona}。

请以闺蜜聊天的方式，写一段关于佰草集【${productName}】的真实分享，给${skin}的${age}闺蜜看的。

要求：
- **语气**：完全口语化，像微信语音转文字，有语气词（哦/啊/吧/真的/绝了）
- **内容**：为什么开始用 → 第一次用的感受 → 坚持使用后的变化 → 推荐理由
- **真实感**：可以有小缺点，反而更可信
- **字数**：150-200字
- 直接输出正文，不要前缀`

    const promptC = `你是专业护肤内容创作者，擅长根据用户画像定制种草内容。

请为佰草集【${productName}】创作精准种草文案：
- 目标用户：${skin}、${age}、使用场景是${scene}
- 内容要紧扣这个人群的皮肤痛点和生活场景，不要写通稿
- **结构**：精准痛点（让目标用户觉得"说的就是我"）→ 产品如何针对性解决 → 具体使用方法/时机 → 效果承诺
- **语气**：专业且亲切，介于测评博主和闺蜜之间
- **字数**：200-250字
- 直接输出正文，不要前缀`

    const lib = loadCopyLibrary()
    console.log('[Gemini] Generating 3 KOC-role copy styles in parallel...')
    const [styleA, styleB, styleC] = await Promise.all([
        generateOne(promptA, getPreGeneratedCopy(lib, productName, 'styleA')),
        generateOne(promptB, getPreGeneratedCopy(lib, productName, 'styleB')),
        generateOne(promptC, getPreGeneratedCopy(lib, productName, 'styleC')),
    ])
    return { styleA, styleB, styleC }
}
