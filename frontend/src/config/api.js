// API Configuration for both development and production
const getApiUrl = () => {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }
  
  // Production environment
  // If you have a deployed backend, replace this with your backend URL
  const productionUrl = process.env.REACT_APP_API_URL || 'https://your-backend-url.vercel.app';
  
  // Log the API URL for debugging (remove in production)
  console.log('API URL:', productionUrl);
  
  return productionUrl;
};

const API_URL = getApiUrl();

// Validate API URL
if (!API_URL) {
  console.error('API_URL is not configured. Please set REACT_APP_API_URL environment variable.');
}

export default API_URL; 