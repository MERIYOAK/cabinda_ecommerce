const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const PendingSubscription = require('../models/PendingSubscription');
const { generateToken, sendConfirmationEmail, sendWelcomeEmail } = require('../utils/emailService');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/mailer');

// Public routes
// Get subscription status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const subscriber = await Newsletter.findOne({ email });
    if (subscriber) {
      return res.status(200).json({
        status: 'subscribed',
        message: 'Email is already subscribed.'
      });
    }

    const pending = await PendingSubscription.findOne({ email });
    if (pending) {
      return res.status(200).json({
        status: 'pending',
        message: 'Subscription is pending confirmation.'
      });
    }

    res.status(200).json({
      status: 'none',
      message: 'Email is not subscribed.'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      message: 'Failed to check subscription status.'
    });
  }
});

// Subscribe to newsletter (Step 1: Send confirmation email)
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ 
        message: 'This email is already subscribed to our newsletter.'
      });
    }

    // Check if there's a pending subscription
    const existingPending = await PendingSubscription.findOne({ email });
    if (existingPending) {
      // Resend confirmation email with existing token
      await sendConfirmationEmail(email, existingPending.token);
      return res.status(200).json({ 
        message: 'Confirmation email has been resent. Please check your inbox.'
      });
    }

    // Generate token and save pending subscription
    const token = generateToken();
    const pendingSubscription = new PendingSubscription({
      email,
      token
    });
    await pendingSubscription.save();

    // Send confirmation email
    await sendConfirmationEmail(email, token);

    res.status(200).json({
      message: 'Please check your email to confirm your subscription.'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      message: 'Failed to process subscription. Please try again later.'
    });
  }
});

// Confirm subscription (Step 2: Verify token and complete subscription)
router.get('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Processing confirmation for token:', token);

    // Find pending subscription
    const pendingSubscription = await PendingSubscription.findOne({ token });
    if (!pendingSubscription) {
      console.log('No pending subscription found for token:', token);
      return res.status(400).json({
        message: 'This confirmation link has expired or has already been used. Please subscribe again to receive a new confirmation link.',
        code: 'INVALID_TOKEN'
      });
    }

    console.log('Found pending subscription:', pendingSubscription);

    // Check if email is already subscribed (race condition check)
    const existingSubscriber = await Newsletter.findOne({ email: pendingSubscription.email });
    if (existingSubscriber) {
      console.log('Email already subscribed:', pendingSubscription.email);
      await PendingSubscription.deleteOne({ _id: pendingSubscription._id });
      return res.status(400).json({
        message: 'This email is already subscribed to our newsletter.'
      });
    }

    try {
      // Create confirmed subscription
      const subscriber = new Newsletter({
        email: pendingSubscription.email,
        subscriptionDate: new Date(),
        isActive: true
      });

      console.log('Attempting to save new subscriber:', subscriber);
      const savedSubscriber = await subscriber.save();
      console.log('Subscriber saved successfully:', savedSubscriber);

      // Verify the subscriber was actually saved
      const verifySubscriber = await Newsletter.findById(savedSubscriber._id);
      if (!verifySubscriber) {
        throw new Error('Failed to verify subscriber was saved');
      }
      console.log('Verified subscriber in database:', verifySubscriber);

      // Delete pending subscription only after successful save
      await PendingSubscription.deleteOne({ _id: pendingSubscription._id });
      console.log('Pending subscription deleted');

      // Send welcome email
      await sendWelcomeEmail(pendingSubscription.email);
      console.log('Welcome email sent');

      res.status(200).json({
        message: 'Your subscription has been confirmed! Welcome to our newsletter.',
        subscriber: savedSubscriber
      });
    } catch (saveError) {
      console.error('Error saving subscriber:', saveError);
      // If save fails, don't delete pending subscription
      throw new Error(`Failed to save subscriber: ${saveError.message}`);
    }
  } catch (error) {
    console.error('Confirmation error:', error);
    res.status(500).json({
      message: 'Failed to confirm subscription. Please try again later.',
      error: error.message
    });
  }
});

