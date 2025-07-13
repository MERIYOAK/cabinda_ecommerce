const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/mailer');

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address'
      });
    }

    // Create HTML email content
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #25d366 0%, #128c7e 50%, #075e54 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; margin: -20px -20px 20px -20px;">
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Contact Form Submission</h2>
          <div style="width: 60px; height: 3px; background: rgba(255, 255, 255, 0.8); margin: 15px auto 0; border-radius: 2px;"></div>
        </div>
        
        <!-- Contact Details -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">
          <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Contact Information</h3>
          <div style="margin-bottom: 15px;">
            <strong style="color: #4a5568;">Name:</strong> ${name}
          </div>
          <div style="margin-bottom: 15px;">
            <strong style="color: #4a5568;">Email:</strong> ${email}
          </div>
          <div style="margin-bottom: 15px;">
            <strong style="color: #4a5568;">Subject:</strong> ${subject}
          </div>
        </div>
        
        <!-- Message -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">
          <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Message</h3>
          <div style="color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 13px; margin: 0;">
            This message was sent from the AFRI-CABINDA contact form.<br>
            Sent on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    // Send email to admin
    await sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: htmlContent
    });

    // Send confirmation email to user
    const confirmationHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #25d366 0%, #128c7e 50%, #075e54 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; margin: -20px -20px 20px -20px;">
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Thank You for Contacting Us</h2>
          <div style="width: 60px; height: 3px; background: rgba(255, 255, 255, 0.8); margin: 15px auto 0; border-radius: 2px;"></div>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
            Dear ${name},
          </p>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for reaching out to AFRI-CABINDA. We have received your message and will get back to you as soon as possible.
          </p>
          <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #2d3748;">Your Message:</strong><br>
            <span style="color: #4a5568; font-style: italic;">"${message}"</span>
          </div>
          <p style="color: #4a5568; line-height: 1.6; margin: 20px 0 0 0;">
            Best regards,<br>
            The AFRI-CABINDA Team
          </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 13px; margin: 0;">
            This is an automated confirmation email.<br>
            Sent on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Thank you for contacting AFRI-CABINDA',
      html: confirmationHtml
    });

    res.json({
      message: 'Contact form submitted successfully. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      message: 'Failed to send contact form. Please try again later.'
    });
  }
});

module.exports = router; 