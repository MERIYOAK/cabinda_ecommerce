const axios = require('axios');

const sampleOffers = [
  {
    title: 'Weekend Fish Special',
    description: 'Get 25% off on our freshest fish selection! Direct from Cabinda\'s coast to your table.',
    category: 'seasonal',
    discountPercentage: 25,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    bannerImage: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Traditional Drinks Festival',
    description: 'Celebrate with us! 20% off on all traditional drinks including Palm Wine and local specialties.',
    category: 'bundle',
    discountPercentage: 20,
    startDate: new Date(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isActive: true,
    bannerImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Fashion Flash Sale',
    description: 'Limited time offer! Up to 30% off on selected fashion items. Traditional and modern styles available.',
    category: 'flash',
    discountPercentage: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isActive: true,
    bannerImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Home Essentials Deal',
    description: 'Transform your home! 15% off on home and living products. Make your space beautiful.',
    category: 'seasonal',
    discountPercentage: 15,
    startDate: new Date(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    isActive: true,
    bannerImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
  }
];

async function addOffers() {
  try {
    // First get all products
    const productsResponse = await axios.get('http://localhost:5000/api/products');
    const products = productsResponse.data.products;

    // Add products to each offer based on category
    const offersWithProducts = sampleOffers.map(offer => {
      let offerProducts = [];
      switch(offer.title) {
        case 'Weekend Fish Special':
          offerProducts = products.filter(p => p.category === 'Foodstuffs' && p.name.toLowerCase().includes('fish'));
          break;
        case 'Traditional Drinks Festival':
          offerProducts = products.filter(p => p.category === 'Drinks');
          break;
        case 'Fashion Flash Sale':
          offerProducts = products.filter(p => p.category === 'Fashion');
          break;
        case 'Home Essentials Deal':
          offerProducts = products.filter(p => p.category === 'Home & Living');
          break;
      }
      return {
        ...offer,
        products: offerProducts.map(p => p._id)
      };
    });

    // Add each offer
    for (const offer of offersWithProducts) {
      try {
        const formData = new FormData();
        Object.keys(offer).forEach(key => {
          if (key === 'products') {
            formData.append(key, JSON.stringify(offer[key]));
          } else if (key === 'startDate' || key === 'endDate') {
            formData.append(key, offer[key].toISOString());
          } else {
            formData.append(key, offer[key]);
          }
        });

        const response = await axios.post('http://localhost:5000/api/offers', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${process.env.ADMIN_TOKEN || localStorage.getItem('adminToken')}`
          }
        });
        console.log(`Added offer: ${offer.title}`);
      } catch (error) {
        console.error(`Failed to add offer ${offer.title}:`, error.message);
      }
    }

    console.log('Finished adding offers');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addOffers(); 