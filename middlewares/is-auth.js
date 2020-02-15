const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    const error = new Error('Toke not provided.');
    error.statusCode = 401;
    next(error);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      const error = new Error('Toke not valid.');
      error.statusCode = 403;
      next(error);
    }
    req.user = user;
    next();
  });
};

module.exports = isAuth;
