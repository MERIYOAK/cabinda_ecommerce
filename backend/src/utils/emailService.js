const nodemailer = require('nodemailer');
require('dotenv').config();
const crypto = require('crypto');
const { sendEmail } = require('./mailer');

// Email validation function using regex
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Create a test account for development
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
};

// Create transporter
const createTransporter = async () => {
  // For production, use Gmail
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password here
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // For development, use Ethereal Email
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = await createTransporter();
    
    const verificationUrl = `${process.env.BASE_URL}/verify-admin/${token}`;
    
    const mailOptions = {
      from: `"Retail Shop Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Admin Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #4a90e2; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Admin Account Verification</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5;">Thank you for setting up your admin account. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you did not request this verification, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">This is an automated email, please do not reply.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      // Log preview URL for development (Ethereal Email)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Add a test function to verify email configuration
const testEmailService = async () => {
  try {
    const transporter = await createTransporter();
    console.log('Email service configured successfully!');
    
    if (process.env.NODE_ENV === 'production') {
      // Test Gmail connection
      await transporter.verify();
      console.log('Gmail connection verified successfully!');
    }
    
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    throw error;
  }
};

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify if email exists (basic validation)
const verifyEmail = async (email) => {
  // First check if email format is valid
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Basic DNS validation of email domain
  const [, domain] = email.split('@');
  try {
    const { promises: dns } = require('dns');
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords.length > 0;
  } catch (error) {
    throw new Error('Invalid email domain');
  }
};

// Generate a random token for email confirmation
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send confirmation email
const sendConfirmationEmail = async (email, token) => {
  const confirmationUrl = `${process.env.FRONTEND_URL}/newsletter/confirm/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Confirm Your Newsletter Subscription</h2>
      <p style="color: #666; line-height: 1.6;">
        Thank you for subscribing to our newsletter! Please click the button below to confirm your subscription.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Confirm Subscription
        </a>
      </div>
      <p style="color: #666; line-height: 1.6;">
        If the button doesn't work, you can also copy and paste this link into your browser:
        <br>
        <a href="${confirmationUrl}" style="color: #dc3545;">${confirmationUrl}</a>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        If you didn't request this subscription, you can safely ignore this email.
        This link will expire in 24 hours.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Confirm Your Newsletter Subscription',
    html
  });
};

// Send welcome email after confirmation
const sendWelcomeEmail = async (email) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Our Newsletter!</h2>
      <p style="color: #666; line-height: 1.6;">
        Thank you for confirming your subscription to our newsletter. We're excited to have you join our community!
      </p>
      <p style="color: #666; line-height: 1.6;">
        You'll now receive updates about:
        <ul style="color: #666; line-height: 1.6;">
          <li>New products and special offers</li>
          <li>Exclusive deals and promotions</li>
          <li>Company news and updates</li>
          <li>Tips and helpful content</li>
        </ul>
      </p>
      <p style="color: #666; line-height: 1.6;">
        Stay tuned for our next newsletter!
      </p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">
        You can manage your subscription preferences at any time by visiting our website.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Our Newsletter!',
    html
  });
};

module.exports = {
  sendVerificationEmail,
  testEmailService,
  verifyEmail,
  generateToken,
  sendConfirmationEmail,
  sendWelcomeEmail
}; 