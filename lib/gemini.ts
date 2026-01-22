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
    envBase64: string,
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

    // 专业摄影师级别的提示词
    const prompt = `You are a MASTER COMMERCIAL PHOTOGRAPHER creating a premium skincare product image.

BRAND: 佰草集 HERBORIST - ${productName}
PRODUCT SIZE: ${sizeInfo}

INPUT IMAGES:
- IMAGE 1: Brand LOGO
- IMAGE 2: Product bottle (${sizeInfo})
- IMAGE 3: Environment scene (your shooting location)

═══════════════════════════════════════════════════
YOUR TASK: CREATE A PROFESSIONAL PRODUCT PHOTOGRAPH
═══════════════════════════════════════════════════

STEP 1: ANALYZE THE ENVIRONMENT (IMAGE 3)
- What type of scene is this? (tea house, café, natural setting, spa, etc.)
- Identify the BEST SURFACE to place the product (wooden table, stone counter, window sill, etc.)
- Find the most visually appealing angle and composition
- Locate the LIGHT SOURCE (window, lamp, natural light direction)

STEP 2: INTELLIGENT COMPOSITION
- Choose the optimal shooting position like a professional photographer would
- Product should be placed on the best surface you identified
- Background elements (people, furniture, decor) should be naturally BLURRED with depth of field
- Create a focal point on the product while maintaining environmental atmosphere

STEP 3: PRODUCT PLACEMENT (CRITICAL - MUST BE REALISTIC)
- Place product bottle from IMAGE 2 STANDING ON the chosen surface
- Product MUST have a contact point with the surface (not floating!)
- **SCALE ACCURACY**: Product size must match its real dimensions (${sizeInfo})
  * If it's a 5cm tall jar, it should look small and compact
  * If it's a 15cm tall bottle, it should appear taller and more slender
  * Compare to typical objects: a 5cm jar is about the size of a golf ball in height
  * A 15cm bottle is roughly the length of a smartphone
- Cast a NATURAL CONTACT SHADOW beneath the product
- Product material (ceramic/glass bottle) must show:
  * Realistic highlights from the light source
  * Subtle reflections of environment colors
  * Proper texture and gloss
  * Bottle should look SOLID and three-dimensional, not flat

STEP 4: FIVE SACRED HERBS ARRANGEMENT
Place these herbs NATURALLY ON THE SURFACE around the product:
- 长白山人参 (Ginseng root with tendrils) - laid on surface, left side
- 灵芝 (Lingzhi mushroom) - placed on surface, right side  
- 牡丹花瓣 (Peony petals) - SCATTERED on the surface
- 紫苏叶 (Fresh perilla leaves) - laid near product
- 北五味子 (Red schisandra berries) - small cluster on surface

EACH ELEMENT MUST:
- Touch the surface (not floating)
- Cast its own natural shadow
- Look fresh and real, not CGI
- Have proper texture (leaves should look soft, berries glossy, etc.)

STEP 5: LIGHTING & SHADOWS (MOST CRITICAL)
- ALL elements share the SAME LIGHT SOURCE from the environment
- Shadows point in the SAME DIRECTION
- Shadow softness matches the light type (soft for diffused, sharp for direct)
- Highlights on product and herbs come from THE SAME ANGLE
- Color temperature matches environment (warm lamp = warm reflections)

STEP 6: DEPTH OF FIELD
- Product and herbs: SHARP FOCUS
- Background: Naturally BLURRED using photography depth of field
- NOT simple blur - should look like shot with f/2.8-f/4 aperture
- Bokeh effect if there are lights in background

STEP 7: LOGO
- Place LOGO from IMAGE 1 in TOP LEFT corner
- 15-20% of image width
- Subtle and elegant, not distracting

FINAL QUALITY CHECK:
✓ Does this look like ONE photograph taken by a professional photographer?
✓ Can you see where the product is sitting? (contact point visible)
✓ Do all shadows point the same direction?
✓ Is the background blurred naturally with depth of field?
✓ Would this photo work in a high-end beauty magazine?

OUTPUT: 1:1 ratio photorealistic product image that looks like a single professional photograph, not a digital composite.`

    const cleanLogoBase64 = logoBase64.replace(/^data:image\/\w+;base64,/, '')
    const cleanProductBase64 = productBase64.replace(/^data:image\/\w+;base64,/, '')
    const cleanEnvBase64 = envBase64.replace(/^data:image\/\w+;base64,/, '')

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
                            { inline_data: { mime_type: "image/png", data: cleanLogoBase64 } },
                            { inline_data: { mime_type: "image/jpeg", data: cleanProductBase64 } },
                            { inline_data: { mime_type: "image/jpeg", data: cleanEnvBase64 } }
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
        styleA: `你是一位有文化底蕴的都市女性，对中医养生有深入了解。为佰草集修源五行【${productName}】写一篇深度体验分享。

要求：
- 从中医五行理论切入，展现专业认知（如：五脏对应五行、气血津液等概念）
- 自然引用《黄帝内经》等典籍，但不生硬堆砌
- 解读五大仙草的中医原理（人参补气、灵芝养心、五味子敛肺、牡丹皮活血、紫苏叶疏肝）
- 用词考究但不做作，展现生活品位
- 融入个人思考和见解，而非简单推荐
- 保留"内养生机""年轻嘭弹"理念，从养生哲学角度阐释
- 280-320字，语气优雅从容，直接输出文案`,

        styleB: `你是深谙传统美学的生活家，将东方哲学融入日常。为佰草集修源五行【${productName}】写一篇意境深远的生活随笔。

要求：
- 从节气物候、人文历史角度切入，展现文化积淀
- 将五行哲学、阴阳平衡等理念自然融入
- 五大仙草的描述要有典故出处（如：《本草纲目》记载）
- 文笔雅致但有温度，像在和知己品茗论道
- 适度引用诗词或古籍，但不掉书袋
- "内养生机"从哲学高度阐释（天人合一、返璞归真）
- 280-320字，意境深远但不晦涩，直接输出文案`,

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
        styleA: `最近重新审视了中医"治未病"的理念，恰逢用上佰草集修源五行${productName}。《黄帝内经》讲"五脏藏精气而不泻"，这支产品将五行学说具象化：人参补气固本对应肺金，灵芝养心安神归于心火，五味子敛肺生津属肺金，牡丹皮活血化瘀入肝木，紫苏叶疏肝解郁调脾土。用了三周，发现"内养生机"确实不是空话——肌底代谢变得规律，面部微循环改善明显。这种由内而外的调理，比单纯追求表层修饰更符合东方养生智慧。`,

        styleB: `立春后第五日，翻阅《本草纲目》人参条："补五脏，安精神，定魂魄。"恰用佰草集修源五行${productName}。李时珍集大成之五味药材——长白人参千年灵气，赤芝"久食轻身不老"之记载，北五味子"益气生津"之妙，牡丹根皮"和血生血"之能，紫苏叶"行气和中"之效。晨昏涂敷间，仿若与古人对话。"内养生机"四字，实乃天人合一、顺时养生之道。三旬之后，镜中颜色润泽，非脂粉之功，乃气血调和使然。`,

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

