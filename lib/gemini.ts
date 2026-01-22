/**
 * 佰草集修源五行 - Gemini API 集成
 * 使用 APIYI 代理调用 Gemini 模型
 */

const API_KEY = process.env.GEMINI_API_KEY || 'sk-g8JehwXjfoWKeHxvDdAe2277FeA24c0094B7E6Fe5566346b'
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview'
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3-pro-image-preview'
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

    const sizeInfo = productSizes[productName] || '100ml bottle, approximately 13-15cm tall'

    // 判断是否有环境图
    const hasEnvironment = envBase64 && envBase64.length > 100

    // 根据是否有环境图选择不同的 prompt
    const prompt = hasEnvironment
        ? `You are a MASTER COMMERCIAL PHOTOGRAPHER creating a premium skincare product image.

BRAND: Premium Skincare (Product: ${productName})
PRODUCT SIZE: ${sizeInfo}

INPUT IMAGES:
- IMAGE 1: Product bottle (${sizeInfo}) - MUST BE REPRODUCED EXACTLY
- IMAGE 2: Environment scene (your shooting location)

═══════════════════════════════════════════════════
⚠️ CRITICAL: PRODUCT ACCURACY
═══════════════════════════════════════════════════
The product bottle in IMAGE 2 MUST be reproduced with EXACT accuracy:
- Bottle shape, proportions, and silhouette must match EXACTLY
- Label design, text, and graphics must be IDENTICAL
- Color scheme must be PRECISE
- Cap/lid design must match EXACTLY
- DO NOT alter, redesign, or "improve" the product appearance
- Treat IMAGE 1 as a sacred reference - copy the bottle faithfully
- **ABSOLUTELY NO TEXT OR LOGOS**: The entire image (background, surface, overlay) must be 100% free of text, letters, characters, logos, or watermarks.
- **CLEAN BACKGROUND**: Do not add any "Herborist" text or Chinese characters to the background.

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
- FINAL CHECK: Ensure there is ZERO text, NO logos, and NO watermarks in the final image. We will add the logo programmatically.

OUTPUT: 1:1 ratio photorealistic product image.`

        : `You are a MASTER COMMERCIAL PHOTOGRAPHER creating a premium skincare product image with a DREAMY BACKGROUND.

BRAND: Premium Skincare - ${productName}
PRODUCT SIZE: ${sizeInfo}

INPUT IMAGES:
- IMAGE 1: Product bottle (${sizeInfo}) - MUST BE REPRODUCED EXACTLY

═══════════════════════════════════════════════════
⚠️ CRITICAL: PRODUCT ACCURACY
═══════════════════════════════════════════════════
The product bottle in IMAGE 1 MUST be reproduced with EXACT accuracy:
- Bottle shape, proportions, and silhouette must match EXACTLY
- Label design, text, and graphics must be IDENTICAL
- Color scheme must be PRECISE
- Cap/lid design must match EXACTLY
- DO NOT alter, redesign, or "improve" the product appearance
- **ABSOLUTELY NO TEXT OR LOGOS**: The entire image must be 100% free of text, letters, characters, logos, or watermarks.
- **CLEAN BACKGROUND**: Do not add any "Herborist" text or Chinese characters.

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
- FINAL CHECK: Ensure there is ZERO text, NO logos, and NO watermarks.

OUTPUT: 1:1 ratio photorealistic product image with dreamy INS-style background.`

    // const cleanLogoBase64 = logoBase64.replace(/^data:image\/\w+;base64,/, '') (Unused)
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
                            ...(hasEnvironment ? [{ inline_data: { mime_type: "image/jpeg", data: cleanEnvBase64 } }] : [])
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

/**
 * 生成UGC种草文案 - 三种风格
 */
