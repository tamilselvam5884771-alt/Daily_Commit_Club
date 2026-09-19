import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Building } from '../models/Building.js';
import { logger } from '../utils/logger.js';

const BUILDINGS_PRESETS = [
  {
    buildingNumber: 1,
    name: 'Amber Citadel',
    theme: 'Amber',
    primaryColor: '#f59e0b',
    secondaryColor: '#78350f',
    structure: 'Spire Fortress',
    position: { x: 100, y: 150 }
  },
  {
    buildingNumber: 2,
    name: 'Emerald Sanctuary',
    theme: 'Emerald',
    primaryColor: '#10b981',
    secondaryColor: '#064e3b',
    structure: 'Bio Dome Tower',
    position: { x: 250, y: 150 }
  },
  {
    buildingNumber: 3,
    name: 'Burgundy Keep',
    theme: 'Burgundy',
    primaryColor: '#9f1239',
    secondaryColor: '#4c0519',
    structure: 'Gothic Watchtower',
    position: { x: 400, y: 150 }
  },
  {
    buildingNumber: 4,
    name: 'Sapphire Obelisk',
    theme: 'Sapphire',
    primaryColor: '#2563eb',
    secondaryColor: '#1e3a8a',
    structure: 'Crystalline Prism',
    position: { x: 550, y: 150 }
  },
  {
    buildingNumber: 5,
    name: 'Violet Academy',
    theme: 'Violet',
    primaryColor: '#7c3aed',
    secondaryColor: '#4c1d95',
    structure: 'Arcane Observatorium',
    position: { x: 700, y: 150 }
  },
  {
    buildingNumber: 6,
    name: 'Copper Foundry',
    theme: 'Copper',
    primaryColor: '#d97706',
    secondaryColor: '#451a03',
    structure: 'Steampunk Colossus',
    position: { x: 100, y: 350 }
  },
  {
    buildingNumber: 7,
    name: 'Teal Monolith',
    theme: 'Teal',
    primaryColor: '#0d9488',
    secondaryColor: '#134e4a',
    structure: 'Cybernetic Array',
    position: { x: 250, y: 350 }
  },
  {
    buildingNumber: 8,
    name: 'Crimson Bastion',
    theme: 'Crimson',
    primaryColor: '#dc2626',
    secondaryColor: '#7f1d1d',
    structure: 'Warlord Outpost',
    position: { x: 400, y: 350 }
  },
  {
    buildingNumber: 9,
    name: 'Forest Grove Tower',
    theme: 'Forest',
    primaryColor: '#16a34a',
    secondaryColor: '#14532d',
    structure: 'Ancient Treehouse Keep',
    position: { x: 550, y: 350 }
  },
  {
    buildingNumber: 10,
    name: 'Indigo Zenith',
    theme: 'Indigo',
    primaryColor: '#4f46e5',
    secondaryColor: '#1e1b4b',
    structure: 'Starlight Apex',
    position: { x: 700, y: 350 }
  }
];

export const seedBuildings = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/daily_commit_club';
    if (mongoose.connection.readyState === 0) {
      logger.info('SEED', `Connecting to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri);
    }

    logger.info('SEED', 'Seeding/Updating 10 Preset Buildings...');

    for (const bData of BUILDINGS_PRESETS) {
      await Building.findOneAndUpdate(
        { buildingNumber: bData.buildingNumber },
        {
          $setOnInsert: {
            health: 100,
            maxHealth: 100,
            destroyed: false,
            destructionCount: 0,
            ownerId: null
          },
          $set: {
            name: bData.name,
            theme: bData.theme,
            primaryColor: bData.primaryColor,
            secondaryColor: bData.secondaryColor,
            structure: bData.structure,
            position: bData.position
          }
        },
        { upsert: true, new: true }
      );
    }

    const count = await Building.countDocuments();
    logger.info('SEED', `Successfully seeded/verified ${count} buildings in MongoDB! No duplicate buildings created.`);
  } catch (error) {
    logger.error('SEED', 'Failed to seed buildings', error);
    throw error;
  }
};

// Execute if run directly from command line
if (process.argv[1] && process.argv[1].includes('seedBuildings.js')) {
  seedBuildings().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
