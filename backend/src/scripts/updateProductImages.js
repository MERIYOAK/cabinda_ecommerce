const mongoose = require('mongoose');
const Product = require('../models/Product');

const productImages = {
  'Foodstuffs': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Drinks': [
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Fashion': [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&h=600&q=80'
  ],
  'Home & Living': [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&h=600&q=80'
  ]
};

const updateProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const products = await Product.find();
    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
      // Get random image URL for the product's category
      const categoryImages = productImages[product.category] || productImages['Foodstuffs'];
      const randomImageUrl = categoryImages[Math.floor(Math.random() * categoryImages.length)];

      // Update the product with imageUrl
      await Product.findByIdAndUpdate(product._id, {
        $set: { imageUrl: randomImageUrl }
      });

      console.log(`Updated product: ${product.name} with image URL`);
    }

    console.log('All products have been updated with image URLs');
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

updateProducts(); 