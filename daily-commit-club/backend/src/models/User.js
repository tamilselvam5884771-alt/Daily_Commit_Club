import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    displayName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    githubProfileUrl: {
      type: String,
      required: true,
      trim: true
    },
    githubUsername: {
      type: String,
      required: true,
      unique: true,
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
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpire: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
