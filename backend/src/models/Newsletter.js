const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'newsletter_subscribers'
});

newsletterSchema.index({ email: 1 }, { unique: true });

newsletterSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

Newsletter.createIndexes().then(() => {
  console.log('Newsletter indexes created successfully');
}).catch(err => {
  console.error('Error creating Newsletter indexes:', err);
});

module.exports = Newsletter; 