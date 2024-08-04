/**
 * @fileoverview
 * Service worker script for handling background synchronization of video uploads.
 * It listens for sync events and uploads the video stored in IndexedDB when triggered.
 */

importScripts('database-handler.js');

/**
 * @type {IndexedDBHandler}
 * @description An instance of IndexedDBHandler used for handling video storage operations.
 */
const dbHandler = new IndexedDBHandler();

/**
 * Handles sync events. Specifically, it listens for the 'videoUpload' tag and triggers
 * the uploadVideo function to handle video uploads.
 * 
 * @event
 * @param {Event} event - The sync event.
 * @listens self#sync - Runs when a sync event is triggered.
 */
self.addEventListener('sync', function(event) {
    if (event.tag === 'videoUpload') {
        event.waitUntil(uploadVideo());
    }
});

/**
 * Uploads the video stored in IndexedDB to the server.
 * Retrieves the video blob URL from IndexedDB, fetches the video data,
 * and then uploads it to the server.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the upload is complete.
 * @throws {Error} Throws an error if the video upload fails.
 */
async function uploadVideo() {
    try {
        /**
         * @type {string|null}
         * @description The URL of the video blob retrieved from IndexedDB.
         */
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
