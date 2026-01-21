
/**
 * Compresses an image file directly in the browser using Canvas.
 * (复制自 MI70 项目，保持一致)
 * 
 * @param file - The original File object
 * @param maxWidth - Maximum width (default 1920)
 * @param quality - JPEG quality (0 to 1, default 0.8)
 * @returns Promise<File> - The compressed file
 */
export async function compressImage(file: File, maxWidth = 1024, quality = 0.7): Promise<File> {
    // If it's not an image, return original
    if (!file.type.startsWith('image/')) return file

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                // Calculate new dimensions
                let width = img.width
                let height = img.height

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width)
                    width = maxWidth
                }

                // If height is still too big (e.g. extremely tall panorama), constrain it too
                if (height > maxWidth) {
                    width = Math.round((width * maxWidth) / height)
                    height = maxWidth
                }

                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve(file) // Fallback to original if canvas fails
                    return
                }

                // 激进压缩策略：如果原图很大，直接降质
                let finalQuality = quality
                // 第一次粗略估算：如果尺寸仍较大，降低质量
                if (width * height > 1000 * 1000) {
                    finalQuality = Math.min(quality, 0.6)
                }

                ctx.drawImage(img, 0, 0, width, height)

                const toBlobPromise = (q: number) => new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', q))

                // 执行压缩并检查大小
                toBlobPromise(finalQuality).then(async (blob) => {
                    if (!blob) {
                        resolve(file)
                        return
                    }

                    // 如果压缩后依然超过 500KB，再次暴力压缩
                    if (blob.size > 500 * 1024) {
                        console.log('[Compression] Still too large, applying aggressive compression...')
                        const aggressiveBlob = await toBlobPromise(0.5)
                        if (aggressiveBlob && aggressiveBlob.size < blob.size) {
                            blob = aggressiveBlob
                        }
                    }

                    // Create new File from blob
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    })

                    console.log(`[Compression] ${file.name}: ${(file.size / 1024).toFixed(0)}KB -> ${(compressedFile.size / 1024).toFixed(0)}KB`)
                    resolve(compressedFile)
                })
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}
