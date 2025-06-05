const mongoose = require('mongoose');

const pendingSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 3600 // Document will be automatically deleted after 24 hours
  }
});

module.exports = mongoose.model('PendingSubscription', pendingSubscriptionSchema); 