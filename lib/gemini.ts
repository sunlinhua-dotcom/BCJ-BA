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

    // 产品外观材质 DNA (防止 AI 画成塑料)
    const productMaterials: Record<string, string> = {
        'default': `
        - **MATERIAL**: Premium Matte White Porcelain (温润白瓷质感).
        - **TEXTURE**: Jade-like finish, soft diffusion, NOT glossy plastic.
        - **COLOR**: Warm White / Creamy White (Old Paper Tone). NOT bright blue-white.
        - **FEEL**: Heavy, expensive, luxury ancient Chinese ceramic feel.`
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
- STICTLY FORBIDDEN: Shiny plastic look, overly reflective surfaces, cold blue lighting.
- The bottle must look like it is made of "Dehua White Porcelain" (德化白瓷).

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
- STICTLY FORBIDDEN: Shiny plastic look, overly reflective surfaces, cold blue lighting.
- The bottle must look like it is made of "Dehua White Porcelain" (德化白瓷).

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
    // 强大的本地文案引擎 (Local Copy Engine)
    // 当 API 失败时，使用此引擎生成不重复的文案
    // ==========================================

    const localTemplates = {
        // 风格 A：大女主 / 职场 / 长期主义
        styleA: {
            hooks: [
                "到了35岁，我不再相信“一夜回春”的鬼话，我只信奉“长期主义”带来的定力。",
                "在名利场打滚久了，越发觉得：真正的奢侈品不是Logo，而是这种“掌控感”。",
                "成年人的安全感，一半来自存款，一半来自皮肤的“稳”。",
                "拒绝了无效社交，关掉了朋友圈，今晚只留给这瓶佰草集。",
                "与其在焦虑中跟风刷酸，不如在稳扎稳打中重建秩序。"
            ],
            pains: [
                "最近连轴转的项目让我身心俱疲，",
                "看着镜子里因为熬夜而暗沉的脸色，",
                "面对换季时的那点小情绪和泛红，",
                "在飞这一趟跨洋航班的途中，",
                "结束了一场极度消耗的谈判后，"
            ],
            solutions: [
                "好在有这瓶佰草集修源五行${productName}。",
                "是它接住了我所有的疲惫，佰草集修源五行${productName}。",
                "我想到了老祖宗的智慧，拿出了这瓶${productName}。",
                "随手拿起的这瓶${productName}，成了我的救命稻草。",
                "幸好手边常备着这瓶修源五行${productName}。"
            ],
            benefits: [
                "它不是那种浮于表面的修饰，而是一种深层的“支撑力”。人参的元气、灵芝的安稳，给了我最大的底气。",
                "那种温润的包裹感，瞬间抚平了燥热。它不急不躁，一点点把我的好状态养回来。",
                "没有猛药的刺激，只有润物细无声的滋养。第二天醒来，脸是软的，心是静的。",
                "它像一个情绪稳定的老友，默默帮你修护屏障，筑起一道防线。",
                "坚持用了半瓶，那种由内而外的透亮感，是装不出来的。"
            ],
            closings: [
                "在这个不确定的世界里，拥有一张“稳”得住的脸，就是对生活最好的掌控。",
                "流水不争先，争的是滔滔不绝。护肤如此，人生亦然。",
                "你只管努力，剩下的交给时间，和它。",
                "原来，从容才是一种最高级的美。",
                "最好的投资，永远是投资自己。"
            ]
        },

        // 风格 B：东方美学 / 隐士 / 治愈
        styleB: {
            hooks: [
                "黄昏，点一盏灯，卸下一日的浮躁。",
                "在万物速朽的时代，我们都需要一份源于自然的恒常。",
                "雨后的清晨，空气里有泥土和草木的香气。",
                "真正的养肤，其实是一场五感的修行。",
                "慢下来，去感受一朵花开的时间。"
            ],
            pains: [
                "指尖触碰到佰草集修源五行${productName}的温润，",
                "打开瓶盖，那股淡淡的草药香若有似无，",
                "取一泵${productName}于掌心预热，",
                "当这瓶${productName}触肤的那一刻，",
                "在这个快节奏的都市里，"
            ],
            solutions: [
                "草本的香气若有似无地散开，是苦后的回甘，也是生活的隐喻。",
                "仿佛置身于长白山的深林之中，呼吸都变得深沉了。",
                "人参、灵芝、牡丹...这些天地的馈赠，此刻化作能量沁入肌理。",
                "它没有化学香精的廉价感，只有大自然最本真的味道。",
                "这不仅仅是护肤，更像是一场微型的仪式。"
            ],
            benefits: [
                "这不是简单的涂抹，而是一次与肌肤的深度对话。",
                "感觉每一个毛孔都在贪婪地呼吸，吸收着五行的灵气。",
                "干燥、粗糙被一点点抚平，留下的只有如玉般的温润。",
                "那种安心感，就像回到了小时候外婆的怀抱。",
                "肌肤喝饱了水，透出一种像瓷器一样细腻的光泽。"
            ],
            closings: [
                "心静了，世界就静了。脸也干净了。",
                "于方寸之间，见天地辽阔。",
                "这一刻，我找回了久违的自己。",
                "美，本就是一种自然的平衡。",
                "愿你也能在喧嚣中，修得这一份自在。"
            ]
        },

        // 风格 C：成分党 / 科学 / 简单易懂
        styleC: {
            hooks: [
                "很多粉丝问我，为什么国货现在这么强？",
                "别再盲目刷酸了，你的屏障可能正在“裸奔”。",
                "护肤界的“特种兵”，我只服这一瓶。",
                "扒了上百个配方，我发现了一个被低估的宝藏。",
                "听一句劝：抗老不一定是猛药，维稳才是硬道理。"
            ],
            pains: [
                "看这瓶佰草集修源五行${productName}就知道了。",
                "直到我遇到了佰草集修源五行${productName}。",
                "研究完${productName}的成分表，我直呼内行。",
                "这瓶${productName}的思路非常超前。",
                "如果你也是敏皮、熬夜党，一定要试试这个${productName}。"
            ],
            solutions: [
                "别被“中草药”三个字吓退，它的逻辑非常现代——你可以把它想象成给皮肤细胞喝的“超级补剂”。",
                "人参负责“充电”，让细胞干活更有劲；灵芝负责“维稳”，像灭火器一样按住炎症。",
                "比起单一的化学成分，这种“五行组方”是更系统的整体调理，相当于给皮肤请了个中医团队。",
                "专利微囊技术把活性成分包裹起来，直达肌底，完全不用担心不吸收。",
                "五种顶级草本协同作用，比单一成分的效率高出好几倍。"
            ],
            benefits: [
                "坚持用下来，你会发现脸不容易泛红了，那种由内而外透出来的光泽感，是皮肤真正“健康”的证明。",
                "原本粗糙的颗粒感没了，摸上去像是剥了壳的鸡蛋。",
                "法令纹虽然不会立刻消失，但整个脸确实“嘭”起来了。",
                "换季的时候，只有它能让我安心。稳，就是最大的赢。",
                "抗氧、修护、滋润，这一瓶全都给你包圆了。"
            ],
            closings: [
                "成分党闭眼入，绝对不踩雷。",
                "这才是真正适合中国宝宝体质的护肤品。",
                "把脸交给他，我很放心。",
                "不玩虚的，效果看得见。",
                "相信我，用一次你就会爱上。"
            ]
        }
    }

    function generateLocalCopy(productName: string, style: 'styleA' | 'styleB' | 'styleC'): string {
        const t = localTemplates[style]
        const hook = getRandomItem(t.hooks)
        const pain = getRandomItem(t.pains)
        const solution = getRandomItem(t.solutions)
        const benefit = getRandomItem(t.benefits)
        const closing = getRandomItem(t.closings)

        const raw = `${hook}${pain}${solution}${benefit}${closing}`
        return raw.replaceAll('${productName}', productName)
    }

    // ----------------------------------------------------------------

    const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`

    const generateOne = async (prompt: string, fallback: string): Promise<string> => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.95, maxOutputTokens: 1024 }
                })
            })
            if (!response.ok) return fallback
            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            return text?.trim() || fallback
        } catch { return fallback }
    }

    const [styleA, styleB, styleC] = await Promise.all([
        generateOne(promptStyleA, generateLocalCopy(productName, 'styleA')),
        generateOne(promptStyleB, generateLocalCopy(productName, 'styleB')),
        generateOne(promptStyleC, generateLocalCopy(productName, 'styleC'))
    ])

    console.log('[Gemini] 3-style copy generation complete')
    return { styleA, styleB, styleC }
}


