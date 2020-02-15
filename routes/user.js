const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user');
const User = require('../models/user');

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 3 }),
    body('email')
      .trim()
      .isEmail()
      .custom((val, { req }) => {
        return User.findOne({ email: val }).then(user => {
          if (user) {
            return Promise.reject('Email already taken.');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 6 })
  ],
  userController.register
);
router.post('/login', userController.login);

module.exports = router;
