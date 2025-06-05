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

module.exports = multilingualFieldSchema; 