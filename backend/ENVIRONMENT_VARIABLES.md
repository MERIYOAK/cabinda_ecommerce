# Backend Environment Variables

This document lists all the environment variables required for the backend to function properly.

## Required Environment Variables

### Server Configuration
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

### Database
- `MONGODB_URI` - MongoDB connection string

### AWS S3 Configuration
- `BUCKET_NAME` - S3 bucket name for file uploads
- `BUCKET_REGION` - AWS region for S3 bucket
- `ACCESS_KEY` - AWS access key ID
- `SECRET_ACCESS_KEY` - AWS secret access key
- `BASE_URL` - Base URL for the application

### JWT Configuration
- `JWT_SECRET` - Secret key for JWT token generation

### Admin Authentication
- `ADMIN_EMAIL` - Admin email address
- `ADMIN_EMAIL_PASSWORD` - Admin password

### WhatsApp Configuration
- `WHATSAPP_NUMBER` - WhatsApp number for customer inquiries

### Email Configuration
- `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (e.g., 587)
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password

### CORS Configuration (NEW)
- `LOCALHOST_URL` - Local development frontend URL (default: http://localhost:3000)
- `FRONTEND_URL` - Production frontend URL (e.g., https://cabinda-ecommerce.vercel.app)
- `ADDITIONAL_FRONTEND_URL` - Additional frontend URL if needed

## Example .env file

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/retail-shop

# AWS S3 Configuration
BUCKET_NAME=your-s3-bucket-name
BUCKET_REGION=your-aws-region
ACCESS_KEY=your-aws-access-key
SECRET_ACCESS_KEY=your-aws-secret-key
BASE_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Admin Authentication
ADMIN_EMAIL=admin@example.com
ADMIN_EMAIL_PASSWORD=your-secure-admin-password

# WhatsApp Configuration
WHATSAPP_NUMBER=244922706107

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# CORS Configuration
LOCALHOST_URL=http://localhost:3000
FRONTEND_URL=https://cabinda-ecommerce.vercel.app
ADDITIONAL_FRONTEND_URL=https://your-additional-frontend-url.com
```

## Setting Environment Variables in Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add each environment variable with its corresponding value

## CORS Configuration

The backend now supports multiple frontend URLs through environment variables:

- `LOCALHOST_URL` - For local development
- `FRONTEND_URL` - For your main production frontend
- `ADDITIONAL_FRONTEND_URL` - For any additional frontend URLs

This allows you to easily manage different environments without hardcoding URLs in the code. 