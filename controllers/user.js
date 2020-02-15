const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'someaccesstokenkey';

const register = (req, res, next) => {
  const errors = validationResult(req);
  const { name, email, password } = req.body;
  if (!errors.isEmpty()) {
    const error = new Error('Validation error.');
    error.body = errors.array();
    error.statusCode = 422;
    throw error;
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => hashedPassword)
    .then(hashedPassword => {
      const user = new User({ name, email, password: hashedPassword });
      return user.save();
    })
    .then(createdUser => res.status(201).json(createdUser))
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  let userDoc;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error('Email not found.');
        error.statusCode = 422;
        throw error;
      }
      return user;
    })
    .then(user => {
      userDoc = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isMatched => {
      if (!isMatched) {
        const error = new Error('Password not matched.');
        error.statusCode = 422;
        throw error;
      }
    })
    .then(() => {
      const userPayload = {
        email: userDoc.email,
        userId: userDoc._id
      };
      return jwt.sign(userPayload, ACCESS_TOKEN, { expiresIn: '1h' });
    })
    .then(accessToken => res.json({ userId: userDoc._id, accessToken }))
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports = { register, login };
