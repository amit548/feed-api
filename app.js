const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');

const userRoute = require('./routes/user');

dotEnv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'http://localhost:27017/feed';

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/user', userRoute);

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
