import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required']
    },
    culturalSignificance: {
      type: String,
      default: ''
    },
    traditionsAndHighlights: [String],
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    venue: {
      name: { type: String, required: [true, 'Venue name is required'] },
      address: { type: String, required: [true, 'Venue address is required'] }
    },
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 }
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true
    },
    startTime: {
      type: String,
      default: '09:00 AM'
    },
    endTime: {
      type: String,
      default: '09:00 PM'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    images: {
      cover: { type: String, required: true },
      gallery: [String]
    },
    organizer: {
      name: { type: String, default: 'Community Organization' },
      contact: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' }
    },
    sourceUrl: {
      type: String,
      default: ''
    },
    verificationEvidence: {
      type: String,
      default: ''
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    contributorName: {
      type: String,
      default: 'Anonymous Citizen'
    },
    contributorContact: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'needs_correction', 'rejected', 'cancelled', 'archived'],
      default: 'pending',
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    lastVerifiedDate: {
      type: Date,
      default: null
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    cancellationNotice: {
      type: String,
      default: ''
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index for search and duplicate detection
eventSchema.index({ name: 'text', city: 'text', description: 'text' });
eventSchema.index({ city: 1, status: 1, startDate: 1 });
eventSchema.index({ category: 1, status: 1 });

export default mongoose.model('Event', eventSchema);
