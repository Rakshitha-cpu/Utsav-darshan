import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import EventReport from '../models/EventReport.js';
import ModerationLog from '../models/ModerationLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection & admin role check to all admin routes
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/dashboard (Dashboard statistics & aggregation)
router.get('/dashboard', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const pendingSubmissions = await Event.countDocuments({ status: 'pending' });
    const needsCorrection = await Event.countDocuments({ status: 'needs_correction' });
    const rejectedSubmissions = await Event.countDocuments({ status: 'rejected' });
    const openReports = await EventReport.countDocuments({ status: 'open' });
    const totalUsers = await User.countDocuments();

    // Aggregation: Events by City
    const eventsByCity = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Aggregation: Events by Category
    const eventsByCategory = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity logs
    const recentLogs = await ModerationLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalEvents,
        publishedEvents,
        pendingSubmissions,
        needsCorrection,
        rejectedSubmissions,
        openReports,
        totalUsers
      },
      charts: {
        eventsByCity: eventsByCity.map((c) => ({ city: c._id, count: c.count })),
        eventsByCategory: eventsByCategory.map((c) => ({ category: c._id, count: c.count }))
      },
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/submissions (Review queue)
router.get('/submissions', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = status === 'all' ? {} : { status };
    const submissions = await Event.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/events/:id/review (Approve, reject, request corrections, verify)
router.patch('/events/:id/review', async (req, res) => {
  try {
    const { action, reason, isVerified } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event listing not found' });
    }

    const previousStatus = event.status;
    let updatedStatus = previousStatus;

    if (action === 'approve') {
      updatedStatus = 'published';
      event.status = 'published';
      if (isVerified !== undefined) {
        event.isVerified = isVerified;
        if (isVerified) event.lastVerifiedDate = new Date();
      }
    } else if (action === 'reject') {
      updatedStatus = 'rejected';
      event.status = 'rejected';
      event.reviewNotes = reason || 'Does not meet verification guidelines';
    } else if (action === 'request_correction') {
      updatedStatus = 'needs_correction';
      event.status = 'needs_correction';
      event.reviewNotes = reason || 'Clarification or official evidence requested';
    } else if (action === 'archive') {
      updatedStatus = 'archived';
      event.status = 'archived';
    }

    await event.save();

    // Log moderation action
    await ModerationLog.create({
      administrator: req.user._id,
      adminName: req.user.name,
      event: event._id,
      eventName: event.name,
      action,
      previousStatus,
      updatedStatus,
      reason: reason || ''
    });

    res.json({
      success: true,
      message: `Event status successfully updated to ${updatedStatus}`,
      event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/events/:id (Edit listing directly)
router.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await ModerationLog.create({
      administrator: req.user._id,
      adminName: req.user.name,
      event: event._id,
      eventName: event.name,
      action: 'edit',
      previousStatus: event.status,
      updatedStatus: event.status,
      reason: 'Admin updated listing details'
    });

    res.json({ success: true, message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/events/:id
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Listing permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/reports (List reported issues)
router.get('/reports', async (req, res) => {
  try {
    const reports = await EventReport.find()
      .populate('event', 'name city venue startDate status')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/reports/:id
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await EventReport.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNotes },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report status updated', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
