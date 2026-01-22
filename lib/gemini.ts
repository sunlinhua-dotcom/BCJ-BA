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
    console.log('[Gemini] Starting product image generation for:', productName)
    console.log('[Gemini] API Key exists:', !!API_KEY)

    // 强化光影真实度的提示词
    const prompt = `You are a world-class commercial photographer creating a LUXURIOUS skincare product image.

BRAND: 佰草集 HERBORIST - ${productName}

INPUT IMAGES:
- IMAGE 1: Brand LOGO (佰草集 HERBORIST)
- IMAGE 2: Product bottle
- IMAGE 3: Environment/Scene (use as REAL BACKGROUND)

═══════════════════════════════════════════════════
CRITICAL: AVOID PS-LIKE COMPOSITING - MAKE IT PHOTOREALISTIC
═══════════════════════════════════════════════════

LIGHTING & SHADOWS (Most Important):

1. 【ANALYZE ENVIRONMENT LIGHT】
   - Carefully study the LIGHT SOURCE in IMAGE 3 (window light? warm lamp? natural daylight?)
   - Note the DIRECTION of light (from left/right/top/front?)
   - Identify the COLOR TEMPERATURE (warm/cool/neutral?)

2. 【APPLY SAME LIGHTING TO PRODUCT & HERBS】
   - Product bottle must have highlights and shadows matching the EXACT same light direction
   - If environment has warm lamp light, product should have warm reflections
   - If environment has window light from left, highlights must be on left side
   - Bottle surface should REFLECT the environment colors subtly

3. 【CAST REALISTIC SHADOWS】
   - Product bottle casts a SOFT SHADOW on the surface in the SAME direction as other objects in scene
   - Each herb element casts its own natural shadow
   - Shadow softness matches environment (sharp for direct light, soft for diffused)
   - Shadow color should match environment shadows (not pure black)

COMPOSITION:

1. 【ENVIRONMENT】- Use IMAGE 3 as real background, slightly soft focused
2. 【PRODUCT】- Center, sharp, REALISTICALLY integrated into the scene
3. 【HERBS】- Arranged naturally on surface around product:
   - 长白山人参 (Ginseng root) - left side, casting shadows
   - 灵芝 (Lingzhi mushroom) - right side
   - 牡丹花瓣 (Peony petals) - scattered artistically
   - 紫苏叶 (Perilla leaves) - near product
   - 北五味子 (Schisandra berries) - small cluster
4. 【LOGO】- Top left, 15-20% width, subtle

FINAL CHECK:
- Does the product look like it was ACTUALLY photographed in this scene?
- Are all shadows pointing the SAME direction?
- Does the lighting color MATCH the environment?
- Would a professional photographer believe this is ONE SHOT, not composited?

OUTPUT: 1:1 photorealistic product image that looks like a single photograph, not a composite.`

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
        styleA: `你是一个28岁的普通上班族，刚入手了佰草集修源五行【${productName}】。请写一段像在小红书上和姐妹们分享真实使用体验的文案。

要求：
- 用日常口语，带语气词（真的、居然、哦、啊等）
- 具体场景开头（比如：熬夜加班后照镜子、换季皮肤干燥等）
- 提到五大仙草成分时要自然，像朋友推荐（"它里面有人参灵芝那些，一开始以为是噱头..."）
- 保留品牌词"内养生机""年轻嘭弹"，但要融入口语表达
- 可以提小缺点增加真实感（比如："刚开始味道有点中药味，后来就习惯了"）
- 280-320字，直接输出文案`,

        styleB: `你是一个喜欢中式美学的博主，用有文采但不矫揉造作的文字分享佰草集修源五行【${productName}】。

要求：
- 可以从节气、季节、生活仪式感切入
- 文笔优雅但要有人情味，像朋友在优雅地聊天
- 五大仙草（人参、灵芝、五味子、牡丹皮、紫苏叶）用诗意但不夸张的方式描述
- 融入"内养生机""年轻嘭弹"理念
- 古典韵味但要接地气，避免纯文言或过度抒情
- 280-320字，直接输出文案`,

        styleC: `你是一个成分党博主，一开始对中草药护肤持怀疑态度，但用了佰草集修源五行【${productName}】后被圈粉。写一段真诚的测评文案。

要求：
- 开头坦诚自己之前的怀疑（"作为成分党，以前觉得中草药是智商税..."）
- 科普五大仙草功效时要通俗易懂，像在给朋友科普
- 描述真实使用周期和变化（可以提前期没感觉，后来慢慢有效果）
- 保留"内养生机"品牌理念，但用理性角度解释
- 语气专业但不说教，像个靠谱的朋友推荐
- 280-320字，直接输出文案`
    }

    const fallbacks = {
        styleA: `姐妹们！最近被佰草集这个${productName}惊艳到了🔥 之前熬夜加班，脸上各种暗沉细纹，真的急死我了。闺蜜说你试试这个，里面有人参灵芝那些"五大仙草"，一开始我还想会不会是噱头啊...结果真香！用了第三天早上照镜子，皮肤居然有那种嘭嘭的感觉（就是"年轻嘭弹"那种），不是假滑哦。质地很好推开，吸收快，淡淡草本味我还挺喜欢的。坚持用了两周，连我妈都说我气色好了。"内养生机"这个理念我是真的信了，推荐给和我一样熬夜党的姐妹！`,

        styleB: `惊蛰过后，万物复苏，肌肤也在这个时节悄然苏醒。晨起对镜，取出案头的佰草集修源五行${productName}，开始一日的养护仪式。人参固本、灵芝安神、五味子敛阳、牡丹皮活络、紫苏叶舒缓——五大仙草的千年智慧，化作瓶中精华，轻点于指尖。草本清香萦绕鼻尖，仿佛置身晨雾药田。肌肤如久旱逢甘霖，一点点变得饱满透亮。内养生机，年轻嘭弹——这是与自己对话的东方美学。真正的美，是由内而外的从容与安然。`,

        styleC: `作为成分党，以前看到"中草药护肤"就觉得是智商税，直到用了佰草集修源五行${productName}。翻成分表发现还真不是噱头：人参皂苷促进胶原生成，灵芝多糖强化屏障，五味子收敛毛孔，牡丹皮提亮肤色，紫苏叶抗炎舒敏。五大仙草搭配是有现代科学依据的，不是玄学。实测前一周没啥感觉，两周后开始有变化，28天下来毛孔真的细腻了，脸色也透亮了。现在理解"内养生机"这个理念了——不是速效猛药，是真的在养护。谨慎推荐给和我一样理性挑剔的成分党姐妹！`
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

