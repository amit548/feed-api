const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const Post = require('../models/post');

const getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 15;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      if (!posts) {
        const error = new Error('No post(s) found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ posts, totalItems });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const getPost = (req, res, next) => {
  const { postId } = req.params;
  if (!mongoose.isValidObjectId(postId)) {
    const error = new Error('Post ID is not valid.');
    error.statusCode = 404;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(post);
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation error.');
    error.body = errors.array();
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  const creator = req.user.userId;
  if (!req.file) {
    const error = new Error('Please add image.');
    error.statusCode = 422;
    throw error;
  }
  const imagePath = req.file.path;
  const post = Post({ title, content, imagePath, creator });
  let createdPost;
  post
    .save()
    .then(result => {
      createdPost = result;
      return User.findById(req.user.userId);
    })
    .then(user => {
      user.posts.push(createdPost._id);
      return user.save();
    })
    .then(() => res.status(201).json(createdPost))
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const updatePost = (req, res, next) => {
  const { postId } = req.params;
  if (!mongoose.isValidObjectId(postId)) {
    const error = new Error('Post ID is not valid.');
    error.statusCode = 404;
    throw error;
  }
  const { title, content } = req.body;
  let { imagePath } = req.body;
  if (req.file) {
    imagePath = req.file.path;
  }
  const creator = req.user.userId;
  if (!imagePath) {
    const error = new Error('No image picked.');
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not find.');
        error.statusCode = 404;
        throw error;
      }
      if (imagePath !== post.imagePath) {
        const imageLocation = path.join(__dirname, '..', post.imagePath);
        clearFile(imageLocation);
      }
      post.title = title;
      post.content = content;
      post.imagePath = imagePath;
      post.creator = creator;
      return post.save();
    })
    .then(updatedPost => {
      if (!updatedPost) {
        const error = new Error('Post update failed.');
        error.statusCode = 422;
        throw error;
      }
      res.status(200).json(updatedPost);
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const deletePost = (req, res, next) => {
  const { postId } = req.params;
  if (!mongoose.isValidObjectId(postId)) {
    const error = new Error('Post ID is not valid.');
    error.statusCode = 404;
    throw error;
  }
  User.findById(req.user.userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      user.posts.pull(postId);
      return user.save();
    })
    .then(() => Post.findById(postId))
    .then(post => {
      const imageLocation = path.join(__dirname, '..', post.imagePath);
      clearFile(imageLocation);
      return Post.deleteOne(post);
    })
    .then(() => Post.find())
    .then(posts => {
      if (!posts) {
        const error = new Error('No post found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(posts);
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearFile = filePath => {
  fs.unlink(filePath, err => {
    if (err) {
      const error = new Error('File delete failed.');
      error.statusCode = 500;
      throw error;
    }
  });
};

module.exports = { getPosts, getPost, createPost, updatePost, deletePost };
