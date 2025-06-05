require('dotenv').config();
const mongoose = require('mongoose');
const PendingSubscription = require('../models/PendingSubscription');

const checkPendingSubscriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const pending = await PendingSubscription.find().sort('-createdAt');
    console.log('\nPending Subscriptions:');
    if (pending.length === 0) {
      console.log('No pending subscriptions found');
    } else {
      pending.forEach(sub => {
        console.log(`\nEmail: ${sub.email}`);
        console.log(`Token: ${sub.token}`);
        console.log(`Created At: ${sub.createdAt}`);
        console.log('------------------------');
      });
      console.log(`\nTotal pending: ${pending.length}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkPendingSubscriptions(); 