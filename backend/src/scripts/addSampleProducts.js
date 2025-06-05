require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Grilled Fish (Peixe Grelhado)',
    description: 'Fresh grilled fish from Cabinda\'s coast, seasoned with local spices and herbs. Served with lime and hot sauce.',
    price: 15.99,
    category: 'Foodstuffs',
    stock: 50,
    isOnSale: true,
    salePrice: 13.99,
    images: [
      'https://img.freepik.com/free-photo/grilled-fish-with-lemon-tomatoes_144627-5461.jpg',
      'https://img.freepik.com/free-photo/fresh-fish-with-spices-herbs-cooking_114579-2783.jpg',
      'https://img.freepik.com/free-photo/grilled-fish-plate-with-vegetables_140725-6478.jpg'
    ],
  },
  {
    name: 'Palm Oil (Óleo de Palma)',
    description: 'High-quality red palm oil from Cabinda, perfect for traditional Angolan dishes. Rich in vitamins and antioxidants.',
    price: 8.99,
    category: 'Foodstuffs',
    stock: 200,
    isOnSale: false,
    images: [
      'https://img.freepik.com/free-photo/palm-oil-fruits_1150-35038.jpg',
      'https://img.freepik.com/free-photo/close-up-palm-oil-seeds_53876-31172.jpg',
      'https://img.freepik.com/free-photo/palm-oil-bottle-with-fresh-palm-fruits_1150-35039.jpg'
    ],
  },
  {
    name: 'Dried Fish (Peixe Seco)',
    description: 'Traditional sun-dried fish, a staple in Cabinda cuisine. Perfect for soups and stews.',
    price: 12.99,
    category: 'Foodstuffs',
    stock: 75,
    isOnSale: false,
    images: [
      'https://img.freepik.com/free-photo/dried-fish-market_1339-2363.jpg',
      'https://img.freepik.com/free-photo/dried-fish-arrangement-market_23-2148301651.jpg',
      'https://img.freepik.com/free-photo/dried-fish-market-stall_1339-2365.jpg'
    ],
  },
  {
    name: 'Cassava Flour (Fuba de Mandioca)',
    description: 'Finely ground cassava flour, essential for making funje and other traditional Angolan dishes.',
    price: 6.99,
    category: 'Foodstuffs',
    stock: 150,
    isOnSale: true,
    salePrice: 5.99,
    images: [
      'https://img.freepik.com/free-photo/cassava-flour-bowl-wooden-table_1150-42330.jpg',
      'https://img.freepik.com/free-photo/raw-cassava-root-wooden-surface_1150-42329.jpg',
      'https://img.freepik.com/free-photo/cassava-flour-preparation-process_1150-42332.jpg'
    ],
  },
  {
    name: 'Palm Wine (Maruvo)',
    description: 'Traditional palm wine from Cabinda, naturally fermented and refreshing. A popular traditional drink.',
    price: 9.99,
    category: 'Drinks',
    stock: 100,
    isOnSale: false,
    images: [
      'https://img.freepik.com/free-photo/traditional-palm-wine-glass-bottle_1150-35040.jpg',
      'https://img.freepik.com/free-photo/palm-wine-tapping-process_1150-35041.jpg',
      'https://img.freepik.com/free-photo/fresh-palm-wine-served-traditional-way_1150-35042.jpg'
    ],
  },
  {
    name: 'Ginger Beer (Cerveja de Gengibre)',
    description: 'Homemade fermented ginger beer, a refreshing non-alcoholic beverage popular in Cabinda.',
    price: 4.99,
    category: 'Drinks',
    stock: 120,
    isOnSale: true,
    salePrice: 3.99,
    images: [
      'https://img.freepik.com/free-photo/ginger-beer-glass-with-fresh-ginger_1150-42335.jpg',
      'https://img.freepik.com/free-photo/fresh-ginger-root-wooden-surface_1150-42334.jpg',
      'https://img.freepik.com/free-photo/homemade-ginger-beer-preparation_1150-42336.jpg'
    ],
  },
  {
    name: 'Coconut Water (Água de Coco)',
    description: 'Fresh coconut water from local Cabinda coconuts. Natural and refreshing.',
    price: 3.99,
    category: 'Drinks',
    stock: 80,
    isOnSale: false,
    images: [
      'https://img.freepik.com/free-photo/fresh-coconut-water-glass_144627-12393.jpg',
      'https://img.freepik.com/free-photo/fresh-coconuts-with-drinking-straws_144627-12395.jpg',
      'https://img.freepik.com/free-photo/coconut-water-pouring-glass_144627-12394.jpg'
    ],
  },
  {
    name: 'Tamarind Juice (Suco de Tamarindo)',
    description: 'Freshly made tamarind juice, sweet and tangy. A popular traditional beverage.',
    price: 4.99,
    category: 'Drinks',
    stock: 90,
    isOnSale: true,
    salePrice: 3.99,
    images: [
      'https://img.freepik.com/free-photo/fresh-tamarind-juice-glass_144627-12396.jpg',
      'https://img.freepik.com/free-photo/raw-tamarind-wooden-surface_144627-12397.jpg',
      'https://img.freepik.com/free-photo/tamarind-juice-preparation_144627-12398.jpg'
    ],
  }
];

const addSampleProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add sample products
    const products = await Product.insertMany(sampleProducts);
    console.log('Added sample products:', products.length);

    console.log('\nSample products added successfully! Here are the details:');
    products.forEach(product => {
      console.log(`\n${product.name}`);
      console.log(`Price: $${product.price}`);
      console.log(`Category: ${product.category}`);
      console.log(`Stock: ${product.stock}`);
      console.log(`Number of images: ${product.images.length}`);
      if (product.isOnSale) {
        console.log(`Sale Price: $${product.salePrice}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample products:', error);
    process.exit(1);
  }
};

addSampleProducts(); 