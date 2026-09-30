import express from 'express';
import { runDailyCheck } from '../jobs/dailyCheck.js';
import { runMorningReminders, runLastChanceReminders } from '../jobs/reminderCheck.js';

const router = express.Router();

/**
 * Authorization middleware for Cron routes.
 * Allows Vercel Cron header or CRON_SECRET token match if set.
 */
const verifyCronAuth = (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers['user-agent']?.includes('vercel-cron');
  const authHeader = req.headers['authorization'];
  const querySecret = req.query.secret;

  if (isVercelCron) {
    return next();
  }

  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret) {
      return next();
    }
    return res.status(401).json({ success: false, error: { message: 'Unauthorized Cron request' } });
  }

  next();
};

router.use(verifyCronAuth);

// Trigger daily check
router.get('/daily-check', async (req, res, next) => {
  try {
    const result = await runDailyCheck();
    return res.status(200).json({ success: true, message: 'Daily check completed', result });
  } catch (err) {
    next(err);
  }
});

// Trigger morning reminders
router.get('/morning-reminders', async (req, res, next) => {
  try {
    const result = await runMorningReminders();
    return res.status(200).json({ success: true, message: 'Morning reminders sent', result });
  } catch (err) {
    next(err);
  }
});

// Trigger last chance reminders
router.get('/last-chance-reminders', async (req, res, next) => {
  try {
    const result = await runLastChanceReminders();
    return res.status(200).json({ success: true, message: 'Last chance reminders sent', result });
  } catch (err) {
    next(err);
  }
});

export default router;
