require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Product = require('../models/Product');

const addSampleOffers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all products to use in offers
    const products = await Product.find();
    if (products.length === 0) {
      console.log('Please run addSampleProducts.js first to create products');
      process.exit(1);
    }

    // Clear existing offers
    await Offer.deleteMany({});
    console.log('Cleared existing offers');

    const currentDate = new Date();
    const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sampleOffers = [
      {
        title: {
          pt: 'Especial de Peixe no Fim de Semana',
          en: 'Weekend Fish Special'
        },
        description: {
          pt: 'Obtenha 25% de desconto na nossa seleção mais fresca de peixe! Direto da costa de Cabinda para a sua mesa.',
          en: 'Get 25% off on our freshest fish selection! Direct from Cabinda\'s coast to your table.'
        },
        category: 'seasonal',
        discountPercentage: 25,
        products: products.filter(p => p.category === 'Foodstuffs' && p.name.toLowerCase().includes('fish')).map(p => p._id),
        startDate: currentDate,
        endDate: nextWeek,
        isActive: true,
        bannerImage: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: {
          pt: 'Festival de Bebidas Tradicionais',
          en: 'Traditional Drinks Festival'
        },
        description: {
          pt: 'Celebre connosco! 20% de desconto em todas as bebidas tradicionais incluindo Vinho de Palmeira e especialidades locais.',
          en: 'Celebrate with us! 20% off on all traditional drinks including Palm Wine and local specialties.'
        },
        category: 'bundle',
        discountPercentage: 20,
        products: products.filter(p => p.category === 'Drinks').map(p => p._id),
        startDate: currentDate,
        endDate: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        isActive: true,
        bannerImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: {
          pt: 'Liquidação Flash de Moda',
          en: 'Fashion Flash Sale'
        },
        description: {
          pt: 'Oferta por tempo limitado! Até 30% de desconto em artigos de moda selecionados. Estilos tradicionais e modernos disponíveis.',
          en: 'Limited time offer! Up to 30% off on selected fashion items. Traditional and modern styles available.'
        },
        category: 'flash',
        discountPercentage: 30,
        products: products.filter(p => p.category === 'Fashion').map(p => p._id),
        startDate: currentDate,
        endDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        isActive: true,
        bannerImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: {
          pt: 'Oferta de Produtos Essenciais para Casa',
          en: 'Home Essentials Deal'
        },
        description: {
          pt: 'Transforme a sua casa! 15% de desconto em produtos para casa e vida. Torne o seu espaço bonito.',
          en: 'Transform your home! 15% off on home and living products. Make your space beautiful.'
        },
        category: 'seasonal',
        discountPercentage: 15,
        products: products.filter(p => p.category === 'Home & Living').map(p => p._id),
        startDate: currentDate,
        endDate: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        isActive: true,
        bannerImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
      }
    ];

    // Add sample offers
    const offers = await Offer.insertMany(sampleOffers);
    console.log('Added sample offers:', offers.length);

    console.log('\nSample offers added successfully! Here are the details:');
    offers.forEach(offer => {
      console.log(`\nTitle (PT): ${offer.title.pt}`);
      console.log(`Title (EN): ${offer.title.en}`);
      console.log(`Category: ${offer.category}`);
      console.log(`Discount: ${offer.discountPercentage}%`);
      console.log(`Status: ${offer.isActive ? 'Active' : 'Inactive'}`);
      console.log(`Period: ${offer.startDate.toLocaleDateString()} - ${offer.endDate.toLocaleDateString()}`);
      console.log(`Products: ${offer.products.length}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample offers:', error);
    process.exit(1);
  }
};

addSampleOffers(); 