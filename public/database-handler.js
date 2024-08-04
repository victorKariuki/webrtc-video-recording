// Interface
class DatabaseHandler {
    async openDB() {
        throw new Error('Method openDB() must be implemented.');
    }

    async saveVideo(blobUrl) {
        throw new Error('Method saveVideo() must be implemented.');
    }

    async getVideo() {
        throw new Error('Method getVideo() must be implemented.');
    }

    async deleteVideo() {
        throw new Error('Method deleteVideo() must be implemented.');
    }
}

// database-handler.js
class IndexedDBHandler extends DatabaseHandler {
    constructor() {
        super();
        this.DB_NAME = 'videoDB';
        this.DB_VERSION = 1;
        this.STORE_NAME = 'videos';
    }

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
