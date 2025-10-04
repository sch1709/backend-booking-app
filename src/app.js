const express = require('express');
const helmet = require('helmet');
const routes = require('./routes/index');
const { cors } = require('./middlewares');

const app = express();

app.use(cors);
app.use(helmet());
app.use(express.json());
app.use('/api', routes);

module.exports = app;