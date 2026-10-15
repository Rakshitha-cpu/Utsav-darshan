import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me/saved-events
router.get('/me/saved-events', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedEvents',
      match: { status: 'published' }
    });
    res.json({ success: true, savedEvents: user.savedEvents || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/me/submissions
router.get('/me/submissions', protect, async (req, res) => {
  try {
    const submissions = await Event.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
