import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { initDailyCheckCron } from './jobs/dailyCheck.js';
import { initReminderCrons } from './jobs/reminderCheck.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize Scheduled Cron Jobs
  initDailyCheckCron();
  initReminderCrons();

  // Start HTTP Listener
  app.listen(PORT, () => {
    logger.info('SERVER', `🚀 Daily Commit Club Backend server running on http://localhost:${PORT}`);
    logger.info('SERVER', `Mode: ${process.env.NODE_ENV || 'development'} | Timezone: ${process.env.TIMEZONE || 'Asia/Kolkata'}`);
  });
};

startServer();
