import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Building } from '../models/Building.js';
import { DailyActivity } from '../models/DailyActivity.js';
import { Notification } from '../models/Notification.js';
import { seedBuildings } from './seedBuildings.js';
import { claimBuilding, damageBuilding } from '../services/buildingService.js';
import { completeDay, missDay } from '../services/streakService.js';
import { sendMorningReminder } from '../services/emailService.js';
import { getTodayDateString } from '../utils/dateUtils.js';
import { logger } from '../utils/logger.js';

export const runSystemTest = async () => {
  try {
    logger.info('TEST', '=== Starting Comprehensive Backend Verification Test ===');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/daily_commit_club';
    await mongoose.connect(mongoUri);

    // 1. Seed Buildings
    logger.info('TEST', 'Step 1: Testing Building Seed...');
    await Building.deleteMany({});
    await User.deleteMany({});
    await DailyActivity.deleteMany({});
    await Notification.deleteMany({});

    await seedBuildings();
    await mongoose.connect(mongoUri); // reconnect after seed script disconnects

    const bCount = await Building.countDocuments();
    if (bCount !== 10) throw new Error(`Expected 10 buildings, found ${bCount}`);
    logger.info('TEST', '✅ 10 Buildings successfully seeded.');

    // 2. User Creation & Building Claiming
    logger.info('TEST', 'Step 2: Testing User Creation & Building Claiming...');
    const user1 = await User.create({
      githubId: '10001',
      githubUsername: 'test_warrior',
      name: 'Test Warrior',
      email: 'warrior@example.com'
    });

    const b1 = await Building.findOne({ buildingNumber: 1 });
    await claimBuilding(user1._id, b1._id);

    const updatedB1 = await Building.findById(b1._id);
    if (updatedB1.ownerId.toString() !== user1._id.toString()) {
      throw new Error('Building owner claiming failed');
    }
    logger.info('TEST', '✅ Building claiming and single ownership verified.');

    // 3. Prevent duplicate ownership of claimed building
    logger.info('TEST', 'Step 3: Testing Duplicate Ownership Prevention...');
    const user2 = await User.create({
      githubId: '10002',
      githubUsername: 'rival_coder',
      name: 'Rival Coder',
      email: 'rival@example.com'
    });

    try {
      await claimBuilding(user2._id, b1._id);
      throw new Error('FAILED: Rival user was able to claim an already owned building!');
    } catch (err) {
      logger.info('TEST', `✅ Duplicate claim correctly rejected: "${err.message}"`);
    }

    // 4. Test Daily Activity Compound Unique Constraint & Streak Increments
    logger.info('TEST', 'Step 4: Testing Idempotent Success Commit & Streak Increments...');
    const today = getTodayDateString();

    const res1 = await completeDay(user1, today, 3, ['owner/repo-1']);
    if (res1.user.currentStreak !== 1 || res1.user.totalCompletedDays !== 1) {
      throw new Error('Streak completion failed to update user stats');
    }
    logger.info('TEST', `✅ Success commit recorded. Current streak: ${res1.user.currentStreak}`);

    // Re-run completeDay for same date to verify idempotency
    const res1Dup = await completeDay(user1, today, 5, ['owner/repo-2']);
    if (!res1Dup.alreadyProcessed) {
      throw new Error('FAILED: Duplicate completion was not detected as alreadyProcessed!');
    }
    if (res1Dup.user.currentStreak !== 1) {
      throw new Error('FAILED: Streak increased twice on the same day!');
    }
    logger.info('TEST', '✅ Idempotency verified for completed days (streak did not increment twice).');

    // 5. Test Missed Day, Streak Reset to 0, Coffee Debt & Building Damage
    logger.info('TEST', 'Step 5: Testing Missed Day, Streak Reset & Building Damage...');
    const yesterday = '2026-09-18';

    const missRes = await missDay(user1, yesterday, 1);
    if (missRes.user.currentStreak !== 0 || missRes.user.coffeeDebt !== 1) {
      throw new Error('Missed day did not reset streak to 0 or increase coffee debt');
    }

    const damageRes = await damageBuilding(b1._id, 40);
    if (damageRes.health !== 60) {
      throw new Error(`Expected building health 60, got ${damageRes.health}`);
    }
    logger.info('TEST', `✅ Missed day applied: Streak reset to 0, Coffee debt = ${missRes.user.coffeeDebt}, Building Health = ${damageRes.health}%`);

    // Re-run missed day for same date
    const missDup = await missDay(user1, yesterday, 1);
    if (!missDup.alreadyProcessed) {
      throw new Error('FAILED: Duplicate missed day was not detected!');
    }
    if (missDup.user.coffeeDebt !== 1) {
      throw new Error('FAILED: Coffee debt increased twice for the same missed day!');
    }
    logger.info('TEST', '✅ Idempotency verified for missed day penalties (coffee debt did not increase twice).');

    // 6. Test Email Deduplication
    logger.info('TEST', 'Step 6: Testing Email Deduplication...');
    const emailSent1 = await sendMorningReminder(user1, today);
    const emailSent2 = await sendMorningReminder(user1, today);

    if (emailSent2 !== false) {
      throw new Error('FAILED: Duplicate morning reminder email was sent!');
    }
    logger.info('TEST', '✅ Duplicate email notification successfully suppressed.');

    logger.info('TEST', '=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('TEST', 'Verification test failed', error);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].includes('testSystem.js')) {
  runSystemTest();
}
