import mongoose from 'mongoose';

const dailyActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String,
      required: true // Formatted as YYYY-MM-DD
    },
    commitCount: {
      type: Number,
      default: 0
    },
    repositories: [
      {
        name: { type: String, required: true },
        commits: { type: Number, default: 1 }
      }
    ],
    qualifyingCommit: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed'],
      default: 'pending'
    },
    streakBefore: {
      type: Number,
      default: 0
    },
    streakAfter: {
      type: Number,
      default: 0
    },
    checkedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring one activity record per user per day
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);
