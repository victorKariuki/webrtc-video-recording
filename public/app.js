/**
 * @fileoverview
 * This script handles the initialization of video recording functionalities on the page.
 * It sets up event listeners for starting, stopping, pausing, resuming, and resetting the video recording.
 */

/**
 * Initializes the video recording functionality.
 * This function sets up the necessary DOM elements and event listeners to control the video recording.
 * 
 * @function
 * @listens document#DOMContentLoaded - Runs when the HTML document has been completely loaded and parsed.
 */
document.addEventListener("DOMContentLoaded", () => {
    /**
     * @type {HTMLVideoElement}
     * @description The video element used for recording video.
     */
    const videoElement = document.getElementById("video");

    /**
     * @type {HTMLElement}
     * @description The element used to display the timer during recording.
     */
    const timerDisplay = document.getElementById("timer");

    /**
     * @type {IndexedDBHandler}
     * @description An instance of IndexedDBHandler used for handling database operations.
     */
    const dbHandler = new IndexedDBHandler();

    /**
     * @type {VideoRecorder}
     * @description An instance of VideoRecorder used to manage the video recording process.
     */
    const videoRecorder = new VideoRecorder(videoElement, timerDisplay, dbHandler);

    /**
     * @function
     * @description Starts the video recording when the corresponding button is clicked.
     * @listens HTMLButtonElement#click - Listens for click events on the start recording button.
     */
    document.getElementById("startRecord").addEventListener("click", () => videoRecorder.start());

    /**
     * @function
     * @description Stops the video recording when the corresponding button is clicked.
     * @listens HTMLButtonElement#click - Listens for click events on the stop recording button.
     */
    document.getElementById("stopRecord").addEventListener("click", () => videoRecorder.stop());

    /**
     * @function
     * @description Pauses the video recording when the corresponding button is clicked.
     * @listens HTMLButtonElement#click - Listens for click events on the pause recording button.
     */
    document.getElementById("pauseRecord").addEventListener("click", () => videoRecorder.pause());

    /**
     * @function
     * @description Resumes the video recording when the corresponding button is clicked.
     * @listens HTMLButtonElement#click - Listens for click events on the resume recording button.
     */
    document.getElementById("resumeRecord").addEventListener("click", () => videoRecorder.resume());

    /**
     * @function
     * @description Resets the video recording when the corresponding button is clicked.
     * @listens HTMLButtonElement#click - Listens for click events on the reset recording button.
     */
    document.getElementById("resetRecord").addEventListener("click", () => videoRecorder.reset());
});
