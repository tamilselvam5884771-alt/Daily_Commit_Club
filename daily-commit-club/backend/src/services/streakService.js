import { User } from '../models/User.js';
import { DailyActivity } from '../models/DailyActivity.js';
import { logger } from '../utils/logger.js';

/**
 * Recalculates current user streak and statistics from database history
 */
export const calculateStreak = async (userId) => {
  const activities = await DailyActivity.find({ userId })
    .sort({ date: -1 })
    .lean();

  let streak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  let checkingCurrent = true;

  for (const act of activities) {
    if (act.status === 'completed') {
      tempStreak += 1;
      if (checkingCurrent) streak += 1;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else if (act.status === 'missed') {
      checkingCurrent = false;
      tempStreak = 0;
    }
  }

  return { currentStreak: streak, longestStreak: maxStreak };
};

/**
 * Handles logic when a user completes a challenge day.
 * Idempotent: checks if activity was already completed today.
 */
export const completeDay = async (user, dateStr, commitCount = 1, repositories = []) => {
  const existingActivity = await DailyActivity.findOne({ userId: user._id, date: dateStr });

  if (existingActivity && existingActivity.status === 'completed') {
    logger.info('STREAK', `@${user.githubUsername} already marked completed for ${dateStr}. Skipping duplicate completion.`);
    return { activity: existingActivity, user, alreadyProcessed: true };
  }

  const streakBefore = user.currentStreak;
  const streakAfter = streakBefore + 1;
  const longestStreak = Math.max(user.longestStreak || 0, streakAfter);

  // Update Daily Activity record
  const activity = await DailyActivity.findOneAndUpdate(
    { userId: user._id, date: dateStr },
    {
      userId: user._id,
      date: dateStr,
      commitCount,
      repositories,
      qualifyingCommit: true,
      status: 'completed',
      streakBefore,
      streakAfter,
      checkedAt: new Date()
    },
    { upsert: true, new: true }
  );

  // Update User statistics
  user.currentStreak = streakAfter;
  user.longestStreak = longestStreak;
  user.totalCompletedDays += 1;
  user.lastSuccessfulCommitDate = new Date();
  await user.save();

  logger.info('STREAK', `@${user.githubUsername} completed ${dateStr}! Streak increased: ${streakBefore} -> ${streakAfter}`);

  return { activity, user, alreadyProcessed: false };
};

/**
 * Handles logic when a user misses a challenge day.
 * Idempotent: checks if activity was already marked missed today.
 */
export const missDay = async (user, dateStr, penaltyAmount = 1) => {
  const existingActivity = await DailyActivity.findOne({ userId: user._id, date: dateStr });

  if (existingActivity && existingActivity.status === 'missed') {
    logger.info('STREAK', `@${user.githubUsername} already marked missed for ${dateStr}. Skipping duplicate penalty.`);
    return { activity: existingActivity, user, alreadyProcessed: true };
  }

  const streakBefore = user.currentStreak;
  const streakAfter = 0;

  // Update Daily Activity record
  const activity = await DailyActivity.findOneAndUpdate(
    { userId: user._id, date: dateStr },
    {
      userId: user._id,
      date: dateStr,
      commitCount: 0,
      repositories: [],
      qualifyingCommit: false,
      status: 'missed',
      streakBefore,
      streakAfter: 0,
      checkedAt: new Date()
    },
    { upsert: true, new: true }
  );

  // Update User statistics
  user.currentStreak = 0;
  user.totalMissedDays += 1;
  user.coffeeDebt += penaltyAmount;
  await user.save();

  logger.info('STREAK', `@${user.githubUsername} missed ${dateStr}. Streak reset to 0. Coffee debt increased by +${penaltyAmount} (Total: ${user.coffeeDebt}).`);

  return { activity, user, alreadyProcessed: false };
};

export const getLongestStreak = (user) => {
  return user.longestStreak || 0;
};
