import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['MORNING_REMINDER', 'LAST_CHANCE', 'SUCCESS', 'MISSED_COMMIT', 'STREAK_MILESTONE'],
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index to efficiently check if notification was sent today
notificationSchema.index({ userId: 1, type: 1, 'metadata.date': 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
