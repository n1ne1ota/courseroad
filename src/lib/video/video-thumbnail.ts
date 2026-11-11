export const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Create a URL for the video file
        const url = URL.createObjectURL(file);
        video.src = url;

        // We need to set these to ensure the video can be processed without being added to DOM
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';

        // Load metadata to get dimensions and duration
        video.onloadedmetadata = () => {
            // Seek to 1 second or 25% of duration if short, to avoid black frames at start
            const seekTime = Math.min(1, video.duration * 0.25);
            video.currentTime = seekTime;
        };

        // When the frame is ready
        video.onseeked = () => {
            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                if (context) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 70% quality
                    resolve(dataUrl);
                } else {
                    reject(new Error('Failed to get canvas context'));
                }
            } catch (error) {
                reject(error);
            } finally {
                // Cleanup
                URL.revokeObjectURL(url);
                video.remove();
                canvas.remove();
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error loading video file'));
        };
    });
};

export const generateVideoThumbnailBlob = (file: File): Promise<{ blob: Blob; fileName: string; fileSize: number }> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Create a URL for the video file
        const url = URL.createObjectURL(file);
        video.src = url;

        // We need to set these to ensure the video can be processed without being added to DOM
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';

        // Load metadata to get dimensions and duration
        video.onloadedmetadata = () => {
            // Seek to 1 second or 25% of duration if short, to avoid black frames at start
            const seekTime = Math.min(1, video.duration * 0.25);
            video.currentTime = seekTime;
        };

        // When the frame is ready
        video.onseeked = () => {
            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                if (context) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(
                        blob => {
                            if (blob) {
                                const fileName = file.name.replace(/\.[^/.]+$/, '.jpg');
                                resolve({
                                    blob,
                                    fileName,
                                    fileSize: blob.size
                                });
                            } else {
                                reject(new Error('Failed to generate thumbnail blob'));
                            }
                        },
                        'image/jpeg',
                        0.7
                    );
                } else {
                    reject(new Error('Failed to get canvas context'));
                }
            } catch (error) {
                reject(error);
            } finally {
                // Cleanup
                URL.revokeObjectURL(url);
                video.remove();
                canvas.remove();
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error loading video file'));
        };
    });
};
