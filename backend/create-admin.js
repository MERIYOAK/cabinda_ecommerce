const axios = require('axios');

const setupAdmin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/setup-admin');
    console.log('Admin created successfully:', response.data);
  } catch (error) {
    console.error('Error creating admin:', error.response?.data || error.message);
  }
};

setupAdmin(); 