// API Configuration for both development and production
const getApiUrl = () => {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }
  
  // Production environment
  const productionUrl = process.env.REACT_APP_API_URL;
  
  // Log the API URL for debugging
  console.log('Environment:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('Final API URL:', productionUrl);
  
  if (!productionUrl) {
    console.error('❌ REACT_APP_API_URL is not set in production!');
    console.error('Please set the environment variable in your Vercel dashboard.');
    return 'https://your-backend-render-url.onrender.com'; // Fallback
  }
  
  return productionUrl;
};

const API_URL = getApiUrl();

// Validate API URL
if (!API_URL || API_URL.includes('your-backend-url') || API_URL.includes('your-backend-render-url')) {
  console.error('❌ API_URL is not configured properly!');
  console.error('Current API_URL:', API_URL);
  console.error('Please set REACT_APP_API_URL environment variable with your actual backend URL.');
}

export default API_URL; 