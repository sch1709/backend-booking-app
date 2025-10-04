const cors = require('cors');

// CORS configuration
const getAllowedOrigins = () => {
  const baseOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173', // Vite default port
    'http://localhost:4200', // Angular default port
  ];

  // Add production origins
  if (process.env.NODE_ENV === 'production') {
    baseOrigins.push(
      process.env.FRONTEND_URL, // Add your frontend URL as env variable
      /\.railway\.app$/, // Allow all Railway domains
      /\.vercel\.app$/, // Allow Vercel deployments
      /\.netlify\.app$/ // Allow Netlify deployments
    );
  }

  return baseOrigins.filter(Boolean); // Remove undefined values
};

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? getAllowedOrigins()
    : true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

module.exports = cors(corsOptions);
