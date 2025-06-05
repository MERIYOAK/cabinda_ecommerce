require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

// MongoDB connection URI
const MONGODB_URI = 'mongodb+srv://meron:07448717@cabindaretailshopcluste.ui1qzya.mongodb.net/';

const announcements = [
  {
    title: 'Special Discount on Traditional Palm Oil!',
    content: 'Get our high-quality red palm oil at a special discount. Perfect for traditional Angolan dishes. Limited time offer - don\'t miss out on this amazing deal! Visit our store today and experience the authentic taste of Angola.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'Promotion',
    isImportant: true,
    date: new Date(),
    active: true
  },
  {
    title: 'New Fashion Collection Arrival',
    content: 'Introducing our latest collection of traditional dresses. Handcrafted with care and designed for both comfort and style. Available in various sizes and colors. Visit our fashion section to discover more!',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'New Arrival',
    isImportant: false,
    date: new Date(Date.now() - 86400000), // Yesterday
    active: true
  },
  {
    title: 'Fresh Cassava Now in Stock!',
    content: 'We\'ve just received a fresh batch of locally sourced cassava roots. Known for their quality and taste, these cassava roots are perfect for your traditional recipes. Come early for the best selection!',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'Stock Update',
    isImportant: true,
    date: new Date(Date.now() - 172800000), // 2 days ago
    active: true
  },
  {
    title: 'Traditional Palm Wine Festival',
    content: 'Join us this weekend for our Traditional Palm Wine Festival! Sample our freshly tapped palm wine and learn about the traditional tapping process. Special discounts on all palm wine purchases during the festival.',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'Event',
    isImportant: true,
    date: new Date(Date.now() - 259200000), // 3 days ago
    active: true
  }
];

async function seedAnnouncements() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing announcements
    await Announcement.deleteMany({});
    console.log('Cleared existing announcements');

    // Insert new announcements
    const result = await Announcement.insertMany(announcements);
    console.log(`Successfully seeded ${result.length} announcements`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding announcements:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedAnnouncements(); 