const fs = require('fs');
const path = require('path');

// 模拟 API 调用（因为是脚本跑，可以直接用 fetch）
// 实际项目里这一步应该复用 lib/gemini.ts 的逻辑，但为了脚本独立性，我重写简版 fetch
const API_KEY = process.env.GEMINI_API_KEY || '***REMOVED***';
const BASE_URL = 'https://api.apiyi.com/v1beta';
const TEXT_MODEL = 'gemini-3-pro-image-preview';

const PRODUCTS = ['仙草霜', '仙草露', '仙草油', '仙草乳'];
const STYLES = ['styleA', 'styleB', 'styleC'];
const COUNT_PER_STYLE = 15; // 每种风格生成 15 条，总计 45 条/品 (接近50)

const PROMPTS = {
    styleA: (name) => `你是一位35+的外企女高管。请写一段关于佰草集【${name}】的私房话。
要求：
- 关键词：长期主义、掌控感、底气、回血。
- 语气：在高级Club里低声告诉闺蜜。
- 拒绝焦虑，强调"稳"。
- 100字左右，金句频出。`,
    styleB: (name) => `你是一位隐居都市的茶道师。请写一段关于佰草集【${name}】的生活随笔。
要求：
- 关键词：五感修行、温润如玉、天地的馈赠、留白。
- 语气：空灵、治愈、安静。
- 100字左右，文字要有香气。`,
    styleC: (name) => `你是一位资深成分党配方师（讲人话版）。请写一段关于佰草集【${name}】的深度安利。
要求：
- 关键词：五行组方、给细胞充电、系统调理。
- 语气：专业但像邻家姐姐，聪明。
- 100字左右，逻辑清晰。`
};

async function generateCopy(prompt) {
    const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 200 }
            })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "生成失败";
    } catch (e) {
        console.error("API Error:", e.message);
        return "生成失败";
    }
}

async function main() {
    console.log("🚀 开始批量生成高定文案库...");
    const library = {};

    for (const product of PRODUCTS) {
        console.log(`\n📦 正在生成：${product}`);
        library[product] = { styleA: [], styleB: [], styleC: [] };

        for (const style of STYLES) {
            console.log(`  👉 风格：${style} (目标 ${COUNT_PER_STYLE} 条)`);
            const prompt = PROMPTS[style](product);

            // 并发生成以提高速度
            const promises = Array(COUNT_PER_STYLE).fill(null).map((_, i) => {
                return new Promise(async (resolve) => {
                    // 稍微错开请求避免 Rate Limit
                    await new Promise(r => setTimeout(r, i * 200));
                    const text = await generateCopy(prompt + `\n(这是第 ${i + 1} 条，请写得与众不同一些)`);
                    process.stdout.write('.');
                    resolve(text);
                });
            });

            const results = await Promise.all(promises);
            // 过滤失败的
            library[product][style] = results.filter(t => t !== "生成失败" && t.length > 20);
            console.log(" ✅ 完成");
        }
    }

    const outputPath = path.join(__dirname, '../app/data/copy_library.json');
    fs.writeFileSync(outputPath, JSON.stringify(library, null, 2));
    console.log(`\n🎉 文案库已生成并保存至：${outputPath}`);
}

main();
