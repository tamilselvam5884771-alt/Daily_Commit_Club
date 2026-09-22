import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    githubUrl: {
      type: String,
      required: true,
      trim: true
    },
    githubUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    githubId: {
      type: String,
      default: ''
    },
    githubAvatar: {
      type: String,
      default: ''
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    totalCompletedDays: {
      type: Number,
      default: 0,
      min: 0
    },
    totalMissedDays: {
      type: Number,
      default: 0,
      min: 0
    },
    coffeeDebt: {
      type: Number,
      default: 0,
      min: 0
    },
    lastSuccessfulCommitDate: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', userSchema);

