const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, category, images, stock } = req.body;

    // Validate multilingual fields
    if (!title.en || !title.pt || !description.en || !description.pt) {
      return res.status(400).json({
        error: 'Both English and Portuguese translations are required for title and description'
      });
    }

    const product = new Product({
      title,
      description,
      price,
      category,
      images,
      stock
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server error while creating product' });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching products' });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, category, images, stock } = req.body;

    // Validate multilingual fields if they are being updated
    if (title && (!title.en || !title.pt)) {
      return res.status(400).json({
        error: 'Both English and Portuguese translations are required for title'
      });
    }
    if (description && (!description.en || !description.pt)) {
      return res.status(400).json({
        error: 'Both English and Portuguese translations are required for description'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update only the fields that are provided
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (images) product.images = images;
    if (typeof stock !== 'undefined') product.stock = stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server error while updating product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting product' });
  }
}; 