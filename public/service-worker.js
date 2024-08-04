// service-worker.js
importScripts('database-handler.js');

const dbHandler = new IndexedDBHandler();

self.addEventListener('sync', function(event) {
    if (event.tag === 'videoUpload') {
        event.waitUntil(uploadVideo());
    }
});

async function uploadVideo() {
    try {
        const videoBlobUrl = await dbHandler.getVideo();
        if (videoBlobUrl) {
            const response = await fetch(videoBlobUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('video', blob, 'recorded-video.webm');

            await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            console.log('Video uploaded successfully');
            await dbHandler.deleteVideo();
        }
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}
