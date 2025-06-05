require('dotenv').config();
const { sendEmail } = require('../utils/mailer');

const testEmailConfig = async () => {
  console.log('Testing email configuration...');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '****' : 'Not set');

  try {
    await sendEmail({
      to: process.env.GMAIL_USER, // Send to yourself as a test
      subject: 'Test Email Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Configuration Test</h2>
          <p>If you receive this email, your email configuration is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
};

testEmailConfig(); 