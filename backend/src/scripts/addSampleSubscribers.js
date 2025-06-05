require('dotenv').config();
const mongoose = require('mongoose');
const Subscriber = require('../models/Subscriber');

const sampleSubscribers = [
  {
    email: 'john.doe@example.com',
    isActive: true,
    subscriptionDate: new Date('2024-01-15')
  },
  {
    email: 'sarah.smith@example.com',
    isActive: true,
    subscriptionDate: new Date('2024-02-01')
  },
  {
    email: 'michael.brown@example.com',
    isActive: false,
    subscriptionDate: new Date('2023-12-20')
  },
  {
    email: 'emma.wilson@example.com',
    isActive: true,
    subscriptionDate: new Date('2024-02-10')
  },
  {
    email: 'david.jones@example.com',
    isActive: true,
    subscriptionDate: new Date('2024-01-25')
  }
];

const addSampleSubscribers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing subscribers
    await Subscriber.deleteMany({});
    console.log('Cleared existing subscribers');

    // Add sample subscribers
    const subscribers = await Subscriber.insertMany(sampleSubscribers);
    console.log('Added sample subscribers:', subscribers.length);

    console.log('\nSample subscribers added successfully! Here are the details:');
    subscribers.forEach(subscriber => {
      console.log(`\nEmail: ${subscriber.email}`);
      console.log(`Status: ${subscriber.isActive ? 'Active' : 'Inactive'}`);
      console.log(`Subscription Date: ${subscriber.subscriptionDate.toLocaleDateString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample subscribers:', error);
    process.exit(1);
  }
};

addSampleSubscribers(); 