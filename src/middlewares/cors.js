const cors = require('cors');

// CORS configuration
const getAllowedOrigins = () => {
  const baseOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173', // Vite default port
    'http://localhost:5174', // Alternative Vite port
    'http://localhost:4200', // Angular default port
    'http://localhost:8080', // Vue/Other frameworks
  ];

  // Add production origins
  if (process.env.NODE_ENV === 'production') {
    // Add specific frontend URL if provided
    if (process.env.FRONTEND_URL) {
      baseOrigins.push(process.env.FRONTEND_URL);
    }
    
    // Allow common deployment platforms
    baseOrigins.push(
      /\.railway\.app$/, // Allow all Railway domains
      /\.vercel\.app$/, // Allow Vercel deployments
      /\.netlify\.app$/, // Allow Netlify deployments
      /\.surge\.sh$/, // Allow Surge deployments
      /\.github\.io$/ // Allow GitHub Pages
    );
  }

  return baseOrigins.filter(Boolean); // Remove undefined values
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches regex patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

module.exports = cors(corsOptions);
