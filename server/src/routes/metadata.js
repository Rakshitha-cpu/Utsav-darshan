import express from 'express';
import City from '../models/City.js';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/cities
router.get('/cities', async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: cities.length, cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cities/:slug
router.get('/cities/:slug', async (req, res) => {
  try {
    const city = await City.findOne({ slug: req.params.slug.toLowerCase() });
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    res.json({ success: true, city });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
