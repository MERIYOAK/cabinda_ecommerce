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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4a90e2; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">${finalSubject.pt}</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <div style="color: #666; line-height: 1.6;">
              ${finalMessage.pt}
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <h3 style="color: #1976d2; margin-top: 0;">English Version</h3>
              <h4 style="color: #333; margin-bottom: 10px;">${finalSubject.en}</h4>
              <div style="color: #666; line-height: 1.6;">
                ${finalMessage.en}
              </div>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #999; font-size: 12px;">
              You received this email because you're subscribed to our newsletter. 
              If you wish to unsubscribe, please visit our website.
            </p>
          </div>
        </div>
      `;
    } else {
      // Single language newsletter
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4a90e2; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">${finalSubject}</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <div style="color: #666; line-height: 1.6;">
              ${finalMessage}
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #999; font-size: 12px;">
              You received this email because you're subscribed to our newsletter. 
              If you wish to unsubscribe, please visit our website.
            </p>
          </div>
        </div>
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