import fs from 'fs'
import path from 'path'

/**
 * 佰草集修源五行 - Gemini API 集成
 * 使用 APIYI 代理调用 Gemini 模型
 */

const API_KEY = process.env.GEMINI_API_KEY || 'sk-hUMNGKLJnZJERuBH9c6bBc14A4E145D993318583Db7f8fE9'
const TEXT_API_KEY = process.env.TEXT_API_KEY || 'sk-ceYYSJQE98KNX7tl4f364a604eB741B28d4bCe1396A878Fb'
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview'
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3-flash-preview'
const BASE_URL = process.env.GEMINI_BASE_URL || 'https://api.apiyi.com/v1beta'

/**
 * 生成产品合成图片
 * @param logoBase64 - 品牌 LOGO Base64
 * @param productBase64 - 产品图 Base64
 * @param envBase64 - 环境图 Base64
 * @param productName - 产品名称（霜/水/油/乳）
 * @returns Base64 图片数据
 */
export async function generateProductImage(
    logoBase64: string,
    productBase64: string,
    envBase64: string | undefined,
    productName: string
): Promise<string> {
    // 产品真实尺寸信息
    const productSizes: Record<string, string> = {
        '仙草霜': '50ml cream jar, approximately 4.5-5cm tall, wide and short shape',
        '仙草露': '120ml toner bottle, approximately 13-15cm tall, slender cylindrical shape',
        '仙草油': '30ml oil bottle, approximately 8-10cm tall, small elegant bottle',
        '仙草乳': '100ml lotion bottle, approximately 13-15cm tall, medium pump bottle'
    }

    // 产品外观材质 DNA (防止 AI 画成塑料)
    // 产品外观材质 DNA (强制还原原色)
    const productMaterials: Record<string, string> = {
        'default': `
        - **MATERIAL**: Original Bottle Material (Keep Exact Texture).
        - **COLOR**: **ORIGINAL BOTTLE COLOR** (Do not warm/cool it).
        - **FINISH**: Match the gloss/matte finish of IMAGE 1 exactly.`
    }
    const materialInfo = productMaterials['default']

    const sizeInfo = productSizes[productName] || '100ml bottle, approximately 13-15cm tall'

    // 判断是否有环境图
    const hasEnvironment = envBase64 && envBase64.length > 100

    // 根据是否有环境图选择不同的 prompt
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
- **RESTORE LOGO**: The logo on the bottle in IMAGE 1 might be low-res. Use the distinct details from **IMAGE 3** to render the branding on the bottle sharply and accurately.
- **PERSPECTIVE**: Apply the logo (from Image 3) onto the curved surface of the bottle naturally.
- **NO FLOATING TEXT**: Do not add random text, watermarks, or logos to the background or corners.

⚠️ MATERIAl & COLOR COMPLIANCE:
${materialInfo}
⚠️ MATERIAl & COLOR COMPLIANCE:
${materialInfo}
- STICTLY FORBIDDEN: Changing the bottle color.
- The bottle color must be SAMPLED directly from IMAGE 1.
- If the bottle is white, keep it WHITE (not yellow, not blue).
- If the bottle is matte, keep it MATTE.

═══════════════════════════════════════════════════
YOUR TASK: CREATE A PROFESSIONAL PRODUCT PHOTOGRAPH
═══════════════════════════════════════════════════

STEP 1: ANALYZE THE ENVIRONMENT (IMAGE 2)
- What type of scene is this? (tea house, café, natural setting, spa, etc.)
- Identify the BEST SURFACE to place the product
- Find the most visually appealing angle and composition
- Locate the LIGHT SOURCE

STEP 2: INTELLIGENT COMPOSITION
- Choose the optimal shooting position like a professional photographer
- Product placed on the best surface identified
- Background elements naturally BLURRED with depth of field

STEP 3: PRODUCT PLACEMENT
- Place the EXACT product bottle from IMAGE 1 STANDING ON the surface
- Product MUST have a contact point (not floating!)
- **SCALE**: Match real dimensions (${sizeInfo})
- Cast a NATURAL CONTACT SHADOW
- Show realistic highlights, reflections, and texture

STEP 4: FIVE SACRED HERBS
Place naturally ON THE SURFACE around the product:
- 长白山人参 (Ginseng root) - left side
- 灵芝 (Lingzhi) - right side
- 牡丹花瓣 (Peony petals) - scattered
- 紫苏叶 (Perilla leaves) - near product
- 北五味子 (Schisandra berries) - small cluster

Each element: touches surface, casts shadow, looks fresh and real.

STEP 5: LIGHTING & SHADOWS
ALL elements share the SAME light source. Shadows point SAME direction.

STEP 6: DEPTH OF FIELD
Product and herbs: SHARP. Background: naturally BLURRED (f/2.8-f/4).

STEP 7: CLEAN OUTPUT
- Ensure no *extra* text is added to the background.
- Ensure the product label text is visible and sharp.
OUTPUT: 1:1 ratio photorealistic product image.`

        : `You are a MASTER COMMERCIAL PHOTOGRAPHER creating a premium skincare product image with a DREAMY BACKGROUND.

BRAND: Premium Skincare - ${productName}
PRODUCT SIZE: ${sizeInfo}

INPUT IMAGES:
- IMAGE 1: Product bottle (${sizeInfo}) - Shape Reference
- IMAGE 2: High-Res Brand Logo (Reference for bottle details)

═══════════════════════════════════════════════════
⚠️ CRITICAL: PRODUCT ACCURACY
═══════════════════════════════════════════════════
The product bottle in IMAGE 1 MUST be reproduced with EXACT accuracy:
- Bottle shape, proportions, and silhouette must match EXACTLY
- Label design, text, and graphics must be IDENTICAL
- Color scheme must be PRECISE
- Cap/lid design must match EXACTLY
- DO NOT alter, redesign, or "improve" the product appearance
- **RESTORE LOGO**: The logo on the bottle in IMAGE 1 might be low-res. Use **IMAGE 2** (High-Res Logo) to render the branding on the bottle strictly and sharply.
- **PERSPECTIVE**: Apply the logo (from Image 2) onto the curved surface of the bottle naturally.
- **NO FLOATING TEXT**: Do not add random text, watermarks, or logos to the background or corners.

⚠️ MATERIAl & COLOR COMPLIANCE:
${materialInfo}
⚠️ MATERIAl & COLOR COMPLIANCE:
${materialInfo}
- STICTLY FORBIDDEN: Changing the bottle color.
- The bottle color must be SAMPLED directly from IMAGE 1.
- If the bottle is white, keep it WHITE (not yellow, not blue).
- If the bottle is matte, keep it MATTE.

═══════════════════════════════════════════════════
YOUR TASK: CREATE BACKGROUND + PRODUCT IMAGE
═══════════════════════════════════════════════════

STEP 1: CREATE A STUNNING INS-STYLE BACKGROUND
Since no environment photo is provided, CREATE a beautiful background:
- Style: Instagram-worthy, high-end lifestyle aesthetic
- Options (choose the most suitable):
  * Marble table with soft morning window light
  * Wooden vanity table with golden hour sunlight
  * Stone counter in a zen spa setting
  * Elegant tea table with natural elements
- Mood: Warm, inviting, luxurious, Oriental zen
- Light: Soft, diffused, warm tone (golden hour preferred)
- Include subtle environmental elements (shadows, bokeh, texture)

STEP 2: PLACE THE EXACT PRODUCT
- Place the EXACT product from IMAGE 1 on the surface
- Product MUST have contact with surface (not floating!)
- **SCALE**: Match real dimensions (${sizeInfo})
- Cast a NATURAL CONTACT SHADOW
- Show realistic highlights and reflections matching the light

STEP 3: FIVE SACRED HERBS
Arrange naturally ON THE SURFACE around the product:
- 长白山人参 (Ginseng root) - left side
- 灵芝 (Lingzhi) - right side
- 牡丹花瓣 (Peony petals) - scattered elegantly
- 紫苏叶 (Perilla leaves) - near product
- 北五味子 (Schisandra berries) - small cluster

Each element: fresh, realistic, casting natural shadows.

STEP 4: UNIFIED LIGHTING
ALL elements share ONE light source from the background you created.

STEP 5: DEPTH OF FIELD
Product and herbs: SHARP FOCUS. Background: naturally BLURRED.

STEP 6: CLEAN OUTPUT
- Ensure no *extra* text is added to the background.
- Ensure the product label text is visible and sharp.
OUTPUT: 1:1 ratio photorealistic product image with dreamy INS-style background.`

    const cleanLogoBase64 = logoBase64 ? logoBase64.replace(/^data:image\/\w+;base64,/, '') : ''
    const cleanProductBase64 = productBase64.replace(/^data:image\/\w+;base64,/, '')
    const cleanEnvBase64 = hasEnvironment ? envBase64.replace(/^data:image\/\w+;base64,/, '') : ''

    const url = `${BASE_URL}/models/${IMAGE_MODEL}:generateContent`
    const startTime = Date.now()

    // Retry logic for 503 errors
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
                        imageConfig: {
                            aspectRatio: "1:1",
                            imageSize: "1K"
                        }
                    }
                }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
            console.log(`[Gemini] Image response in ${elapsed}s, status: ${response.status}`)

            // Handle 503 with retry
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
                console.error("[Gemini] No candidates, full response:", JSON.stringify(data, null, 2))
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

            // Don't retry on non-retryable errors
            if (!lastError.message.includes('503') && attempt < maxRetries) {
                break
            }
        }
    }

    throw lastError || new Error("Failed to generate image after retries")
}

// 随机辅助函数
function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 生成UGC种草文案 - 三种风格 (千人千面版)
 */
export async function generateUGCCopy(productName: string): Promise<{
    styleA: string;
    styleB: string;
    styleC: string;
}> {
    console.log('[Gemini] Generating 3-style UGC copy for:', productName)

    // 随机因子
    const times = ['深夜加班后', '清晨醒来', '周末独处', '出差途中', '重要约会前']
    const moods = ['疲惫求安慰', '充满期待', '从容淡定', '略带焦虑', '极度自律']
    const randomContext = `场景设定：${getRandomItem(times)}，心情：${getRandomItem(moods)}。`

    // Style A: 都市大女主 / 独立女性 / 职场精英 (多种微人设)
    const styleAPersonas = [
        `你是一位35+的外企高管，见过大世面，不仅买得起大牌，更懂得"鉴赏"。你反感制造焦虑，只信奉"长期主义"和"掌控感"。`,
        `你是一位独立的知名时尚博主，不是那种随波逐流的网红，而是有思想的意见领袖。你认为护肤是"自我投资"的一部分。`,
        `你是一位创业公司女CEO，每天都在打仗。你需要的不是"安慰剂"，而是能给你"底气"的战友。`
    ]
    const promptStyleA = `${getRandomItem(styleAPersonas)}
${randomContext}
请写一段关于佰草集修源五行【${productName}】的私房话。
要求：
- **拒绝焦虑词汇**：不要用"急救"、"烂脸"这种低级词，要用"重塑秩序"、"内在支撑"、"回血"。
- **独特金句**：把护肤上升到人生哲学。例如："成年人的安全感，一半来自存款，一半来自皮肤的'稳'。"
- **克制的高级感**：像在顶级私人Club里低声告诉闺蜜，不要像大卖场叫卖。
- **280字左右**，直接输出文案。`

    // Style B: 东方美学 / 隐士 / 生活艺术家 (多种微人设)
    const styleBPersonas = [
        `你是一位隐居在现代都市的茶道师，对气味和质地极其敏感。你认为护肤是一场"五感的修行"。`,
        `你是一位古风摄影师，善于发现光影和意境之美。你眼中的护肤品，是大自然能量（草本）的具象化。`,
        `你是一位追求极简生活的作家，讨厌繁复的堆砌，只喜欢"刚刚好"的滋养。`
    ]
    const promptStyleB = `${getRandomItem(styleBPersonas)}
${randomContext}
请写一篇关于佰草集修源五行【${productName}】的生活美学随笔。
要求：
- **通感描写**：着重描写草本的香气（苦后回甘）、质地的触感（温润如玉）。
- **意境**：不要掉书袋，要写出"空灵"和"留白"。把五大仙草写成天地的馈赠。
- **情绪价值**：护肤是为了"静心"，是在浮躁世界里找回"内在的平衡"。
- **280字左右**，文字要有香气，直接输出文案。`

    // Style C: 懂成分的闺蜜 / 智慧护肤导师 (去晦涩化)
    // 痛点优化：不再是死板的研究员，而是能把复杂道理讲得简单的"聪明闺蜜"
    const styleCPersonas = [
        `你是一位拥有百万粉丝的"成分党"博主，最擅长把晦涩的论文讲成"人话"。`,
        `你是一位资深配方师，但你痛恨把护肤品说成化学实验。你喜欢打比方，让小白也能听懂。`
    ]
    const promptStyleC = `${getRandomItem(styleCPersonas)}
请写一篇关于佰草集修源五行【${productName}】的深度科普，但要**完全听得懂**。
要求：
- **讲人话**：不要堆砌"成纤维细胞"、"信号通路"这种词，除非你能立马解释。
- **善用比喻**：把"修护屏障"比作"修城墙"，把"五大仙草"比作"给细胞喂的高级补品"。
- **逻辑清晰**：先说**结果**（脸稳了、亮了），再说**原因**（因为人参给了能量，灵芝安抚了情绪）。
- **客观**：既要专业，又要像邻家大姐姐一样真诚推荐。
- **280字左右**，专业但有趣，直接输出文案。`

    // ==========================================
    // 预生成的高定文案库 (Pre-generated Copy Library)
    // ==========================================

    const copyLibraryPath = path.join(process.cwd(), 'app/data/copy_library.json')
    let copyLibrary: Record<string, Record<string, string[]>> = {}

    try {
        const jsonContent = fs.readFileSync(copyLibraryPath, 'utf-8')
        copyLibrary = JSON.parse(jsonContent)
    } catch (e) {
        console.error('[CopyLib] Failed to load library:', e)
    }

    function getPreGeneratedCopy(pName: string, style: 'styleA' | 'styleB' | 'styleC'): string {
        const cleanName = pName.trim()
        const styleTexts = copyLibrary[cleanName]?.[style] || []

        if (styleTexts.length === 0) {
            return `佰草集${cleanName}，修护时光，遇见更美的自己。`
        }
        return styleTexts[Math.floor(Math.random() * styleTexts.length)]
    }

    const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`

    const generateOne = async (prompt: string, fallback: string): Promise<string> => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${TEXT_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
                })
            })
            if (!response.ok) return fallback
            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            return text?.trim() || fallback
        } catch (e) {
            console.error('[Gemini] Copy generation error:', e)
            return fallback
        }
    }

    console.log('[Gemini] Generating 3-style AI copy...')
    const [styleA, styleB, styleC] = await Promise.all([
        generateOne(promptStyleA, getPreGeneratedCopy(productName, 'styleA')),
        generateOne(promptStyleB, getPreGeneratedCopy(productName, 'styleB')),
        generateOne(promptStyleC, getPreGeneratedCopy(productName, 'styleC'))
    ])

    return { styleA, styleB, styleC }
}
