const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const multer = require('multer');
const { uploadToS3, deleteFromS3 } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

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
        const productIds = offerObj.products.filter(id => id && typeof id === 'string');
        const products = await Product.find({ _id: { $in: productIds } });
        
        // Replace product IDs with full product objects
        offerObj.products = products.map(product => product.toObject());
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
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // Validate product IDs before creating offer
    if (req.body.products && Array.isArray(req.body.products)) {
      const validProducts = await Product.find({
        _id: { $in: req.body.products }
      });
      
      if (validProducts.length !== req.body.products.length) {
        return res.status(400).json({
          message: 'One or more product IDs are invalid'
        });
      }
    }

    const offer = new Offer(req.body);
    const savedOffer = await offer.save();
    
    // Populate and return the new offer
    const populatedOffer = await populateOfferProducts(savedOffer);
    res.status(201).json(populatedOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update offer
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // Validate product IDs if they're being updated
    if (req.body.products && Array.isArray(req.body.products)) {
      const validProducts = await Product.find({
        _id: { $in: req.body.products }
      });
      
      if (validProducts.length !== req.body.products.length) {
        return res.status(400).json({
          message: 'One or more product IDs are invalid'
        });
      }
    }

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Populate and return the updated offer
    const populatedOffer = await populateOfferProducts(offer);
    res.json(populatedOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete offer
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 