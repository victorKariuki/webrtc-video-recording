// app.js
document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("video");
    const timerDisplay = document.getElementById("timer");
    const dbHandler = new IndexedDBHandler();
    const videoRecorder = new VideoRecorder(videoElement, timerDisplay, dbHandler);

    document.getElementById("startRecord").addEventListener("click", () => videoRecorder.start());
    document.getElementById("stopRecord").addEventListener("click", () => videoRecorder.stop());
    document.getElementById("pauseRecord").addEventListener("click", () => videoRecorder.pause());
    document.getElementById("resumeRecord").addEventListener("click", () => videoRecorder.resume());
    document.getElementById("resetRecord").addEventListener("click", () => videoRecorder.reset());
});
