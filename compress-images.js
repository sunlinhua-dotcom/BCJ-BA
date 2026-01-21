const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const products = ['cream', 'water', 'oil', 'lotion'];
const publicDir = path.join(__dirname, 'public');

async function compressImages() {
    console.log('开始压缩图片...');

    // 压缩产品图 (400px宽，webp格式，质量75)
    for (const p of products) {
        const input = path.join(publicDir, 'products', `${p}.jpg`);
        const output = path.join(publicDir, 'products', `${p}.webp`);

        await sharp(input)
            .resize(400, null, { withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(output);

        const origSize = fs.statSync(input).size;
        const newSize = fs.statSync(output).size;
        console.log(`${p}.jpg: ${(origSize / 1024).toFixed(0)}KB -> ${p}.webp: ${(newSize / 1024).toFixed(0)}KB`);
    }

    // 压缩LOGO (300px宽)
    const logoInput = path.join(publicDir, 'logo.png');
    const logoOutput = path.join(publicDir, 'logo.webp');

    await sharp(logoInput)
        .resize(300, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(logoOutput);

    const logoOrig = fs.statSync(logoInput).size;
    const logoNew = fs.statSync(logoOutput).size;
    console.log(`logo.png: ${(logoOrig / 1024).toFixed(0)}KB -> logo.webp: ${(logoNew / 1024).toFixed(0)}KB`);

    console.log('✅ 压缩完成!');
}

compressImages().catch(console.error);
