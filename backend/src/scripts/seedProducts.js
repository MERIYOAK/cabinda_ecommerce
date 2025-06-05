require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Premium Angolan Coffee',
    description: 'High-quality Robusta coffee beans from Cabinda region. Perfect for your morning brew.',
    price: 15.99,
    category: 'Foodstuffs',
    stock: 100,
    isOnSale: true,
    salePrice: 12.99,
    rating: 4.5,
    numReviews: 25,
    imageUrl: 'https://cabindaretailshop.s3.us-east-1.amazonaws.com/coffee.jpg'
  },
  {
    name: 'Tropical Fruit Juice',
    description: 'Natural fruit juice made from fresh tropical fruits. No added sugars.',
    price: 3.99,
    category: 'Drinks',
    stock: 150,
    isOnSale: false,
    rating: 4.2,
    numReviews: 18,
    imageUrl: 'https://cabindaretailshop.s3.us-east-1.amazonaws.com/juice.jpg'
  },
  {
    name: 'Traditional Angolan Dress',
    description: 'Beautiful traditional dress with modern patterns. Perfect for special occasions.',
    price: 89.99,
    category: 'Fashion',
    stock: 20,
    isOnSale: false,
    rating: 4.8,
    numReviews: 12,
    imageUrl: 'https://cabindaretailshop.s3.us-east-1.amazonaws.com/dress.jpg'
  },
  {
    name: 'Decorative Vase',
    description: 'Handcrafted ceramic vase with traditional Angolan patterns.',
    price: 45.99,
    category: 'Home & Living',
    stock: 30,
    isOnSale: true,
    salePrice: 35.99,
    rating: 4.0,
    numReviews: 8,
    imageUrl: 'https://cabindaretailshop.s3.us-east-1.amazonaws.com/vase.jpg'
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Create products
    for (const product of sampleProducts) {
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`Created product: ${product.name}`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedProducts(); 