import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    githubUsername: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    displayName: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      index: true,
      default: ''
    },
    githubAvatar: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    animatedAvatar: {
      type: String,
      default: ''
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      default: null
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
