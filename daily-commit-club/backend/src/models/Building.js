import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema(
  {
    buildingNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 10
    },
    name: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      required: true
    },
    primaryColor: {
      type: String,
      required: true
    },
    secondaryColor: {
      type: String,
      required: true
    },
    structure: {
      type: String,
      required: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    health: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    maxHealth: {
      type: Number,
      default: 100
    },
    destroyed: {
      type: Boolean,
      default: false
    },
    destructionCount: {
      type: Number,
      default: 0
    },
    position: {
      type: mongoose.Schema.Types.Mixed,
      default: { x: 0, y: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Enforce single owner per building when claimed
buildingSchema.index({ ownerId: 1 }, { unique: true, sparse: true });

export const Building = mongoose.model('Building', buildingSchema);
