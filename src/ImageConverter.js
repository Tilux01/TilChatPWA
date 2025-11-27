export function reduceImageQualityToBase64(file, quality = 0.7, maxWidth = null) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Please select a valid image file'));
            return;
        }

        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let width = img.width;
            let height = img.height;
            
            if (maxWidth && img.width > maxWidth) {
                const ratio = maxWidth / img.width;
                width = maxWidth;
                height = Math.round(img.height * ratio);
            }
            canvas.width = width;
            canvas.height = height;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            try {
                const base64 = canvas.toDataURL('image/jpeg', quality);
                resolve({
                    base64: base64,
                    width: width,
                    height: height,
                    originalSize: file.size,
                    reducedSize: calculateBase64Size(base64),
                    quality: quality
                });
            } catch (error) {
                reject(new Error('Failed to convert image to base64: ' + error.message));
            }
        };
        
        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
}
function calculateBase64Size(base64String) {
    const base64 = base64String.split(',')[1];
    return Math.round((base64.length * 3) / 4);
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}