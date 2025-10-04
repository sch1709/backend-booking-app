const corsMiddleware = require('./cors');
const { auth, admin, staff } = require('./auth');

module.exports = {
  cors: corsMiddleware,
  auth,
  admin,
  staff
};
