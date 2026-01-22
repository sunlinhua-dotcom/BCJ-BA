const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY || '***REMOVED***';
const BASE_URL = 'https://api.apiyi.com/v1beta';
const TEXT_MODEL = 'gemini-3-pro-image-preview';

const PRODUCTS = ['仙草霜']; // 先测试一个产品
const STYLES = ['styleA'];
const COUNT_PER_STYLE = 2; // 先测试 2 条

const PROMPTS = {
    styleA: (name) => `你是一位35+的外企女高管。请写一段关于佰草集【${name}】的私房话。
要求：
- 关键词：长期主义、掌控感、底气、回血。
- 语气：在高级Club里低声告诉闺蜜。
- 拒绝焦虑，强调"稳"。
- 100字左右，金句频出。
- 直接输出文案，不要任何前缀或解释。`
};

async function generateCopy(prompt) {
    const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`;

    try {
        console.log('\n🔍 Sending request to:', url);
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

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            return null;
        }

        const data = await response.json();
        console.log('📦 Full API response:', JSON.stringify(data, null, 2));

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        console.log('✅ Extracted text:', text);

        return text || null;
    } catch (e) {
        console.error('❌ Exception:', e.message);
        return null;
    }
}

async function main() {
    console.log("🚀 开始测试 API 调用...\n");

    const prompt = PROMPTS.styleA('仙草霜');
    const result = await generateCopy(prompt);

    console.log('\n\n=== FINAL RESULT ===');
    console.log(result);
}

main();
