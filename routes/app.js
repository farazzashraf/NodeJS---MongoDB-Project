
const express = require('express');
const mongodb = require('mongodb');
const multer = require('multer');

const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'user-image');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storageConfig })

const db = require('../data/database');

const ObjectId = mongodb.ObjectId;

const router = express.Router();


router.get('/', function (req, res) {
    res.redirect('/posts')
});

router.get('/posts', async function (req, res) {
    const posts = await db.getDb().collection('posts').find({}, { title: 1, by: 1, imagePath: 1 }).toArray();
    res.render('posts-list', { posts: posts });
});

router.get('/create-post', function (req, res) {
    res.render('create-post');
});

router.post('/posts', upload.single('file'), async function (req, res) {
    const uploadedImageFile = req.file;
    const newPost = {
        title: req.body.title,
        by: req.body.by,
        content: req.body.content,
        imagePath: uploadedImageFile.path,
        date: new Date()
    };

    const result = await db.getDb().collection('posts').insertOne(newPost);
    res.redirect('/posts');
});

router.get('/posts/:id', async function (req, res, next) {
    let postId = req.params.id;
    const post = await db.getDb().collection('posts').findOne({ _id: new ObjectId(postId) }, { imagePath: 1 });

    try {
        postId = new ObjectId(postId);
    } catch (error) {
        return next(error)
    }

    post.humanReadableDate = post.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    post.date = post.date.toISOString()

    res.render('post-detail', { post: post });
});

router.get('/posts/:id/edit', async function (req, res) {
    const uploadedImageFile = req.file;
    const postId = req.params.id;
    const post = await db.getDb().collection('posts').findOne({ _id: new ObjectId(postId) }, {});

    if (!post) {
        return res.status(404).render('404');
    }

    res.render('update-post', { post: post });
});


router.post('/posts/:id/edit', upload.single('file'), async function (req, res) {
    const uploadedImageFile = req.file;
    const postId = new ObjectId(req.params.id);
    const result = await db.getDb().collection('posts').updateOne({ _id: postId }, {
        $set: {
            title: req.body.title,
            by: req.body.by,
            content: req.body.content,
            imagePath: uploadedImageFile.path,
            date: new Date()
        },
    });

    res.redirect('/posts');
});

router.post('/posts/:id/delete', async function (req, res) {
    const postId = new ObjectId(req.params.id);
    const result = await db.getDb().collection('posts').deleteOne({ _id: postId });
    res.redirect('/posts');
});

module.exports = router;