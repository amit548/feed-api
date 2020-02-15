const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');

const userRoute = require('./routes/user');
const postRoute = require('./routes/post');
const fileUpload = require('./middlewares/file-uploader');

dotEnv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'http://localhost:27017/feed';

app.use(bodyParser.json());
app.use(fileUpload);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, GET, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'content-Type, Authorization');
  next();
});

app.use('/user', userRoute);
app.use('/feed', postRoute);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const body = error.body;
  res.status(status).json({
    message,
    body
  });
});

mongoose
  .connect(MONGODB_URI, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected.'))
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    )
  )
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
