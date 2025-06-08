const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const multer = require('multer');
const { uploadToS3, deleteFromS3 } = require('../config/s3');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

// Valid categories
const VALID_CATEGORIES = ['Promotion', 'New Arrival', 'Stock Update', 'Event', 'News'];

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

// Helper function to extract S3 key from URL
const getS3KeyFromUrl = (url) => {
  try {
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // returns "products/filename.ext"
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
};

// Public Routes
// Get latest announcements (limited) with filtering
router.get('/public', async (req, res) => {
  try {
    const { 
      limit = 5, 
      category, 
      isImportant,
      search 
    } = req.query;

    // Build query
    let query = { active: true };
    
    if (category) {
      const normalizedCategory = VALID_CATEGORIES.find(
        validCat => validCat.toLowerCase() === category.toLowerCase()
      );
      if (normalizedCategory) {
        query.category = normalizedCategory;
      }
    }

    if (isImportant === 'true') {
      query.isImportant = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const announcements = await Announcement.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit));
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single announcement by ID (public)
router.get('/public/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected Admin Routes
// Get all announcements with filtering and search
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { 
      category, 
      isImportant, 
      active,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = {};
    
    if (category) {
      const normalizedCategory = VALID_CATEGORIES.find(
        validCat => validCat.toLowerCase() === category.toLowerCase()
      );
      if (normalizedCategory) {
        query.category = normalizedCategory;
      }
    }

    if (isImportant === 'true' || isImportant === 'false') {
      query.isImportant = isImportant === 'true';
    }

    if (active === 'true' || active === 'false') {
      query.active = active === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Announcement.countDocuments(query)
    ]);

    res.json({
      announcements,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new announcement
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    // Upload image to S3 if provided
    let imageUrl = '';
    if (req.file) {
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      imageUrl = await uploadToS3(req.file, fileName);
    } else {
      return res.status(400).json({ message: 'Announcement image is required' });
    }

    // Validate category
    const category = req.body.category;
    const normalizedCategory = VALID_CATEGORIES.find(
      validCat => validCat.toLowerCase() === category.toLowerCase()
    );
    
    if (!normalizedCategory) {
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` 
      });
    }

    const announcementData = {
      title: req.body.title,
      content: req.body.content,
      category: normalizedCategory,
      imageUrl: imageUrl,
      isImportant: req.body.isImportant === 'true',
      active: true
    };

    const announcement = new Announcement(announcementData);
    const savedAnnouncement = await announcement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(400).json({ message: error.message });
  }
});

// Batch create announcements
router.post('/batch', verifyToken, isAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const announcements = JSON.parse(req.body.announcements);
    const files = req.files;

    if (!Array.isArray(announcements) || announcements.length === 0) {
      return res.status(400).json({ message: 'No announcements provided' });
    }

    if (!files || files.length !== announcements.length) {
      return res.status(400).json({ message: 'Number of images must match number of announcements' });
    }

    const savedAnnouncements = await Promise.all(
      announcements.map(async (announcement, index) => {
        const file = files[index];
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const imageUrl = await uploadToS3(file, fileName);

        const normalizedCategory = VALID_CATEGORIES.find(
          validCat => validCat.toLowerCase() === announcement.category.toLowerCase()
        );

        if (!normalizedCategory) {
          throw new Error(`Invalid category for announcement ${index + 1}`);
        }

        const announcementData = {
          title: announcement.title,
          content: announcement.content,
          category: normalizedCategory,
          imageUrl: imageUrl,
          isImportant: announcement.isImportant === true,
          active: true
        };

        const newAnnouncement = new Announcement(announcementData);
        return newAnnouncement.save();
      })
    );

    res.status(201).json(savedAnnouncements);
  } catch (error) {
    console.error('Error creating batch announcements:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update announcement
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Handle image upload if new image is provided
    let imageUrl = announcement.imageUrl;
    if (req.file) {
      // Delete old image from S3
      const oldImageKey = getS3KeyFromUrl(announcement.imageUrl);
      if (oldImageKey) {
        try {
          await deleteFromS3(oldImageKey);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Upload new image
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      imageUrl = await uploadToS3(req.file, fileName);
    }

    // Validate category if provided
    let normalizedCategory = announcement.category;
    if (req.body.category) {
      normalizedCategory = VALID_CATEGORIES.find(
        validCat => validCat.toLowerCase() === req.body.category.toLowerCase()
      );
      
      if (!normalizedCategory) {
        return res.status(400).json({ 
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` 
        });
      }
    }

    const updateData = {
      title: req.body.title || announcement.title,
      content: req.body.content || announcement.content,
      category: normalizedCategory,
      imageUrl: imageUrl,
      isImportant: req.body.isImportant === 'true',
      active: req.body.active === 'false' ? false : true
    };

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(400).json({ message: error.message });
  }
});

// Batch update announcements (status only)
router.put('/batch/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ids, active } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No announcement IDs provided' });
    }

    const result = await Announcement.updateMany(
      { _id: { $in: ids } },
      { $set: { active: active === true } }
    );

    res.json({ 
      message: `Updated ${result.modifiedCount} announcements`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating batch announcements:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete announcement
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Delete image from S3
    const imageKey = getS3KeyFromUrl(announcement.imageUrl);
    if (imageKey) {
      try {
        await deleteFromS3(imageKey);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
      }
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: error.message });
  }
});

// Batch delete announcements
router.delete('/batch', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No announcement IDs provided' });
    }

    const announcements = await Announcement.find({ _id: { $in: ids } });

    // Delete images from S3
    await Promise.all(
      announcements.map(async (announcement) => {
        const imageKey = getS3KeyFromUrl(announcement.imageUrl);
        if (imageKey) {
          try {
            await deleteFromS3(imageKey);
          } catch (error) {
            console.error(`Error deleting image for announcement ${announcement._id}:`, error);
          }
        }
      })
    );

    // Delete announcements
    const result = await Announcement.deleteMany({ _id: { $in: ids } });

    res.json({ 
      message: `Deleted ${result.deletedCount} announcements`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting batch announcements:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 