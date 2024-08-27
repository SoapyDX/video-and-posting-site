const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const User = require('./models/User');
const Post = require('./models/Post');
const Video = require('./models/Video');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/video-upload-site', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/video-upload-site' }),
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        req.session.user = user;
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error registering new user.');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await user.comparePassword(password)) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.status(400).send('Invalid credentials.');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to upload videos.');
    }

    const video = new Video({ userId: req.session.user._id, filename: req.file.filename });
    await video.save();
    res.redirect('/');
});

app.get('/videos', async (req, res) => {
    const videos = await Video.find().populate('userId');
    res.json(videos);
});

app.post('/post', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to make a post.');
    }

    const post = new Post({ userId: req.session.user._id, content: req.body.content });
    await post.save();
    res.redirect('/');
});

app.get('/posts', async (req, res) => {
    const posts = await Post.find().populate('userId');
    res.json(posts);
});

app.get('/', (req, res) => {
    const isAdmin = req.session.user && req.session.user.isAdmin;
    res.render('index', { isAdmin });
});

// Get current user info
app.get('/current-user', (req, res) => {
    if (req.session.user) {
        res.json({
            username: req.session.user.username,
            isAdmin: req.session.user.isAdmin || false
        });
    } else {
        res.json({
            username: null,
            isAdmin: false
        });
    }
});



app.post('/delete-video/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).send('You must be an admin to delete videos.');
    }

    try {
        const videoId = req.params.id;
        const video = await Video.findById(videoId);
        if (video) {
            fs.unlinkSync(path.join(__dirname, 'uploads', video.filename));
            await Video.findByIdAndDelete(videoId); // Correct method for deletion
        }
        res.status(200).send('Video deleted successfully.');
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).send('Error deleting video.');
    }
});

app.post('/delete-post/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).send('You must be an admin to delete posts.');
    }

    try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).send('Post deleted successfully.');
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Error deleting post.');
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
