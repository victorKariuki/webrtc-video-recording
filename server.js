/**
 * @fileoverview
 * A simple Express server for handling video uploads.
 * Uses multer for file handling and serves static files from the 'public' directory and JSDoc documentation from the 'docs' directory.
 */

const express = require('express');
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up storage for multer
/**
 * @constant {multer.StorageEngine}
 * @description Configuration for multer to handle file uploads.
 */
const storage = multer.diskStorage({
    /**
     * Determines the destination folder for uploaded files.
     * @param {express.Request} req - The request object.
     * @param {Express.Multer.File} file - The file being uploaded.
     * @param {multer.FileCallback} cb - Callback function to indicate the destination.
     */
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    /**
     * Determines the filename for the uploaded file.
     * @param {express.Request} req - The request object.
     * @param {Express.Multer.File} file - The file being uploaded.
     * @param {multer.FileCallback} cb - Callback function to indicate the filename.
     */
    filename: (req, file, cb) => {
        const ext = mime.extension(file.mimetype);
        cb(null, `${Date.now()}-${file.originalname}.${ext}`);
    }
});

/**
 * @constant {multer.Multer}
 * @description Multer instance for handling file uploads.
 */
const upload = multer({ storage });

// Serve the frontend files
/**
 * Middleware to serve static files from the 'public' directory.
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Middleware to serve JSDoc documentation from the 'docs' directory.
 */
app.use('/docs', express.static(path.join(__dirname, 'docs')));

/**
 * Handles video upload requests.
 * @route POST /upload
 * @param {express.Request} req - The request object containing the file.
 * @param {express.Response} res - The response object.
 * @returns {void}
 */
app.post('/upload', upload.single('video'), (req, res) => {
    res.send('Video uploaded successfully!');
});

/**
 * Starts the server and listens for incoming requests.
 * @function
 * @param {number} PORT - The port on which the server will listen.
 * @returns {void}
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
