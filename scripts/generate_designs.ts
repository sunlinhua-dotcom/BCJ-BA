
import fs from 'fs';
import path from 'path';

// 配置 (复用 lib/gemini.ts 的配置)
const API_KEY = 'sk-g8JehwXjfoWKeHxvDdAe2277FeA24c0094B7E6Fe5566346b';
const BASE_URL = 'https://api.apiyi.com/v1beta';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

// 两个设计图的 Prompt
const PROMPTS = [
    {
        name: 'herborist_home_ui',
        text: "Mobile App UI design for luxury skincare brand 'Herborist', Home Screen. HEADER: Elegant serif layout 'Herborist' at top, deep jade green typography. CONTENT: Clean grid layout of 4 product cards. Each card is a soft matte white container with rounded corners. Inside each card: a high-end skincare bottle (cream jar, toner bottle, essence oil, lotion pump) made of translucent jade-like glass. STYLE: Minimalist Oriental Zen. BACKGROUND: Creamy textured rice paper, subtle soft shadows. LIGHTING: Natural soft window light, diffused, premium commercial photography feel. High fidelity, 8k resolution."
    },
    {
        name: 'herborist_result_ui',
        text: "Mobile App UI design for 'Herborist' generated result page. CENTERPIECE: A large, square, high-quality photo frame featuring a 'Herborist' cream jar placed on a mossy stone in a bamboo forest. The frame has a white border and sits on the paper background with realistic drop shadow. TYPOGRAPHY SECTION: Below the image, a section of elegant Chinese Serif text, nicely typeset looking like a poem. UI ACTIONS: Two minimalist buttons at the bottom. Primary button in Gradient Forest Green, Secondary button in Muted Gold outline. ATMOSPHERE: Serene, poetic, breathable, high-end editorial design. High fidelity, 8k resolution."
    }
];

async function generateImage(name: string, prompt: string) {
    console.log(`[生成中] 正在生成 ${name}...`);
    const url = `${BASE_URL}/models/${IMAGE_MODEL}:generateContent`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"],
                    imageConfig: {
                        aspectRatio: "9:16", // 移动端 UI 比例
                        imageSize: "1K"
                    }
                }
            })
        });

        if (!response.ok) {
            console.error(`[失败] ${name}: Status ${response.status} - ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();

        // 尝试获取各个位置的 Base64 数据
        const candidates = data.candidates;
        if (!candidates || candidates.length === 0) {
            console.error(`[失败] ${name}: No candidates returned. Full response:`, JSON.stringify(data, null, 2));
            return;
        }

        const parts = candidates[0].content?.parts;
        const imagePart = parts?.find((p: any) => p.inline_data || p.inlineData);
        const base64Data = imagePart?.inline_data?.data || imagePart?.inlineData?.data;

        if (base64Data) {
            const buffer = Buffer.from(base64Data, 'base64');
            const outputPath = path.join(process.cwd(), `${name}.png`);
            fs.writeFileSync(outputPath, buffer);
            console.log(`[成功] 已保存至: ${outputPath}`);
        } else {
            console.error(`[失败] ${name}: 未找到图片数据。完整响应:`, JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error(`[错误] ${name}:`, error);
    }
}

async function main() {
    for (const item of PROMPTS) {
        await generateImage(item.name, item.text);
    }
}

main();
