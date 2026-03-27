/**
 * 双模型连通性测试
 * - 文案模型: gemini-3.1-flash-preview
 * - 图像模型: gemini-3.1-flash-image-preview
 */

const fs = require('fs');
const path = require('path');

const API_KEY     = process.env.GEMINI_API_KEY  || 'sk-hUMNGKLJnZJERuBH9c6bBc14A4E145D993318583Db7f8fE9';
const TEXT_KEY    = process.env.TEXT_API_KEY    || 'sk-ceYYSJQE98KNX7tl4f364a604eB741B28d4bCe1396A878Fb';
const BASE_URL    = 'https://api.apiyi.com/v1beta';
const TEXT_MODEL  = 'gemini-3.1-pro-preview';
const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

// ─── 1. 文案模型测试 ───────────────────────────────────────────────────────────
async function testTextModel() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📝 测试文案模型: ${TEXT_MODEL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const url = `${BASE_URL}/models/${TEXT_MODEL}:generateContent`;
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEXT_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: '用一句话描述佰草集仙草霜的卖点（中文，20字以内）。直接输出，不要前缀。' }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
      })
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`📡 状态码: ${res.status}  耗时: ${elapsed}s`);

    if (!res.ok) {
      const err = await res.text();
      console.error('❌ 失败:', err);
      return false;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log('✅ 返回内容:', text);
    return true;
  } catch (e) {
    console.error('❌ 异常:', e.message);
    return false;
  }
}

// ─── 2. 图像模型测试 ───────────────────────────────────────────────────────────
async function testImageModel() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🖼️  测试图像模型: ${IMAGE_MODEL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 读取 cream.png 作为测试产品图
  const productPath = path.join(__dirname, '../public/products-ai/cream.png');
  let productB64 = '';
  try {
    productB64 = fs.readFileSync(productPath).toString('base64');
    console.log(`📂 产品图加载成功: cream.png (${(productB64.length / 1024).toFixed(0)} KB base64)`);
  } catch (e) {
    console.warn('⚠️  无法读取产品图，改用纯文字请求测试模型连通性');
  }

  const url = `${BASE_URL}/models/${IMAGE_MODEL}:generateContent`;
  const start = Date.now();

  const parts = [
    { text: 'Generate a simple 1:1 square image of a white skincare cream jar on a white background. Minimal, clean, professional.' },
    ...(productB64 ? [{ inline_data: { mime_type: 'image/png', data: productB64 } }] : [])
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: '1:1', imageSize: '1K' }
        }
      }),
      signal: AbortSignal.timeout(120000)
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`📡 状态码: ${res.status}  耗时: ${elapsed}s`);

    if (!res.ok) {
      const err = await res.text();
      console.error('❌ 失败:', err.substring(0, 500));
      return false;
    }

    const data = await res.json();
    const parts_resp = data.candidates?.[0]?.content?.parts || [];
    const imgPart = parts_resp.find(p => p.inlineData || p.inline_data);

    if (imgPart) {
      const imgData = imgPart.inlineData?.data || imgPart.inline_data?.data;
      const sizeKB = (imgData.length / 1024).toFixed(0);
      console.log(`✅ 图像生成成功！大小: ${sizeKB} KB`);

      // 保存测试图片
      const outPath = path.join(__dirname, '../tmp_test_image.jpg');
      fs.writeFileSync(outPath, Buffer.from(imgData, 'base64'));
      console.log(`💾 已保存到: ${outPath}`);
      return true;
    } else {
      console.error('❌ 返回中无图像数据，完整响应:');
      console.error(JSON.stringify(data, null, 2).substring(0, 1000));
      return false;
    }
  } catch (e) {
    console.error('❌ 异常:', e.message);
    return false;
  }
}

// ─── 主函数 ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 BCJ 双模型连通性测试');
  console.log(`⏰ ${new Date().toLocaleString('zh-CN')}\n`);

  const [textOk, imageOk] = await Promise.all([
    testTextModel(),
    testImageModel()
  ]);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 测试结果汇总');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`文案模型 (${TEXT_MODEL}): ${textOk ? '✅ 通过' : '❌ 失败'}`);
  console.log(`图像模型 (${IMAGE_MODEL}): ${imageOk ? '✅ 通过' : '❌ 失败'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(textOk && imageOk ? 0 : 1);
}

main();
