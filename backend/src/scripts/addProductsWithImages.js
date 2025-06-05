const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Traditional Palm Oil',
    description: 'High-quality red palm oil, perfect for traditional Angolan dishes',
    price: 12.99,
    category: 'Foodstuffs',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80',
    stock: 50,
    isOnSale: true,
    salePrice: 10.99
  },
  {
    name: 'Fresh Cassava',
    description: 'Locally sourced fresh cassava roots',
    price: 8.99,
    category: 'Foodstuffs',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&h=600&q=80',
    stock: 100
  },
  {
    name: 'Dried Fish',
    description: 'Traditional sun-dried fish, perfect for soups and stews',
    price: 15.99,
    category: 'Foodstuffs',
    imageUrl: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&h=600&q=80',
    stock: 30
  },
  {
    name: 'Palm Wine',
    description: 'Traditional palm wine, freshly tapped',
    price: 9.99,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80',
    stock: 40,
    isOnSale: true,
    salePrice: 7.99
  },
  {
    name: 'Ginger Beer',
    description: 'Refreshing homemade ginger beer',
    price: 4.99,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&h=600&q=80',
    stock: 60
  },
  {
    name: 'Traditional Dress',
    description: 'Beautiful handmade traditional dress',
    price: 89.99,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&h=600&q=80',
    stock: 15,
    isOnSale: true,
    salePrice: 69.99
  },
  {
    name: 'Woven Basket',
    description: 'Handcrafted decorative basket',
    price: 29.99,
    category: 'Home & Living',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&h=600&q=80',
    stock: 25
  }
];

const addProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add new products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Added ${products.length} products with images`);

    console.log('\nSample products added successfully! Here are the details:');
    products.forEach(product => {
      console.log(`\nName: ${product.name}`);
      console.log(`Category: ${product.category}`);
      console.log(`Price: $${product.price}`);
      if (product.isOnSale) {
        console.log(`Sale Price: $${product.salePrice}`);
      }
      console.log(`Stock: ${product.stock}`);
      console.log(`Image URL: ${product.imageUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
};

addProducts(); 