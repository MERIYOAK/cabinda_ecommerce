const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Promotion', 'New Arrival', 'Stock Update', 'Event', 'News']
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster querying
announcementSchema.index({ category: 1, date: -1 });

module.exports = mongoose.model('Announcement', announcementSchema); 