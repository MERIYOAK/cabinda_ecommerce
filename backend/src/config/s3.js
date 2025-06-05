const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadToS3 = async (file, fileName) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `products/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

const deleteFromS3 = async (imageUrl) => {
  try {
    const key = imageUrl.split('/').slice(-2).join('/'); // Get the key from URL (products/filename)
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
};

module.exports = { uploadToS3, deleteFromS3 }; 