const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function optimize() {
    console.log('Starting asset optimization...');

    // 1. Create logo-opt.png
    const logoOriginal = path.join(PUBLIC_DIR, 'logo.png');
    const logoOpt = path.join(PUBLIC_DIR, 'logo-opt.png');

    if (fs.existsSync(logoOriginal)) {
        console.log('Optimizing logo.png...');
        await sharp(logoOriginal)
            .resize(400) // 2x Retina for 130px width is 260px, so 400 is plenty safe
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(logoOpt);

        const originalSize = fs.statSync(logoOriginal).size;
        const newSize = fs.statSync(logoOpt).size;
        console.log(`Logo optimized: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB`);
    }

    console.log('Done!');
}

optimize().catch(console.error);
