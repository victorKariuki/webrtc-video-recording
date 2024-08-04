// Interface
class MediaHandler {
    async start() { }
    async stop() { }
    async pause() { }
    async resume() { }
    async reset() { }
}


// video-recorder.js
class VideoRecorder extends MediaHandler {
    constructor(videoElement, timerDisplay, dbHandler) {
        super();
        this.video = videoElement;
        this.timerDisplay = timerDisplay;
        this.dbHandler = dbHandler;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.seconds = 0;
        this.timer = null;
        this.isPaused = false;
        this.isReset = false;
        this.init();
    }

    async init() {
        await this.startVideo();
    }

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
                            // Fallback to traditional upload if SyncManager is not supported
                            await fetch("/upload", { method: "POST", body: formData });
                        }
                    } catch (error) {
                        console.log("Sync registration or saving failed:", error);
                        // Fallback to traditional upload if Sync registration fails
                        await fetch("/upload", { method: "POST", body: formData });
                    }
                } else {
                    // Fallback to traditional upload if SyncManager is not available
                    await fetch("/upload", { method: "POST", body: formData });
                }

                this.recordedChunks = [];
            };
        } catch (error) {
            console.error("Error accessing the camera: ", error);
        }
    }


    updateTimer() {
        if (!this.isPaused) {
            this.seconds++;
            const mins = Math.floor(this.seconds / 60);
            const secs = this.seconds % 60;
            this.timerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
    }

    async start() {
        this.mediaRecorder.start();
        this.isPaused = false;
        this.seconds = 0;
        this.timerDisplay.textContent = "00:00";
        this.timer = setInterval(() => this.updateTimer(), 1000);
        console.log("Recording started");
    }

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

    async pause() {
        if (this.mediaRecorder.state === "recording") {
            this.mediaRecorder.pause();
            this.isPaused = true;
            console.log("Recording paused");
        }
    }

    async resume() {
        if (this.mediaRecorder.state === "paused") {
            this.mediaRecorder.resume();
            this.isPaused = false;
            console.log("Recording resumed");
        }
    }

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
