const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middlewares/is-auth');
const postController = require('../controllers/post');

const router = express.Router();

router.get('/posts', isAuth, postController.getPosts);
router.get('/post/:postId', postController.getPost);
router.post(
  '/post',
  [
    body('title')
      .trim()
      .isLength({ min: 6 }),
    body('content')
      .trim()
      .isLength({ min: 6 })
  ],
  isAuth,
  postController.createPost
);
router.put(
  '/post/:postId',
  [
    body('title')
      .trim()
      .isLength({ min: 6 }),
    body('content')
      .trim()
      .isLength({ min: 6 })
  ],
  isAuth,
  postController.updatePost
);
router.delete('/post/:postId', isAuth, postController.deletePost);

module.exports = router;
