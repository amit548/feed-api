const register = (req, res, next) => {
  res.status(200).json({ message: 'Hello' });
};

const login = (req, res, next) => {
  res.status(200).json({ message: 'Hello' });
};

module.exports = { register, login };
