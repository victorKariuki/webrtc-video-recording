// server.js
const express = require('express');
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = mime.extension(file.mimetype);
        cb(null, `${Date.now()}-${file.originalname}.${ext}`);
    }
});

const upload = multer({ storage });

// Serve the frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Handle video upload
app.post('/upload', upload.single('video'), (req, res) => {
    res.send('Video uploaded successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
