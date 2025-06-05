require('dotenv').config();
const axios = require('axios');

const timestamp = new Date().getTime();
const testEmail = `test.newsletter.${timestamp}@gmail.com`; // Using timestamp for unique email
const baseUrl = 'http://localhost:5000/api';

const testSubscription = async () => {
  try {
    console.log(`Testing subscription process with email: ${testEmail}\n`);

    // Step 1: Check initial status
    console.log('1. Checking initial subscription status...');
    const statusResponse = await axios.get(`${baseUrl}/newsletter/status/${testEmail}`);
    console.log('Status:', statusResponse.data);

    // Step 2: Subscribe
    console.log('\n2. Subscribing to newsletter...');
    const subscribeResponse = await axios.post(`${baseUrl}/newsletter/subscribe`, {
      email: testEmail
    });
    console.log('Subscribe response:', subscribeResponse.data);

    console.log('\nTest completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check your email for the confirmation link');
    console.log('2. Click the confirmation link to complete the subscription');
    console.log('3. You should receive a welcome email after confirmation');

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testSubscription(); 