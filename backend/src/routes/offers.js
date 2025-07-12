const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const multer = require('multer');
const { uploadToS3, deleteFromS3 } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
    }
  }
});

// Helper function to populate and format offer data
const populateOfferProducts = async (offers) => {
  try {
    // If offers is a single offer, convert to array for consistent handling
    const offersArray = Array.isArray(offers) ? offers : [offers];
    
    // Populate products for all offers
    const populatedOffers = await Promise.all(offersArray.map(async (offer) => {
      // Convert offer to object if it's a mongoose document
      const offerObj = offer.toObject ? offer.toObject() : { ...offer };
      
      if (offerObj.products && Array.isArray(offerObj.products)) {
        // Fetch all products for this offer
        const productIds = offerObj.products.map(id => 
          id.toString ? id.toString() : id
        ).filter(id => id && typeof id === 'string');

        const products = await Product.find({ 
          _id: { $in: productIds } 
        }).lean();

        // Create a map for quick product lookup
        const productMap = products.reduce((map, product) => {
          map[product._id.toString()] = product;
          return map;
        }, {});

        // Maintain the order of products as in the offer
        offerObj.products = productIds
          .map(id => productMap[id])
          .filter(product => product); // Remove any null/undefined products
      } else {
        offerObj.products = [];
      }
      
      return offerObj;
    }));
    
    // Return array or single object based on input
    return Array.isArray(offers) ? populatedOffers : populatedOffers[0];
  } catch (error) {
    console.error('Error populating offer products:', error);
    throw error;
  }
};

