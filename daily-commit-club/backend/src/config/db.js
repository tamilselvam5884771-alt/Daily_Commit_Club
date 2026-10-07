import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    logger.error('DATABASE', 'MONGODB_URI environment variable is missing');
    throw new Error('MONGODB_URI environment variable is missing');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    logger.info('DATABASE', `MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error('DATABASE', 'MongoDB connection error', error);
    throw error;
  }
};

