const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
require('dotenv').config();

const createWeeklyOffer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find coffee-related products
    const coffeeProducts = await Product.find({
      $or: [
        { name: { $regex: /coffee/i } },
        { description: { $regex: /coffee/i } },
        { category: 'Drinks' }
      ]
    });

    if (coffeeProducts.length === 0) {
      console.log('No coffee-related products found. Creating offer without products.');
    } else {
      console.log(`Found ${coffeeProducts.length} coffee-related products.`);
    }

    const currentDate = new Date();
    const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const weeklyOffer = {
      title: {
        pt: 'Especial Semanal de Café',
        en: 'Weekly Coffee Special'
      },
      description: {
        pt: 'Aproveite a nossa seleção premium de café com um desconto incrível! Oferta por tempo limitado.',
        en: 'Enjoy our premium coffee selection at an amazing discount! Limited time offer.'
      },
      category: 'seasonal',
      discountPercentage: 20,
      products: coffeeProducts.map(p => p._id),
      startDate: currentDate,
      endDate: nextWeek,
      isActive: true,
      bannerImage: 'https://cabindaretailshop.s3.us-east-1.amazonaws.com/coffee.jpg'
    };

    // Delete any existing weekly coffee special offers
    await Offer.deleteMany({ 'title.en': 'Weekly Coffee Special' });
    
    const offer = new Offer(weeklyOffer);
    const savedOffer = await offer.save();
    
    console.log('Weekly offer created successfully:', savedOffer);
    process.exit(0);
  } catch (error) {
    console.error('Error creating weekly offer:', error);
    process.exit(1);
  }
};

createWeeklyOffer(); 