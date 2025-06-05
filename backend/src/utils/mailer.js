const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    debug: true // Enable debug logging
  });

  return transporter;
};

// Verify transporter configuration
const verifyConnection = async () => {
  const transporter = createTransporter();
  try {
    const verification = await transporter.verify();
    console.log('SMTP connection verified:', verification);
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('SMTP Verification Error:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    return false;
  }
};

// Helper function to send emails
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  
  try {
    // Log email configuration (without sensitive data)
    console.log('Attempting to send email with config:', {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject
    });

    const mailOptions = {
      from: `"${process.env.SITE_NAME || 'Retail Shop'}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    throw error;
  }
};

// Verify connection on module load
verifyConnection().then(isValid => {
  if (!isValid) {
    console.error('Email configuration is invalid. Please check your credentials.');
  }
});

module.exports = {
  sendEmail
}; 