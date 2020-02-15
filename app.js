const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotEnv = require('dotenv');

const userRoute = require('./routes/user');

dotEnv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/feed', userRoute);

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
