require('dotenv').config();
const mongoose = require('mongoose');
const Newsletter = require('../models/Newsletter');

const checkSubscribers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const subscribers = await Newsletter.find().sort('-subscriptionDate');
    console.log('\nCurrent Subscribers:');
    if (subscribers.length === 0) {
      console.log('No subscribers found');
    } else {
      subscribers.forEach(sub => {
        console.log(`\nEmail: ${sub.email}`);
        console.log(`Subscription Date: ${sub.subscriptionDate}`);
        console.log(`Active: ${sub.isActive}`);
        console.log('------------------------');
      });
      console.log(`\nTotal subscribers: ${subscribers.length}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkSubscribers(); 