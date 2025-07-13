require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Validate required environment variables
const requiredEnvVars = {
  BUCKET_NAME: process.env.BUCKET_NAME,
  BUCKET_REGION: process.env.BUCKET_REGION,
  ACCESS_KEY: process.env.ACCESS_KEY,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  BASE_URL: process.env.BASE_URL
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Debug: Log non-sensitive configuration
console.log('Environment Configuration:', {
  bucketName: process.env.BUCKET_NAME,
  region: process.env.BUCKET_REGION,
  baseUrl: process.env.BASE_URL,
  port: process.env.PORT
});

// Import routes
const productRoutes = require('./routes/products');
const announcementRoutes = require('./routes/announcements');
const adminAuthRoutes = require('./routes/adminAuth');
const newsletterRoutes = require('./routes/newsletter');
const offerRoutes = require('./routes/offers');
const uploadRoutes = require('./routes/upload');
const { verifyToken, isAdmin } = require('./middleware/authMiddleware');

const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
console.log('=== CORS CONFIGURATION DEBUG ===');
console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Final CORS origin:', process.env.FRONTEND_URL || 'http://localhost:3000');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request Headers:', {
    'user-agent': req.headers['user-agent'],
    'accept': req.headers.accept,
    'content-type': req.headers['content-type']
  });
  next();
});
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Setting up routes...');

// Public routes
app.use('/api/admin', adminAuthRoutes);

// Mixed public/protected routes
app.use('/api/products', productRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Protected routes
app.use('/api/upload', verifyToken, isAdmin, uploadRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// CORS test route for debugging
app.get('/api/cors-test', (req, res) => {
  console.log('=== CORS TEST ROUTE CALLED ===');
  console.log('Request Origin:', req.headers.origin);
  console.log('Expected Origin:', process.env.FRONTEND_URL);
  
  res.json({ 
    message: 'CORS test successful',
    requestOrigin: req.headers.origin,
    expectedOrigin: process.env.FRONTEND_URL,
    corsConfigured: !!process.env.FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  res.status(500).json({ 
    message: 'Something went wrong!',
    details: err.message
  });
});

// Start server and connect to database
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB first
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 