const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = 'https://api.apiyi.com/v1beta';
const TEXT_MODEL = 'gemini-3-pro-image-preview';

const PRODUCTS = ['仙草霜', '仙草露', '仙草油', '仙草乳'];
const STYLES = ['styleA', 'styleB', 'styleC'];
const COUNT_PER_STYLE = 10; // 降低到 10 条避免 Rate Limit

const PROMPTS = {
    styleA: (name) => `你是一位35+的外企女高管。请写一段关于佰草集【${name}】的私房话。
要求：
- 关键词：长期主义、掌控感、底气、回血。
- 语气：在高级Club里低声告诉闺蜜。
- 拒绝焦虑，强调"稳"。
- 100字左右，金句频出。
- 直接输出文案，不要任何前缀或解释。`,
    styleB: (name) => `你是一位隐居都市的茶道师。请写一段关于佰草集【${name}】的生活随笔。
要求：
- 关键词：五感修行、温润如玉、天地的馈赠、留白。
- 语气：空灵、治愈、安静。
- 100字左右，文字要有香气。
- 直接输出文案，不要任何前缀或解释。`,
    styleC: (name) => `你是一位资深成分党配方师（讲人话版）。请写一段关于佰草集【${name}】的深度安利。
要求：
- 关键词：五行组方、给细胞充电、系统调理。
- 语气：专业但像邻家姐姐，聪明。
- 100字左右，逻辑清晰。
- 直接输出文案，不要任何前缀或解释。`
};

async function generateCopy(prompt, retries = 3) {
    const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 300
                    }
                })
            });

            if (!response.ok) {
                console.error(`\n❌ API Error: ${response.status} ${response.statusText}`);
                if (attempt < retries) {
                    console.log(`   Retrying (${attempt}/${retries})...`);
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                return null;
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!text || text.length < 20) {
                console.error(`\n❌ Invalid response: ${text}`);
                return null;
            }

            return text;
        } catch (e) {
            console.error(`\n❌ Exception: ${e.message}`);
            if (attempt < retries) {
                console.log(`   Retrying (${attempt}/${retries})...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    return null;
}

async function main() {
    console.log("🚀 开始批量生成高定文案库...\n");
    const library = {};
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const product of PRODUCTS) {
        console.log(`\n📦 正在生成：${product}`);
        library[product] = { styleA: [], styleB: [], styleC: [] };

        for (const style of STYLES) {
            console.log(`  👉 风格：${style} (目标 ${COUNT_PER_STYLE} 条)`);
            const prompt = PROMPTS[style](product);

            // 串行生成避免 Rate Limit
            for (let i = 0; i < COUNT_PER_STYLE; i++) {
                const text = await generateCopy(prompt + `\n(这是第 ${i + 1} 条，请写得与众不同一些)`);

                if (text) {
                    library[product][style].push(text);
                    process.stdout.write('✓');
                    totalSuccess++;
                } else {
                    process.stdout.write('✗');
                    totalFailed++;
                }

                // 延迟避免 Rate Limit
                await new Promise(r => setTimeout(r, 500));
            }

            console.log(` (成功: ${library[product][style].length}/${COUNT_PER_STYLE})`);
        }
    }

    const outputPath = path.join(__dirname, '../app/data/copy_library.json');
    fs.writeFileSync(outputPath, JSON.stringify(library, null, 2));

    console.log(`\n\n🎉 文案库已生成并保存至：${outputPath}`);
    console.log(`📊 统计：成功 ${totalSuccess} 条，失败 ${totalFailed} 条`);
}

main();
