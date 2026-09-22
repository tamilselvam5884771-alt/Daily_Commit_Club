import cron from 'node-cron';
import { Challenge } from '../models/Challenge.js';
import { User } from '../models/User.js';
import { getTodayCommitActivity, hasQualifyingCommit } from '../services/githubService.js';
import { completeDay, missDay } from '../services/streakService.js';
import { sendSuccessEmail, sendMissedCommitEmail, sendStreakMilestoneEmail } from '../services/emailService.js';
import { getTodayDateString } from '../utils/dateUtils.js';
import { logger } from '../utils/logger.js';

/**
 * Core Daily Monitoring logic evaluating commit activity for all active members.
 */
export const runDailyCheck = async (overrideDate = null, targetUserId = null) => {
  logger.info('SCHEDULER', `--- Starting Daily Commit Check ---`);

  const activeChallenge = await Challenge.findOne({ status: 'active' });
  const timezone = activeChallenge ? activeChallenge.timezone : 'Asia/Kolkata';
  const minimumCommits = activeChallenge ? activeChallenge.minimumCommits : 1;
  const penaltyAmount = activeChallenge ? activeChallenge.penaltyAmount : 1;

  const dateStr = overrideDate || getTodayDateString(timezone);
  logger.info('SCHEDULER', `Evaluating challenge date: ${dateStr} (Timezone: ${timezone})`);

  const query = { isActive: true };
  if (targetUserId) query._id = targetUserId;

  const members = await User.find(query);
  logger.info('SCHEDULER', `Processing ${members.length} active member(s)...`);

  const results = [];

  for (const user of members) {
    try {
      logger.info('SCHEDULER', `Checking activity for member @${user.githubUsername}`);

      const activityResult = await getTodayCommitActivity(user.githubUsername, dateStr);

      // CRITICAL RULE: DO NOT treat GitHub API failures as a missed commit!
      if (!activityResult.success || activityResult.errorType === 'GITHUB_API_ERROR') {
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
        const { activity, user: updatedUser, alreadyProcessed } = await completeDay(
          user,
          dateStr,
          activityResult.commitCount,
          activityResult.repositories
        );

        if (!alreadyProcessed) {
          await sendSuccessEmail(updatedUser, dateStr, activityResult.commitCount, updatedUser.currentStreak);

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
        const { activity, user: updatedUser, alreadyProcessed } = await missDay(user, dateStr, penaltyAmount);

        if (!alreadyProcessed) {
          await sendMissedCommitEmail(updatedUser, dateStr, updatedUser.coffeeDebt);
        }

        results.push({
          user: user.githubUsername,
          status: 'missed',
          coffeeDebt: updatedUser.coffeeDebt,
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
