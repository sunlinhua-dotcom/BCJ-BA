const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateOG() {
    console.log('Generating OG Image...');

    const rootDir = process.cwd();
    const logoPath = path.join(rootDir, 'public', 'logo.png');
    const outputPath = path.join(rootDir, 'public', 'og-image.jpg');

    if (!fs.existsSync(logoPath)) {
        console.error('Error: logo.png not found at', logoPath);
        process.exit(1);
    }

    try {
        // 1. 读取 Logo 并调整大小
        const logo = await sharp(logoPath)
            .resize(400, null) // 宽度 400，高度自适应
            .toBuffer();

        // 2. 创建背景 (1200x630)
        // 使用品牌背景色 #F8F6F3 (RGB: 248, 246, 243)
        const background = await sharp({
            create: {
                width: 1200,
                height: 630,
                channels: 3,
                background: { r: 248, g: 246, b: 243 }
            }
        })
            .composite([
                {
                    input: logo,
                    gravity: 'center' // 居中放置 Logo
                }
            ])
            .jpeg({
                quality: 80,
                chromaSubsampling: '4:4:4'
            })
            .toFile(outputPath);

        console.log('OG Image generated successfully!');
        console.log('Path:', outputPath);

        // Check file size
        const stats = fs.statSync(outputPath);
        console.log('File size:', (stats.size / 1024).toFixed(2), 'KB');

    } catch (error) {
        console.error('Error generating OG image:', error);
    }
}

generateOG();
