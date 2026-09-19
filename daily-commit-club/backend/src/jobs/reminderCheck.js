import cron from 'node-cron';
import { User } from '../models/User.js';
import { getTodayCommitActivity, hasQualifyingCommit } from '../services/githubService.js';
import { sendMorningReminder, sendLastChanceEmail } from '../services/emailService.js';
import { getTodayDateString } from '../utils/dateUtils.js';
import { logger } from '../utils/logger.js';

/**
 * Runs morning reminder pass for members who have not yet committed today
 */
export const runMorningReminders = async (overrideDate = null) => {
  const dateStr = overrideDate || getTodayDateString();
  logger.info('SCHEDULER', `Running Morning Reminders for ${dateStr}`);

  const members = await User.find({ isActive: true });
  let count = 0;

  for (const user of members) {
    const activity = await getTodayCommitActivity(user.githubUsername, dateStr);
    if (!hasQualifyingCommit(activity)) {
      const sent = await sendMorningReminder(user, dateStr);
      if (sent) count++;
    }
  }

  logger.info('SCHEDULER', `Morning Reminders sent to ${count} member(s).`);
  return { date: dateStr, count };
};

/**
 * Runs evening "last chance" warning pass for members who still haven't committed
 */
export const runLastChanceReminders = async (overrideDate = null) => {
  const dateStr = overrideDate || getTodayDateString();
  logger.info('SCHEDULER', `Running Last Chance Warnings for ${dateStr}`);

  const members = await User.find({ isActive: true });
  let count = 0;

  for (const user of members) {
    const activity = await getTodayCommitActivity(user.githubUsername, dateStr);
    if (!hasQualifyingCommit(activity)) {
      const sent = await sendLastChanceEmail(user, dateStr);
      if (sent) count++;
    }
  }

  logger.info('SCHEDULER', `Last Chance Warnings sent to ${count} member(s).`);
  return { date: dateStr, count };
};

/**
 * Initializes automated reminder crons
 */
export const initReminderCrons = () => {
  const timezone = process.env.TIMEZONE || 'Asia/Kolkata';
  const morningCron = process.env.MORNING_REMINDER_CRON || '0 9 * * *';
  const lastChanceCron = process.env.LAST_CHANCE_CRON || '0 21 * * *';

  logger.info('SCHEDULER', `Registering Morning Reminder Cron: "${morningCron}" (${timezone})`);
  cron.schedule(
    morningCron,
    async () => {
      await runMorningReminders();
    },
    { timezone }
  );

  logger.info('SCHEDULER', `Registering Last Chance Cron: "${lastChanceCron}" (${timezone})`);
  cron.schedule(
    lastChanceCron,
    async () => {
      await runLastChanceReminders();
    },
    { timezone }
  );
};
