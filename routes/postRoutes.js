const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/post', authMiddleware, async (req, res) => {
    try {
        const post = new Post({
            content: req.body.content,
            userId: req.session.user._id,
        });
        await post.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error creating post');
    }
});

// Get posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('userId');
        res.json(posts);
    } catch (error) {
        res.status(500).send('Error fetching posts');
    }
});

// Delete post
router.post('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (req.session.user.isAdmin) {
            await post.remove();
            res.send('Post deleted');
        } else {
            res.status(403).send('Unauthorized');
        }
    } catch (error) {
        res.status(500).send('Error deleting post');
    }
});

module.exports = router;
