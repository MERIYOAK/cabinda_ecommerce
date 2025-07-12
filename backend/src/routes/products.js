const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { uploadToS3 } = require('../config/s3');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

// Valid categories
const VALID_CATEGORIES = ['Foodstuffs', 'Household', 'Beverages', 'Electronics', 'Construction Materials', 'Plastics', 'Cosmetics', 'Powder Detergent', 'Liquid Detergent', 'Juices', 'Dental Care', 'Beef'];

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// Public Routes
// Get all products with optional filters
router.get('/public', async (req, res) => {
  try {
    const { category, sort, limit } = req.query;
    let query = Product.find();

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
        case 'name':
          query = query.sort('name');
          break;
        default:
          query = query.sort('-createdAt');
      }
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query.lean().exec();
    // Remove price from each product
    const productsNoPrice = products.map(({ price, ...rest }) => rest);
    res.json({ products: productsNoPrice });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product by ID (public)
router.get('/public/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected Admin Routes
// Get all products
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      imageUrl = await uploadToS3(req.file, fileName);
    } else {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const category = req.body.category;
    const normalizedCategory = VALID_CATEGORIES.find(
      validCat => validCat.toLowerCase() === category.toLowerCase()
    );
    if (!normalizedCategory) {
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` 
      });
    }

    // Handle multilingual fields
    const productData = {
      name: {
        pt: req.body.name_pt,
        en: req.body.name_en
      },
      description: {
        pt: req.body.description_pt,
        en: req.body.description_en
      },
      price: parseFloat(req.body.price),
      category: normalizedCategory,
      imageUrl: imageUrl
    };

    const product = new Product(productData);
    const savedProduct = await product.save();
    res.status(201).json({ product: savedProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let imageUrl = product.imageUrl;
    if (req.file) {
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      imageUrl = await uploadToS3(req.file, fileName);
    }

    // Handle multilingual fields
    const updateData = {
      name: {
        pt: req.body.name_pt,
        en: req.body.name_en
      },
      description: {
        pt: req.body.description_pt,
        en: req.body.description_en
      },
      price: parseFloat(req.body.price),
      category: req.body.category,
      imageUrl: imageUrl
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.remove();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 