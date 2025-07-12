require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('../models/Offer');

const inspectOffers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find all offers
    const offers = await Offer.find({});
    console.log(`Found ${offers.length} offers`);

    offers.forEach((offer, index) => {
      console.log(`\n--- Offer ${index + 1} ---`);
      console.log(`ID: ${offer._id}`);
      console.log(`Title type: ${typeof offer.title}`);
      console.log(`Title value:`, offer.title);
      console.log(`Description type: ${typeof offer.description}`);
      console.log(`Description value:`, offer.description);
      console.log(`Category: ${offer.category}`);
      console.log(`Discount: ${offer.discountPercentage}%`);
      console.log(`Active: ${offer.isActive}`);
      console.log(`Products: ${offer.products.length}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error inspecting offers:', error);
    process.exit(1);
  }
};

inspectOffers(); 