// Protected routes (admin only)
// Get all subscribers
router.get('/subscribers', verifyToken, isAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort('-subscriptionDate');
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete subscriber
router.delete('/subscribers/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    res.json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send newsletter to all subscribers
router.post('/send', verifyToken, isAdmin, async (req, res) => {
  try {
    const { subject, message, subject_pt, subject_en, message_pt, message_en } = req.body;

    // Support both old format (single language) and new format (multilingual)
    let finalSubject, finalMessage;
    
    if (subject_pt && subject_en && message_pt && message_en) {
      // New multilingual format
      finalSubject = {
        pt: subject_pt,
        en: subject_en
      };
      finalMessage = {
        pt: message_pt,
        en: message_en
      };
    } else if (subject && message) {
      // Old single language format
      finalSubject = subject;
      finalMessage = message;
    } else {
      return res.status(400).json({ 
        message: 'Subject and message are required. For multilingual support, provide subject_pt, subject_en, message_pt, and message_en.' 
      });
    }

    const subscribers = await Newsletter.find({ isActive: true });
    
    if (subscribers.length === 0) {
      return res.status(404).json({ message: 'No active subscribers found' });
    }

    // Create HTML template for the newsletter
    let htmlContent;
    
    if (typeof finalSubject === 'object' && typeof finalMessage === 'object') {
      // Multilingual newsletter
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <div style="background: linear-gradient(135deg, #25d366 0%, #128c7e 50%, #075e54 100%); padding: 30px 20px; text-align: center; position: relative; overflow: hidden;">
            <!-- Decorative elements -->
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%); animation: shimmer 3s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: 10px; left: 10px; width: 30px; height: 30px; background: rgba(255, 255, 255, 0.15); border-radius: 50%;"></div>
            
            <!-- Portuguese Title -->
            <h2 style="color: white; margin: 0; text-align: center; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); position: relative; z-index: 1;">${finalSubject.pt}</h2>
            <div style="width: 60px; height: 3px; background: rgba(255, 255, 255, 0.8); margin: 15px auto 0; border-radius: 2px;"></div>
            
            <!-- English Title -->
            <h3 style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; text-align: center; font-size: 18px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); position: relative; z-index: 1;">${finalSubject.en}</h3>
          </div>
          
          <!-- Main content -->
          <div style="background: white; padding: 30px 20px; position: relative;">
            <!-- Portuguese Content -->
            <div style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 25px; position: relative;">
              <div style="position: absolute; top: -10px; left: 20px; font-size: 2rem; color: #25d366; opacity: 0.3;">"</div>
              <div style="white-space: pre-wrap; word-wrap: break-word;">${finalMessage.pt}</div>
            </div>
            
            <!-- Divider with Angolan flag -->
            <div style="margin: 30px 0; text-align: center;">
              <div style="display: inline-block; width: 50px; height: 2px; background: linear-gradient(90deg, #25d366 0%, #128c7e 100%); border-radius: 1px;"></div>
              <span style="margin: 0 15px; color: #25d366; font-weight: 600;">🇦🇴</span>
              <div style="display: inline-block; width: 50px; height: 2px; background: linear-gradient(90deg, #128c7e 0%, #25d366 100%); border-radius: 1px;"></div>
            </div>
            
            <!-- English Content -->
            <div style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 25px; position: relative;">
              <div style="position: absolute; top: -10px; left: 20px; font-size: 2rem; color: #25d366; opacity: 0.3;">"</div>
              <div style="white-space: pre-wrap; word-wrap: break-word;">${finalMessage.en}</div>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #718096; font-size: 13px; margin: 0; line-height: 1.5;">
                You received this email because you're subscribed to our newsletter.<br>
                If you wish to unsubscribe, please visit our website.
              </p>
              <div style="margin-top: 15px;">
                <div style="display: inline-block; width: 30px; height: 30px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); border-radius: 50%; margin: 0 5px;"></div>
                <div style="display: inline-block; width: 20px; height: 20px; background: linear-gradient(135deg, #128c7e 0%, #075e54 100%); border-radius: 50%; margin: 0 5px;"></div>
                <div style="display: inline-block; width: 15px; height: 15px; background: linear-gradient(135deg, #075e54 0%, #25d366 100%); border-radius: 50%; margin: 0 5px;"></div>
              </div>
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; margin: 0; line-height: 1.4;">
                  Powered by{' '}
                  <a href="https://www.meronvault.com" target="_blank" style="color: #25d366; text-decoration: none; font-weight: 600; background: linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FFD700); background-size: 200% 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: meroniShine 3s ease-in-out infinite;">MERONI</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          
          @keyframes meroniShine {
            0%, 100% { 
              background-position: 0% 50%; 
            }
            50% { 
              background-position: 100% 50%; 
            }
          }
        </style>
      `;
    } else {
      // Single language newsletter
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <div style="background: linear-gradient(135deg, #25d366 0%, #128c7e 50%, #075e54 100%); padding: 30px 20px; text-align: center; position: relative; overflow: hidden;">
            <!-- Decorative elements -->
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%); animation: shimmer 3s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: 10px; left: 10px; width: 30px; height: 30px; background: rgba(255, 255, 255, 0.15); border-radius: 50%;"></div>
            
            <h2 style="color: white; margin: 0; text-align: center; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); position: relative; z-index: 1;">${finalSubject}</h2>
            <div style="width: 60px; height: 3px; background: rgba(255, 255, 255, 0.8); margin: 15px auto 0; border-radius: 2px;"></div>
          </div>
          
          <!-- Main content -->
          <div style="background: white; padding: 30px 20px; position: relative;">
            <div style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 25px; position: relative;">
              <div style="position: absolute; top: -10px; left: 20px; font-size: 2rem; color: #25d366; opacity: 0.3;">"</div>
              <div style="white-space: pre-wrap; word-wrap: break-word;">${finalMessage}</div>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #718096; font-size: 13px; margin: 0; line-height: 1.5;">
                You received this email because you're subscribed to our newsletter.<br>
                If you wish to unsubscribe, please visit our website.
              </p>
              <div style="margin-top: 15px;">
                <div style="display: inline-block; width: 30px; height: 30px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); border-radius: 50%; margin: 0 5px;"></div>
                <div style="display: inline-block; width: 20px; height: 20px; background: linear-gradient(135deg, #128c7e 0%, #075e54 100%); border-radius: 50%; margin: 0 5px;"></div>
                <div style="display: inline-block; width: 15px; height: 15px; background: linear-gradient(135deg, #075e54 0%, #25d366 100%); border-radius: 50%; margin: 0 5px;"></div>
              </div>
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; margin: 0; line-height: 1.4;">
                  Powered by{' '}
                  <a href="https://www.meronvault.com" target="_blank" style="color: #25d366; text-decoration: none; font-weight: 600; background: linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FFD700); background-size: 200% 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: meroniShine 3s ease-in-out infinite;">MERONI</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          
          @keyframes meroniShine {
            0%, 100% { 
              background-position: 0% 50%; 
            }
            50% { 
              background-position: 100% 50%; 
            }
          }
        </style>
      `;
    }

    // Send email to all subscribers
    const emailPromises = subscribers.map(subscriber => 
      sendEmail({
        to: subscriber.email,
        subject: typeof finalSubject === 'object' ? finalSubject.pt : finalSubject,
        html: htmlContent
      })
    );

    await Promise.all(emailPromises);

    res.json({ 
      message: 'Newsletter sent successfully', 
      recipientCount: subscribers.length 
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ 
      message: 'Error sending newsletter',
      error: error.message 
    });
  }
});

module.exports = router; 