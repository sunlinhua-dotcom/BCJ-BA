
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const productsDir = path.join(publicDir, 'products');

async function compressImage(filePath, targetExt = '.webp') {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

    // 如果是我们的超大原始图，我们生成一个较小的 webp
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    const outputPath = path.join(dir, `${baseName}${targetExt}`);

    console.log(`Processing: ${filePath} -> ${outputPath}`);

    try {
        await sharp(filePath)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath + '.tmp');

        fs.renameSync(outputPath + '.tmp', outputPath);
        console.log(`Successfully compressed: ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

async function run() {
    // 1. 处理产品图
    if (fs.existsSync(productsDir)) {
        const files = fs.readdirSync(productsDir);
        for (const file of files) {
            const filePath = path.join(productsDir, file);
            // 只处理超大的 jpg
            if (file.endsWith('.jpg')) {
                await compressImage(filePath, '.webp');
            }
        }
    }

    // 2. 处理 Logo 等公共资源
    const publicFiles = fs.readdirSync(publicDir);
    for (const file of publicFiles) {
        const filePath = path.join(publicDir, file);
        if (fs.statSync(filePath).isFile() && (file.includes('logo') || file.includes('new'))) {
            // 保持原格式但压缩一下，或者转为 webp
            await compressImage(filePath, '.webp');
            // 对于 png logo，我们也生成一个压缩后的 png
            if (file.endsWith('.png')) {
                const out = filePath.replace('.png', '-small.png');
                await sharp(filePath).resize(200).png({ quality: 80 }).toFile(out);
            }
        }
    }
}

run();
