import mongoose from 'mongoose';

const moderationLogSchema = new mongoose.Schema(
  {
    administrator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    adminName: {
      type: String,
      default: 'Admin'
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    eventName: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      enum: ['approve', 'reject', 'request_correction', 'mark_verified', 'archive', 'edit', 'cancel'],
      required: true
    },
    previousStatus: String,
    updatedStatus: String,
    reason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('ModerationLog', moderationLogSchema);
