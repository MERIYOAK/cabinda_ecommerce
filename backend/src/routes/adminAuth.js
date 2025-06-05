const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

// Debug route to verify it's registered
router.get('/test', (req, res) => {
  res.json({ message: 'Admin auth routes are working' });
});

console.log('Registering admin auth routes...');

// Admin login route
router.post('/login', (req, res, next) => {
  console.log('Login request received:', {
    body: { ...req.body, password: '***' },
    headers: req.headers
  });
  login(req, res, next);
});

module.exports = router; 