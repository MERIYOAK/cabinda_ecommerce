require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const deleteAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop');
    console.log('\nConnected to MongoDB');

    // Delete admin user
    const result = await User.deleteOne({ role: 'admin' });
    
    if (result.deletedCount > 0) {
      console.log('\x1b[32m%s\x1b[0m', 'Admin user deleted successfully!');
    } else {
      console.log('\x1b[33m%s\x1b[0m', 'No admin user found to delete.');
    }

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error deleting admin:', error.message);
    process.exit(1);
  }
};

deleteAdmin(); 