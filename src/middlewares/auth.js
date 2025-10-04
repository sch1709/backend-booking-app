const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid token.',
      details: error.message
    });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Middleware to check if user is admin or staff
const staffMiddleware = (req, res, next) => {
  if (!['admin', 'staff', 'superuser'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Staff role required.'
    });
  }
  next();
};

module.exports = {
  auth: authMiddleware,
  admin: adminMiddleware,
  staff: staffMiddleware
};
