const express = require('express');
const helmet = require('helmet');
const routes = require('./routes/index');
const { cors } = require('./middlewares');

const app = express();

app.use(cors);
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Booking App API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);

module.exports = app;