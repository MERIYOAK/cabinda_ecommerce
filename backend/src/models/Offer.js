const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['seasonal', 'clearance', 'flash', 'bundle', 'holiday', 'other'],
    default: 'other'
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bannerImage: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add index for querying active offers
offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
offerSchema.index({ category: 1 });

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer; 