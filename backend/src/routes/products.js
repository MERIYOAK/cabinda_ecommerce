const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
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

// Public Routes
// Get all products with optional filters
router.get('/public', async (req, res) => {
  try {
    const { category, sort, limit } = req.query;
    let query = Product.find({ stock: { $gt: 0 } }); // Only show products in stock

    if (category) {
      query = query.where('category').equals(category);
    }

    if (sort) {
      switch (sort) {
        case 'price_asc':
          query = query.sort('price');
          break;
        case 'price_desc':
          query = query.sort('-price');
          break;
        case 'newest':
        case '-createdAt':
          query = query.sort('-createdAt');
          break;
        case 'popular':
        case '-sales':
          query = query.sort('-sales');
          break;
        case 'name':
          query = query.sort('name');
          break;
        default:
          // If an invalid sort option is provided, default to newest
          query = query.sort('-createdAt');
      }
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query.exec();
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product by ID (public)
router.get('/public/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected Admin Routes
// Get all products (including out of stock)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json({ product: savedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 