// Public Routes
// Get active offers
router.get('/public/active', async (req, res) => {
  try {
    const currentDate = new Date();
    const offers = await Offer.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      isActive: true
    }).sort('endDate');

    // Populate product data
    const populatedOffers = await populateOfferProducts(offers);
    res.json(populatedOffers);
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single offer by ID (public)
router.get('/public/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Populate product data
    const populatedOffer = await populateOfferProducts(offer);
    res.json(populatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected Admin Routes
// Get all offers
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const offers = await Offer.find().sort('-createdAt');
    // Populate product data
    const populatedOffers = await populateOfferProducts(offers);
    res.json(populatedOffers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new offer
router.post('/', verifyToken, isAdmin, upload.single('bannerImage'), async (req, res) => {
  try {
    console.log('Received offer creation request');
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    console.log('Products in request:', req.body.products);
    console.log('Products[] in request:', req.body['products[]']);

    // Validate required multilingual fields
    if (!req.body.title_pt || !req.body.title_en || !req.body.description_pt || !req.body.description_en || 
        !req.body.discountPercentage || !req.body.startDate || !req.body.endDate || !req.file) {
      console.log('Missing required fields:', {
        title_pt: !req.body.title_pt,
        title_en: !req.body.title_en,
        description_pt: !req.body.description_pt,
        description_en: !req.body.description_en,
        discountPercentage: !req.body.discountPercentage,
        startDate: !req.body.startDate,
        endDate: !req.body.endDate,
        file: !req.file
      });
      return res.status(400).json({
        message: 'Missing required fields. Please provide title (Portuguese and English), description (Portuguese and English), discountPercentage, startDate, endDate, and bannerImage'
      });
    }

    // Validate products array
    const products = req.body.products || req.body['products[]'] || [];
    console.log('Products after initial processing:', products);
    
    const productIds = Array.isArray(products) ? products : [products];
    console.log('Product IDs after array conversion:', productIds);
    
    if (productIds.length === 0) {
      console.log('No products found in request');
      return res.status(400).json({
        message: 'At least one product must be selected for the offer'
      });
    }

    // Validate product IDs
    console.log('Validating product IDs:', productIds);
    const validProducts = await Product.find({
      _id: { $in: productIds }
    });
    console.log('Found valid products:', validProducts.map(p => p._id));
    
    if (validProducts.length !== productIds.length) {
      console.log('Invalid products found. Valid products:', validProducts.length, 'Expected:', productIds.length);
      return res.status(400).json({
        message: 'One or more product IDs are invalid'
      });
    }

    // Upload banner image to S3
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `offers/${uuidv4()}.${fileExtension}`;
    const bannerImageUrl = await uploadToS3(req.file, fileName);

    // Create offer object with multilingual fields
    const offerData = {
      title: {
        pt: req.body.title_pt,
        en: req.body.title_en
      },
      description: {
        pt: req.body.description_pt,
        en: req.body.description_en
      },
      category: req.body.category || 'seasonal',
      discountPercentage: Number(req.body.discountPercentage),
      products: productIds,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      isActive: req.body.isActive === 'true',
      bannerImage: bannerImageUrl
    };
    console.log('Creating offer with data:', offerData);

    const offer = new Offer(offerData);
    const savedOffer = await offer.save();
    console.log('Offer saved successfully:', savedOffer._id);
    
    // Populate and return the new offer
    const populatedOffer = await populateOfferProducts(savedOffer);
    res.status(201).json(populatedOffer);
  } catch (error) {
    console.error('Error creating offer:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ message: error.message });
  }
});

// Update offer
router.put('/:id', verifyToken, isAdmin, upload.single('bannerImage'), async (req, res) => {
  try {
    console.log('Updating offer:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Products in request:', req.body.products);
    console.log('Products[] in request:', req.body['products[]']);
    
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Validate required multilingual fields
    if (!req.body.title_pt || !req.body.title_en || !req.body.description_pt || !req.body.description_en || 
        !req.body.discountPercentage || !req.body.startDate || !req.body.endDate) {
      console.log('Missing required fields:', {
        title_pt: !req.body.title_pt,
        title_en: !req.body.title_en,
        description_pt: !req.body.description_pt,
        description_en: !req.body.description_en,
        discountPercentage: !req.body.discountPercentage,
        startDate: !req.body.startDate,
        endDate: !req.body.endDate
      });
      return res.status(400).json({
        message: 'Missing required fields. Please provide title (Portuguese and English), description (Portuguese and English), discountPercentage, startDate, and endDate'
      });
    }

    // Validate products array if provided
    let productIds = offer.products;
    if (req.body.products || req.body['products[]']) {
      const products = req.body.products || req.body['products[]'];
      productIds = Array.isArray(products) ? products : [products];
      
      console.log('Processing product IDs:', productIds);
      
      // Validate product IDs
      const validProducts = await Product.find({
        _id: { $in: productIds }
      });
      console.log('Found valid products:', validProducts.map(p => p._id));
      
      if (validProducts.length !== productIds.length) {
        console.log('Invalid products found. Valid products:', validProducts.length, 'Expected:', productIds.length);
        return res.status(400).json({
          message: 'One or more product IDs are invalid'
        });
      }
    }

    // Handle banner image update if provided
    let bannerImageUrl = offer.bannerImage;
    if (req.file) {
      // Delete old image from S3 if it exists
      if (offer.bannerImage) {
        const oldImageKey = offer.bannerImage.split('/').slice(-2).join('/');
        try {
          await deleteFromS3(oldImageKey);
        } catch (error) {
          console.error('Error deleting old banner image:', error);
        }
      }

      // Upload new image
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `offers/${uuidv4()}.${fileExtension}`;
      bannerImageUrl = await uploadToS3(req.file, fileName);
    }

    // Update offer data with multilingual fields
    const updateData = {
      title: {
        pt: req.body.title_pt,
        en: req.body.title_en
      },
      description: {
        pt: req.body.description_pt,
        en: req.body.description_en
      },
      category: req.body.category,
      discountPercentage: Number(req.body.discountPercentage),
      products: productIds,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      isActive: req.body.isActive === 'true',
      bannerImage: bannerImageUrl
    };

    console.log('Updating offer with data:', updateData);

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Populate and return the updated offer
    const populatedOffer = await populateOfferProducts(updatedOffer);
    console.log('Successfully updated offer:', populatedOffer._id);
    res.json(populatedOffer);
  } catch (error) {
    console.error('Error updating offer:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ message: error.message });
  }
});

// Delete offer
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Delete banner image from S3
    const imageKey = offer.bannerImage.split('/').slice(-2).join('/');
    try {
      await deleteFromS3(imageKey);
    } catch (error) {
      console.error('Error deleting banner image:', error);
    }

    await offer.deleteOne();
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 