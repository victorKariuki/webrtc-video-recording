/**
 * @interface
 * @description Abstract class defining the basic operations for media handling.
 */
class MediaHandler {
    /**
     * Starts the media recording.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the media recording starts.
     */
    async start() {}

    /**
     * Stops the media recording.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the media recording stops.
     */
    async stop() {}

    /**
     * Pauses the media recording.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the media recording is paused.
     */
    async pause() {}

    /**
     * Resumes the media recording.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the media recording resumes.
     */
    async resume() {}

    /**
     * Resets the media recording.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the media recording is reset.
     */
    async reset() {}
}

/**
 * @class
 * @extends MediaHandler
 * @description A class for recording video using MediaRecorder API and handling synchronization with IndexedDB and server.
 */
class VideoRecorder extends MediaHandler {
    /**
     * Creates an instance of VideoRecorder.
     * @param {HTMLVideoElement} videoElement - The video element to display the video stream.
     * @param {HTMLElement} timerDisplay - The element to display the recording timer.
     * @param {DatabaseHandler} dbHandler - An instance of DatabaseHandler for storing and retrieving video data.
     */
    constructor(videoElement, timerDisplay, dbHandler) {
        super();
        /** @type {HTMLVideoElement} The video element to display the video stream. */
        this.video = videoElement;
        /** @type {HTMLElement} The element to display the recording timer. */
        this.timerDisplay = timerDisplay;
        /** @type {DatabaseHandler} An instance of DatabaseHandler for storing and retrieving video data. */
        this.dbHandler = dbHandler;
        /** @type {?MediaRecorder} The MediaRecorder instance for recording video. */
        this.mediaRecorder = null;
        /** @type {Array<Blob>} Array to store recorded video chunks. */
        this.recordedChunks = [];
        /** @type {number} Seconds elapsed during recording. */
        this.seconds = 0;
        /** @type {?number} Timer interval ID for updating the recording timer. */
        this.timer = null;
        /** @type {boolean} Flag indicating if recording is paused. */
        this.isPaused = false;
        /** @type {boolean} Flag indicating if recording is reset. */
        this.isReset = false;
        this.init();
    }

    /**
     * Initializes the video recording by starting the video stream.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the video is initialized.
     */
    async init() {
        await this.startVideo();
    }

    /**
     * Starts the video stream and initializes the MediaRecorder.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the video stream and MediaRecorder are set up.
     * @throws {Error} Throws an error if accessing the camera fails.
     */
    async startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            this.video.srcObject = stream;
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) this.recordedChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                if (this.isReset) {
                    this.isReset = false;
                    this.recordedChunks = [];
                    return;
                }

                const blob = new Blob(this.recordedChunks, { type: "video/webm" });
                const blobUrl = URL.createObjectURL(blob);

                const formData = new FormData();
                formData.append("video", blob, "recorded-video.webm");

                if ("SyncManager" in window) {
                    try {
                        const registration = await navigator.serviceWorker.ready;
                        if ('sync' in registration) {
                            await registration.sync.register("videoUpload");
                            await this.dbHandler.saveVideo(blobUrl);
                            console.log("Sync registered and video saved");
                        } else {
                            console.warn("SyncManager is not supported in this browser.");
                            await fetch("/upload", { method: "POST", body: formData });
                        }
                    } catch (error) {
                        console.log("Sync registration or saving failed:", error);
                        await fetch("/upload", { method: "POST", body: formData });
                    }
                } else {
                    await fetch("/upload", { method: "POST", body: formData });
                }

                this.recordedChunks = [];
            };
        } catch (error) {
            console.error("Error accessing the camera: ", error);
        }
    }

    /**
     * Updates the recording timer display.
     * Increments the timer every second if recording is not paused.
     */
    updateTimer() {
        if (!this.isPaused) {
            this.seconds++;
            const mins = Math.floor(this.seconds / 60);
            const secs = this.seconds % 60;
            this.timerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
    }

    /**
     * Starts the recording process and initializes the timer.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the recording starts.
     */
    async start() {
        this.mediaRecorder.start();
        this.isPaused = false;
        this.seconds = 0;
        this.timerDisplay.textContent = "00:00";
        this.timer = setInterval(() => this.updateTimer(), 1000);
        console.log("Recording started");
    }

    /**
     * Stops the recording process and clears the timer.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the recording stops.
     */
    async stop() {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            this.mediaRecorder.stop();
        }
        clearInterval(this.timer);
        this.timerDisplay.textContent = "00:00";
        this.seconds = 0;
        this.isPaused = false;
        console.log("Recording stopped");
    }

    /**
     * Pauses the recording process.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the recording is paused.
     */
    async pause() {
        if (this.mediaRecorder.state === "recording") {
            this.mediaRecorder.pause();
            this.isPaused = true;
            console.log("Recording paused");
        }
    }

    /**
     * Resumes the recording process.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the recording resumes.
     */
    async resume() {
        if (this.mediaRecorder.state === "paused") {
            this.mediaRecorder.resume();
            this.isPaused = false;
            console.log("Recording resumed");
        }
    }

    /**
     * Resets the recording process, clearing recorded chunks and resetting timer.
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the recording is reset.
     */
    async reset() {
        this.isReset = true;
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            this.mediaRecorder.stop();
        }
        clearInterval(this.timer);
        this.timerDisplay.textContent = "00:00";
        this.seconds = 0;
        this.isPaused = false;
        console.log("Recording reset");
    }
}
