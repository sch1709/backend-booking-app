const express = require('express');
const usersRoutes = require('./users.routes');
const ordersRoutes = require('./orders.routes');
const servicesRoutes = require('./services.routes');
const customersRoutes = require('./customers.routes');
const authRoutes = require('./auth.routes');
const myServicesRoutes = require('./myservices.routes');

const router = express.Router();

// Test route to verify routing is working
router.get('/test', (req, res) => {
  res.json({ message: 'API routes are working!' });
});

router.use('/users', usersRoutes);
router.use('/orders', ordersRoutes);
router.use('/services', servicesRoutes);
router.use('/customers', customersRoutes);
router.use('/auth', authRoutes);
router.use('/my-services', myServicesRoutes);

module.exports = router;