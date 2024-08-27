const express = require('express');
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video'); // Assuming you have a Video model
const authMiddleware = require('../middleware/auth'); // Authentication middleware

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload video
router.post('/upload', authMiddleware, upload.single('video'), async (req, res) => {
    try {
        const video = new Video({
            filename: req.file.filename,
            userId: req.session.user._id,
        });
        await video.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error uploading video');
    }
});

// Get videos
router.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find().populate('userId');
        res.json(videos);
    } catch (error) {
        res.status(500).send('Error fetching videos');
    }
});

// Delete video
router.post('/delete-video/:id', authMiddleware, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (req.session.user.isAdmin) {
            await video.remove();
            res.send('Video deleted');
        } else {
            res.status(403).send('Unauthorized');
        }
    } catch (error) {
        res.status(500).send('Error deleting video');
    }
});

module.exports = router;
