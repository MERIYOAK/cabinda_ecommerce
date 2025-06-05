require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

const MONGODB_URI = 'mongodb+srv://meron:07448717@cabindaretailshopcluste.ui1qzya.mongodb.net/';

async function checkAnnouncements() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all announcements
    const announcements = await Announcement.find({});
    console.log('Total announcements found:', announcements.length);
    
    if (announcements.length > 0) {
      console.log('\nAnnouncements in database:');
      announcements.forEach((announcement, index) => {
        console.log(`\n${index + 1}. ${announcement.title}`);
        console.log(`   Category: ${announcement.category}`);
        console.log(`   Active: ${announcement.active}`);
        console.log(`   Date: ${announcement.date}`);
      });
    } else {
      console.log('No announcements found in database');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Error checking announcements:', error);
    process.exit(1);
  }
}

// Run the check function
checkAnnouncements(); 