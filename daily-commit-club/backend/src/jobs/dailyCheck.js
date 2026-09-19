import cron from 'node-cron';
import { Challenge } from '../models/Challenge.js';
import { User } from '../models/User.js';
import { DailyActivity } from '../models/DailyActivity.js';
import { getTodayCommitActivity, hasQualifyingCommit } from '../services/githubService.js';
import { completeDay, missDay } from '../services/streakService.js';
import { keepBuildingAlive, damageBuilding } from '../services/buildingService.js';
import { sendSuccessEmail, sendMissedCommitEmail, sendStreakMilestoneEmail } from '../services/emailService.js';
import { getTodayDateString } from '../utils/dateUtils.js';
import { logger } from '../utils/logger.js';

/**
 * Core Daily Monitoring logic evaluating commit activity for all active members.
 * Can be executed manually via dev endpoint or automatically via cron.
 * 
 * @param {string|null} overrideDate YYYY-MM-DD override for testing
 * @param {string|null} targetUserId Optional specific user ID override
 */
export const runDailyCheck = async (overrideDate = null, targetUserId = null) => {
  logger.info('SCHEDULER', `--- Starting Daily Commit Check ---`);

  // 1. Find active challenge
  const activeChallenge = await Challenge.findOne({ status: 'active' });
  const timezone = activeChallenge ? activeChallenge.timezone : 'Asia/Kolkata';
  const minimumCommits = activeChallenge ? activeChallenge.minimumCommits : 1;
  const penaltyAmount = activeChallenge ? activeChallenge.penaltyAmount : 1;

  const dateStr = overrideDate || getTodayDateString(timezone);
  logger.info('SCHEDULER', `Evaluating challenge date: ${dateStr} (Timezone: ${timezone})`);

  // 2. Find active members
  const query = { isActive: true };
  if (targetUserId) query._id = targetUserId;

  const members = await User.find(query).populate('buildingId');
  logger.info('SCHEDULER', `Processing ${members.length} active member(s)...`);

  const results = [];

  for (const user of members) {
    try {
      logger.info('SCHEDULER', `Checking activity for member @${user.githubUsername}`);

      // 4. Fetch GitHub Activity
      const activityResult = await getTodayCommitActivity(user.githubUsername, dateStr);

      // CRITICAL RULE: DO NOT treat GitHub API network/auth failures as a missed commit!
      if (!activityResult.success && activityResult.isApiError) {
        logger.error('SCHEDULER', `Skipping @${user.githubUsername} due to GitHub API error: ${activityResult.error}. Will retry on next check.`);
        results.push({
          user: user.githubUsername,
          status: 'error',
          reason: 'GitHub API Communication Failure',
          error: activityResult.error
        });
        continue;
      }

      const isQualifying = hasQualifyingCommit(activityResult, minimumCommits);

      if (isQualifying) {
        // 5 & 6. Update Streak & DailyActivity (Completed)
        const { activity, user: updatedUser, alreadyProcessed } = await completeDay(
          user,
          dateStr,
          activityResult.commitCount,
          activityResult.repositories
        );

        // 7. Keep Building Alive
        let buildingState = null;
        if (user.buildingId) {
          buildingState = await keepBuildingAlive(user.buildingId._id || user.buildingId);
        }

        // 9 & 10. Send Email & Record Notification
        if (!alreadyProcessed) {
          await sendSuccessEmail(updatedUser, dateStr, activityResult.commitCount, updatedUser.currentStreak);

          // Milestone check (e.g. 7, 30, 100 day streak)
          if ([7, 14, 30, 50, 100].includes(updatedUser.currentStreak)) {
            await sendStreakMilestoneEmail(updatedUser, updatedUser.currentStreak);
          }
        }

        results.push({
          user: user.githubUsername,
          status: 'completed',
          commitCount: activityResult.commitCount,
          streak: updatedUser.currentStreak,
          alreadyProcessed
        });
      } else {
        // 5 & 6. Update Streak & DailyActivity (Missed)
        const { activity, user: updatedUser, alreadyProcessed } = await missDay(user, dateStr, penaltyAmount);

        // 7. Damage Building
        let buildingState = {};
        if (user.buildingId) {
          buildingState = await damageBuilding(user.buildingId._id || user.buildingId);
        }

        // 9 & 10. Send Email & Record Notification
        if (!alreadyProcessed) {
          await sendMissedCommitEmail(updatedUser, dateStr, updatedUser.coffeeDebt, buildingState || {});
        }

        results.push({
          user: user.githubUsername,
          status: 'missed',
          coffeeDebt: updatedUser.coffeeDebt,
          buildingState,
          alreadyProcessed
        });
      }
    } catch (err) {
      logger.error('SCHEDULER', `Unexpected error checking user @${user.githubUsername}`, err);
      results.push({
        user: user.githubUsername,
        status: 'error',
        error: err.message
      });
    }
  }

  logger.info('SCHEDULER', `--- Daily Commit Check Completed ---`);
  return { date: dateStr, processedCount: results.length, results };
};

/**
 * Initializes the automated node-cron schedule for daily check
 */
export const initDailyCheckCron = () => {
  const cronSchedule = process.env.DAILY_CHECK_CRON || '59 23 * * *';
  const timezone = process.env.TIMEZONE || 'Asia/Kolkata';

  logger.info('SCHEDULER', `Registering Daily Check Cron: "${cronSchedule}" (${timezone})`);

  cron.schedule(
    cronSchedule,
    async () => {
      logger.info('SCHEDULER', 'Daily Check Cron triggered automatically');
      await runDailyCheck();
    },
    {
      timezone
    }
  );
};
