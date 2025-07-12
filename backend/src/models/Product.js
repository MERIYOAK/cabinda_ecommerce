const mongoose = require('mongoose');

const multilingualFieldSchema = {
  en: {
    type: String,
    required: true,
    trim: true
  },
  pt: {
    type: String,
    required: true,
    trim: true
  }
};

const productSchema = new mongoose.Schema({
  name: multilingualFieldSchema,
  description: multilingualFieldSchema,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Foodstuffs',
      'Household',
      'Beverages',
      'Electronics',
      'Construction Materials',
      'Plastics',
      'Cosmetics',
      'Powder Detergent',
      'Liquid Detergent',
      'Juices',
      'Dental Care',
      'Beef'
    ]
  },
  imageUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 