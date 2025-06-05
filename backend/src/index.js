require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { S3Client } = require("@aws-sdk/client-s3");
const connectDB = require('./config/database');

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

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  res.status(500).json({ message: 'Something went wrong!' });
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