import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Daily Commit Club'
    },
    description: {
      type: String,
      default: 'Keep your building alive by submitting at least one GitHub commit every challenge day.'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    dailyDeadline: {
      type: String,
      default: '23:59'
    },
    minimumCommits: {
      type: Number,
      default: 1
    },
    penaltyType: {
      type: String,
      default: 'coffee'
    },
    penaltyAmount: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'draft'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Challenge = mongoose.model('Challenge', challengeSchema);
