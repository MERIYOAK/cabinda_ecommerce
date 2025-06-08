const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();

// Validate required environment variables
const requiredEnvVars = {
  BUCKET_NAME: process.env.BUCKET_NAME,
  BUCKET_REGION: process.env.BUCKET_REGION,
  ACCESS_KEY: process.env.ACCESS_KEY,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY
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
console.log('S3 Configuration:', {
  bucketName: process.env.BUCKET_NAME,
  region: process.env.BUCKET_REGION
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// Initialize S3 client with explicit configuration
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

// Upload endpoint
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const bucketName = process.env.BUCKET_NAME;
    
    // Additional validation
    if (!bucketName) {
      throw new Error('BUCKET_NAME environment variable is not configured');
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Debug: Log file information
    console.log('Uploading file:', {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    // Create upload parameters with explicit bucket name
    const uploadParams = {
      Bucket: bucketName,
      Key: `products/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    // Debug: Log upload parameters (excluding file buffer)
    console.log('Upload params:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType
    });

    const command = new PutObjectCommand(uploadParams);
    const uploadResult = await s3Client.send(command);

    // Debug: Log upload result
    console.log('Upload successful:', uploadResult);

    // Construct the S3 URL using the bucket name and region
    const imageUrl = `https://${bucketName}.s3.${process.env.BUCKET_REGION}.amazonaws.com/products/${fileName}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading to S3:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Send detailed error response
    res.status(500).json({
      message: 'Error uploading file',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

module.exports = router; 