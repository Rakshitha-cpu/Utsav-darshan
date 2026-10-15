import express from 'express';
import slugify from 'slugify';
import Event from '../models/Event.js';
import User from '../models/User.js';
import EventReport from '../models/EventReport.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/events (Public: only published events by default)
router.get('/', async (req, res) => {
  try {
    const { city, category, search, startDate, endDate, sort, isVerified, page = 1, limit = 20 } = req.query;

    const query = { status: 'published' };

    if (city && city !== 'All') {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    if (category && category !== 'All') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (isVerified === 'true') {
      query.isVerified = true;
    }

    if (startDate && endDate) {
      query.startDate = { $lte: new Date(endDate) };
      query.endDate = { $gte: new Date(startDate) };
    } else if (startDate) {
      query.endDate = { $gte: new Date(startDate) };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { 'venue.name': searchRegex },
        { culturalSignificance: searchRegex }
      ];
    }

    let sortOption = { startDate: 1 }; // default upcoming first
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'endDate') sortOption = { endDate: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/featured
router.get('/featured', async (req, res) => {
  try {
    const featured = await Event.find({ status: 'published', isFeatured: true }).limit(6);
    res.json({ success: true, events: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    let event;
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(param);
    } else {
      event = await Event.findOne({ slug: param });
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Related events in same city
    const related = await Event.find({
      _id: { $ne: event._id },
      city: event.city,
      status: 'published'
    }).limit(4);

    res.json({
      success: true,
      event,
      related
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events (Community Submission -> enters 'pending' review queue)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      culturalSignificance,
      traditionsAndHighlights,
      category,
      city,
      state,
      venue,
      coordinates,
      startDate,
      endDate,
      startTime,
      endTime,
      images,
      organizer,
      sourceUrl,
      verificationEvidence,
      contributorName,
      contributorContact
    } = req.body;

    if (!name || !description || !category || !city || !state || !venue?.name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory event fields' });
    }

    // Duplicate detection check: same name or normalized name in same city overlapping dates
    const normalizedName = name.trim().toLowerCase();
    const existingDuplicates = await Event.find({
      city: new RegExp(`^${city}$`, 'i'),
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    });

    const isProbableDuplicate = existingDuplicates.some(
      (ev) => ev.name.toLowerCase().includes(normalizedName) || normalizedName.includes(ev.name.toLowerCase())
    );

    // Generate unique slug
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const event = await Event.create({
      name,
      slug,
      description,
      culturalSignificance,
      traditionsAndHighlights: traditionsAndHighlights || [],
      category,
      city,
      state,
      venue: {
        name: venue.name,
        address: venue.address || `${venue.name}, ${city}`
      },
      coordinates: coordinates || { lat: 12.9716, lng: 77.5946 },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTime || '09:00 AM',
      endTime: endTime || '09:00 PM',
      images: {
        cover: images?.cover || 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
        gallery: images?.gallery || []
      },
      organizer: organizer || { name: 'Local Cultural Committee' },
      sourceUrl: sourceUrl || '',
      verificationEvidence: verificationEvidence || '',
      contributorName: contributorName || 'Community Contributor',
      contributorContact: contributorContact || '',
      status: 'pending', // MUST enter pending review queue
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'Event submitted successfully! It is now in the review queue for moderation.',
      duplicateWarning: isProbableDuplicate
        ? 'Notice: Similar celebrations found in this city during this timeframe. Our curation team will review details.'
        : null,
      event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events/:id/save (Bookmark/Save event for logged-in user)
router.post('/:id/save', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eventId = req.params.id;

    const isAlreadySaved = user.savedEvents.includes(eventId);

    if (isAlreadySaved) {
      user.savedEvents = user.savedEvents.filter((id) => id.toString() !== eventId);
      await user.save();
      return res.json({ success: true, saved: false, message: 'Event removed from saved list' });
    } else {
      user.savedEvents.push(eventId);
      await user.save();
      return res.json({ success: true, saved: true, message: 'Event saved to your cultural profile' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events/:id/report (Report incorrect info/cancelation)
router.post('/:id/report', async (req, res) => {
  try {
    const { reportType, description, reporterEmail } = req.body;
    const eventId = req.params.id;

    if (!reportType || !description) {
      return res.status(400).json({ success: false, message: 'Report type and description are required' });
    }

    const report = await EventReport.create({
      event: eventId,
      reportType,
      description,
      reporterEmail: reporterEmail || 'anonymous'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for helping keep our cultural calendar accurate! The report has been logged for admin review.',
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
