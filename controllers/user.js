const getPosts = (req, res, next) => {
  res.status(200).json({ message: 'Hello' });
};

module.exports = { getPosts };
