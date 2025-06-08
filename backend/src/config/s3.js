const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

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

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file, fileName) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `products/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    const imageUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/products/${fileName}`;
    return imageUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key
    };

    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete image');
  }
};

module.exports = { uploadToS3, deleteFromS3 }; 