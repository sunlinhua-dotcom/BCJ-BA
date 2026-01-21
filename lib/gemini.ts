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

    const prompt = `
    ROLE: World-Class Commercial Skincare Product Photographer & Visual Designer.
    
    BRAND: 佰草集 HERBORIST - 修源五行系列
    PRODUCT: ${productName}
    
    YOU HAVE 3 REFERENCE IMAGES:
    - IMAGE 1: 品牌 LOGO (佰草集 HERBORIST 标识)
    - IMAGE 2: 产品图 (Product - ${productName})
    - IMAGE 3: 环境图 (Environment/Scene)
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    CRITICAL REQUIREMENTS:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    1. 【LOGO 放置 - 最重要】
       - 必须在最终图片中包含 IMAGE 1 中的品牌 LOGO
       - LOGO 应放置在图片的**左上角或右下角**，作为品牌水印
       - LOGO 保持原有比例，大小适中（约占图片宽度的 15-20%）
       - LOGO 要清晰可见，但不遮挡产品主体
       - 可以加一层淡淡的投影让 LOGO 更融入画面
    
    2. 【产品为主角】
       - IMAGE 2 中的产品必须是整个画面的绝对核心
       - 产品要大、清晰、完整展示标签和细节
       - 产品光影要与环境光一致
    
    3. 【环境融合】
       - 使用 IMAGE 3 作为背景氛围
       - 提取环境的光影色调，让产品仿佛真实置身其中
       - 可以虚化背景，突出产品
    
    4. 【品质要求】
       - 高端商业摄影级别的输出
       - 东方美学 + 现代简约
       - 无明显合成痕迹
       - 画面干净、高级、有质感
    
    OUTPUT: 一张包含品牌 LOGO、产品主体、环境氛围的高端商业产品海报。
    `

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
        styleA: `你是一位28岁的都市白领女性，热爱中式养生。请以第一人称分享使用佰草集修源五行【${productName}】的真实体验。开头用具体生活场景引入，自然提及五大仙草祖方（人参、灵芝、五味子、牡丹皮、紫苏叶），描述使用感受，融入"内养生机、年轻嘭弹"理念。语气亲切真实，像和姐妹分享，280-320字。直接输出文案。`,

        styleB: `你是深谙东方养生的生活美学博主，文笔细腻优雅。为佰草集修源五行【${productName}】创作带有古风意境的分享。以四季节气开篇，将五大仙草智慧化作诗意叙事，描绘东方养护仪式感，用"嘭弹如初、肌若凝脂"等意象，收尾呼应"内养外修"理念。古典现代交融，280-320字。直接输出文案。`,

        styleC: `你是护肤成分研究博主。为佰草集修源五行【${productName}】写成分党测评。开篇说对中草药从怀疑到认可，解读五大仙草现代功效（人参促胶原、灵芝强屏障、五味子收毛孔、牡丹皮提亮、紫苏叶抗炎），描述28天使用变化，点明"内养生机"有据可依。理性真诚推荐，280-320字。直接输出文案。`
    }

    const fallbacks = {
        styleA: `最近加班太多，照镜子发现自己脸色暗沉、法令纹都出来了。闺蜜推荐我试试佰草集修源五行系列的${productName}，说是五大仙草祖方，人参养元、灵芝安神、五味子收敛、牡丹皮活络、紫苏叶舒缓。抱着试试看的心态入手，第一次用就被惊艳！淡淡的草本清香，质地好推开，吸收快。坚持两周，皮肤明显透亮了，从内而外的光泽感真的难得。"内养生机，年轻嘭弹"现在真懂了，推荐给想好好养护肌肤的姐妹~`,

        styleB: `惊蛰过后，万物复苏，肌肤也在这个时节悄然苏醒。晨起对镜，取出案头的佰草集修源五行${productName}，开始一日的养护仪式。人参固本、灵芝安神、五味子敛阳、牡丹皮活络、紫苏叶舒缓——五大仙草的千年智慧，化作瓶中精华，轻点于指尖。草本清香萦绕鼻尖，仿佛置身晨雾药田。肌肤如久旱逢甘霖，一点点变得饱满透亮。内养生机，年轻嘭弹——这是与自己对话的东方美学。真正的美，是由内而外的从容与安然。`,

        styleC: `作为成分党，我对"中草药护肤"一直持保留态度，直到遇见佰草集修源五行${productName}。研究成分表：人参皂苷促进胶原生成、抗氧化；灵芝多糖舒缓敏感、强化屏障；五味子木脂素收敛毛孔、提升弹性；牡丹皮丹皮酚促进微循环、提亮肤色；紫苏叶提取物抗炎舒敏。五大仙草搭配不是玄学，而是有据可依的古法今用。实测28天，毛孔细腻，脸色透亮，弹性回来了。"内养生机"这四个字，我服气了！`
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

