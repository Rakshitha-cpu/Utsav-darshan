import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    tagline: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    culturalHighlights: [String],
    popularCategories: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('City', citySchema);
