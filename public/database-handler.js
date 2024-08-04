/**
 * @interface
 * @description Abstract class defining the structure for database handling operations.
 */
class DatabaseHandler {
    /**
     * Opens a connection to the database.
     * @throws {Error} Throws an error if this method is not implemented by a subclass.
     * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
     */
    async openDB() {
        throw new Error('Method openDB() must be implemented.');
    }

    /**
     * Saves a video to the database.
     * @param {string} blobUrl - The URL of the video blob to be saved.
     * @throws {Error} Throws an error if this method is not implemented by a subclass.
     * @returns {Promise<void>} A promise that resolves when the video is saved.
     */
    async saveVideo(blobUrl) {
        throw new Error('Method saveVideo() must be implemented.');
    }

    /**
     * Retrieves a video from the database.
     * @throws {Error} Throws an error if this method is not implemented by a subclass.
     * @returns {Promise<string|null>} A promise that resolves with the video blob URL or null if no video is found.
     */
    async getVideo() {
        throw new Error('Method getVideo() must be implemented.');
    }

    /**
     * Deletes a video from the database.
     * @throws {Error} Throws an error if this method is not implemented by a subclass.
     * @returns {Promise<void>} A promise that resolves when the video is deleted.
     */
    async deleteVideo() {
        throw new Error('Method deleteVideo() must be implemented.');
    }
}

/**
 * @class
 * @extends DatabaseHandler
 * @description Implementation of DatabaseHandler using IndexedDB for video storage.
 */
class IndexedDBHandler extends DatabaseHandler {
    /**
     * Creates an instance of IndexedDBHandler.
     */
    constructor() {
        super();
        /** @type {string} The name of the database. */
        this.DB_NAME = 'videoDB';
        /** @type {number} The version of the database. */
        this.DB_VERSION = 1;
        /** @type {string} The name of the object store. */
        this.STORE_NAME = 'videos';
    }

    /**
     * Opens a connection to the IndexedDB database.
     * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
     */
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Saves a video to the IndexedDB database.
     * @param {string} blobUrl - The URL of the video blob to be saved.
     * @returns {Promise<void>} A promise that resolves when the video is saved.
     */
    async saveVideo(blobUrl) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put({ id: 1, blobUrl });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieves a video from the IndexedDB database.
     * @returns {Promise<string|null>} A promise that resolves with the video blob URL or null if no video is found.
     */
    async getVideo() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(1);

            request.onsuccess = () => resolve(request.result ? request.result.blobUrl : null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Deletes a video from the IndexedDB database.
     * @returns {Promise<void>} A promise that resolves when the video is deleted.
     */
    async deleteVideo() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(1);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
