const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173', // Vite default port
    'http://localhost:4200', // Angular default port
    'https://your-frontend-domain.com' // Add your production domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

module.exports = cors(corsOptions);
