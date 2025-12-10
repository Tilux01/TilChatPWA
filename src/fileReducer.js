export function reduceMediaQualityToFile(file, quality = 0.7, maxWidth = null, videoBitrate = 1000000) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('Please select a valid file'));
            return;
        }

        // Handle images (process normally)
        if (file.type.startsWith('image/')) {
            reduceImageQuality(file, quality, maxWidth)
                .then(resolve)
                .catch(reject);
        }
        // Handle videos - return original file immediately with metadata
        else if (file.type.startsWith('video/')) {
            getVideoMetadata(file)
                .then(metadata => {
                    resolve({
                        file: file, // Return original file, no processing
                        width: metadata.width,
                        height: metadata.height,
                        originalSize: file.size,
                        reducedSize: file.size, // Same as original
                        duration: metadata.duration,
                        type: 'video',
                        note: 'Video compression disabled for performance'
                    });
                })
                .catch(reject);
        }
        else {
            reject(new Error('Please select a valid image or video file'));
        }
    });
}

// Fast video metadata extraction
function getVideoMetadata(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = function() {
            resolve({
                width: video.videoWidth,
                height: video.videoHeight,
                duration: video.duration
            });
            URL.revokeObjectURL(video.src);
        };
        
        video.onerror = function() {
            // Fallback: return default metadata
            resolve({
                width: 1920,
                height: 1080,
                duration: 0
            });
            URL.revokeObjectURL(video.src);
        };
        
        video.src = URL.createObjectURL(file);
    });
}

// Image compression function
function reduceImageQuality(file, quality, maxWidth) {
    return new Promise((resolve, reject) => {
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
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to convert image to blob'));
                        return;
                    }
                    
                    const reducedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    resolve({
                        file: reducedFile,
                        width: width,
                        height: height,
                        originalSize: file.size,
                        reducedSize: blob.size,
                        quality: quality,
                        type: 'image'
                    });
                }, 'image/jpeg', quality);
            } catch (error) {
                reject(new Error('Failed to reduce image quality: ' + error.message));
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

// Video compression function
function reduceVideoQuality(file, bitrate, maxWidth) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.preload = 'metadata';
        
        video.onloadedmetadata = function() {
            // Set up video dimensions
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            if (maxWidth && width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Create a media stream from canvas
            const stream = canvas.captureStream();
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: bitrate
            });
            
            const chunks = [];
            
            mediaRecorder.ondataavailable = function(e) {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };
            
            mediaRecorder.onstop = function() {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const reducedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webm"), {
                    type: 'video/webm',
                    lastModified: Date.now()
                });
                
                resolve({
                    file: reducedFile,
                    width: width,
                    height: height,
                    originalSize: file.size,
                    reducedSize: blob.size,
                    bitrate: bitrate,
                    type: 'video'
                });
            };
            
            mediaRecorder.onerror = function(e) {
                reject(new Error('MediaRecorder error: ' + e.error));
            };
            
            // Start recording when video plays
            video.oncanplay = function() {
                mediaRecorder.start();
                
                // Draw video frames to canvas
                function drawFrame() {
                    if (video.paused || video.ended) return;
                    
                    ctx.drawImage(video, 0, 0, width, height);
                    requestAnimationFrame(drawFrame);
                }
                
                video.play();
                drawFrame();
                
                // Stop after video duration
                setTimeout(() => {
                    mediaRecorder.stop();
                    video.pause();
                }, video.duration * 1000);
            };
            
            video.onerror = function() {
                reject(new Error('Failed to load video'));
            };
        };
        
        const reader = new FileReader();
        reader.onload = function(e) {
            video.src = e.target.result;
        };
        reader.onerror = function() {
            reject(new Error('Failed to read video file'));
        };
        reader.readAsDataURL(file);
    });
}

// Alternative simpler video compression (if MediaRecorder has issues)
function reduceVideoQualitySimple(file, maxWidth) {
    return new Promise((resolve, reject) => {
        // For simple case, just return the original file with modified dimensions info
        // In a real implementation, you'd use FFmpeg or a server-side solution
        const video = document.createElement('video');
        
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            if (maxWidth && width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = Math.round(height * ratio);
            }
            
            resolve({
                file: file, // Return original file (no compression)
                width: width,
                height: height,
                originalSize: file.size,
                reducedSize: file.size, // Same size since no compression
                type: 'video',
                note: 'Video compression requires server-side processing'
            });
        };
        
        video.onerror = function() {
            reject(new Error('Failed to load video'));
        };
        
        const reader = new FileReader();
        reader.onload = function(e) {
            video.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Helper function to format bytes
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}