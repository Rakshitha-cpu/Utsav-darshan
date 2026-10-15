import mongoose from 'mongoose';

const eventReportSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reporterEmail: {
      type: String,
      default: ''
    },
    reportType: {
      type: String,
      enum: ['outdated_date', 'incorrect_venue', 'cancelled', 'suspicious_listing', 'other'],
      required: true
    },
    description: {
      type: String,
      required: [true, 'Please provide description of the issue']
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'dismissed'],
      default: 'open'
    },
    resolutionNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('EventReport', eventReportSchema);
