import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User.js';
import { DailyActivity } from '../models/DailyActivity.js';
import { Building } from '../models/Building.js';
import { logger } from '../utils/logger.js';

export const cleanMockUsers = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/daily_commit_club';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  const mockUsernames = ['alpha_dev', 'beta_dev', 'coffee_dev', 'HARIHARASUDHAN-R', 'hariharasudhan r (mock)'];

  // Find users to remove
  const mockUsers = await User.find({
    $or: [
      { githubUsername: { $in: mockUsernames } },
      { name: { $regex: /mock|alpha dev|beta dev|coffee dev/i } }
    ]
  });

  const mockUserIds = mockUsers.map((u) => u._id);

  logger.info('CLEANUP', `Found ${mockUsers.length} mock accounts to remove.`);

  if (mockUserIds.length > 0) {
    // Delete DailyActivity for mock users
    const deletedActivities = await DailyActivity.deleteMany({ userId: { $in: mockUserIds } });
    logger.info('CLEANUP', `Removed ${deletedActivities.deletedCount} activity record(s).`);

    // Reset Building ownership for mock users
    const updatedBuildings = await Building.updateMany(
      { ownerId: { $in: mockUserIds } },
      { $set: { ownerId: null } }
    );
    logger.info('CLEANUP', `Unassigned ${updatedBuildings.modifiedCount} building(s).`);

    // Delete Users
    const deletedUsers = await User.deleteMany({ _id: { $in: mockUserIds } });
    logger.info('CLEANUP', `Successfully deleted ${deletedUsers.deletedCount} mock user account(s).`);
  }

  const remainingUsers = await User.find({}).select('name githubUsername githubUrl currentStreak');
  logger.info('CLEANUP', `Remaining members in database (${remainingUsers.length}):`);
  remainingUsers.forEach((u) => {
    logger.info('CLEANUP', ` - ${u.name} (@${u.githubUsername}) | Streak: ${u.currentStreak}`);
  });
};

if (process.argv[1] && process.argv[1].includes('cleanMockUsers.js')) {
  cleanMockUsers().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