export async function generateUGCCopy(productName: string): Promise<{
    styleA: string;
    styleB: string;
    styleC: string;
}> {
    console.log('[Gemini] Generating 3-style UGC copy for:', productName)

    const prompts = {
        styleA: `你是一位30+的都市大女主，某领域的高管或独立创作者。你清醒、理智、挑剔，从不跟风，只选真正有"秩序感"的好东西。请写一段关于佰草集修源五行【${productName}】的私房话。

要求：
- **拒绝焦虑**：不要写"熬夜脸"、"急救"，要写"重建秩序"、"掌控感"、"长期主义"。
- **独特视角**：把护肤上升到"自我对话"的高度。例如："到了这个年纪，护肤不是为了迎合审美，而是为了确认自我。"
- **犀利点评**：不用堆砌成分，而是讲"支撑力"、"底气"。提到五大仙草（人参、灵芝等）时，要说它们带来了"稳"。
- **顶级种草**：语气克制但笃定，像在私人Club里低声告诉最好的朋友："试过无数大牌，最后留住我的是它。"
- **金句频出**：每三句要有一个让人想截图的金句。保留"内养生机""年轻嘭弹"但要融化在观点里。
- 280-320字，直接输出文案。`,

        styleB: `你是一位隐居在现代都市的生活艺术家，追求极致的感官体验和东方雅趣。请为佰草集修源五行【${productName}】写一篇关于"呼吸"与"静"的生活美学随笔。

要求：
- **五感沉浸**：极致描写气味（草本的苦与甘）、质地（如玉、如云）、触感（温润）。
- **仪式感**：描述涂抹的过程像通过一场茶道或冥想，强调慢下来的奢侈。
- **意境营造**：不要掉书袋引古文，要写出"空灵感"和"留白"。例如："在万物速朽的时代，寻找一种恒常。"
- **东方奢华**：把五大仙草写成大自然的馈赠，是天地能量的各种形态（人参的力、牡丹的媚、紫苏的洁）。
- **精神共鸣**：将"内养生机"升华为内心的充盈和宁静。
- 280-320字，文字要有香气，直接输出文案。`,

        styleC: `你是皮肤科学研究者，对传统中医与现代科学结合有深入研究。为佰草集修源五行【${productName}】写一篇专业但易懂的科普分析。

要求：
- 从现代皮肤科学角度解读中草药成分（引用学术研究）
- 阐述五大仙草的分子机制（如：人参皂苷Rb1促进成纤维细胞增殖）
- 分析"内养生机"的科学原理（肌底代谢、细胞更新周期）
- 用专业术语但解释清楚，展现深厚知识功底
- 批判性思考，既肯定价值也指出局限
- 从循证医学角度给出客观评价
- 280-320字，专业严谨但不枯燥，直接输出文案`
    }

    const fallbacks = {
        styleA: `到了这个年纪，早已过了被营销概念洗脑的阶段。护肤之于我，不再是迎合审美的手段，而是重建生活秩序的仪式。试过无数大牌，最终让我心安的竟是这瓶佰草集修源五行${productName}。它给我的不是瞬时的刺激，而是一种温润厚重的"支撑力"。人参固本、灵芝安神，这些老祖宗留下的智慧，在这个充满不确定的世界里，给了我最大的确定性。坚持用了三周，那种"内养生机"带来的年轻嘭弹，不是皮相的紧绷，而是骨子里的从容。在这浮躁的都市里，稳得住，才是最高级的保养。`,

        styleB: `在欲望横流的都市，试图寻找一处精神的留白。黄昏时分，燃一线香，取这瓶佰草集修源五行${productName}。开盖瞬间，草本的香气若有似无，先苦后甘，像极了生活的隐喻。指尖触碰的瞬间，质地温润如玉，早已超越了护肤品的范畴。人参的力、牡丹的媚、紫苏的洁，化作天地能量沁入肌理。这不仅是涂抹，更是人与自然的私密对话。真正的"内养生机"，是静气，是滋养，是万物速朽中那份难得的恒常。`,

        styleC: `作为长期关注皮肤科学文献的研究者，对佰草集修源五行${productName}做了成分解析。人参皂苷Rb1、Rg1被《Journal of Ginseng Research》证实可促进I型胶原合成；灵芝多糖β-葡聚糖强化角质层屏障功能；五味子木脂素具SOD活性；牡丹酚抑制酪氨酸酶；紫苏醛调控NF-κB通路抗炎。这种将传统方剂与现代提取技术结合的思路，体现了"内养生机"的循证逻辑——非速效表面修饰，而是调控细胞信号通路。28天观察周期，TEWL值下降，肤质改善明显。客观评价：值得尝试。`
    }

    const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`

    const generateOne = async (prompt: string, fallback: string): Promise<string> => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
                })
            })
            if (!response.ok) return fallback
            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            return text?.trim() || fallback
        } catch { return fallback }
    }

    const [styleA, styleB, styleC] = await Promise.all([
        generateOne(prompts.styleA, fallbacks.styleA),
        generateOne(prompts.styleB, fallbacks.styleB),
        generateOne(prompts.styleC, fallbacks.styleC)
    ])

    console.log('[Gemini] 3-style copy generation complete')
    return { styleA, styleB, styleC }
}

