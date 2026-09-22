import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { hasBeenNotifiedToday, recordNotification } from './notificationService.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || ''
    }
  });
};

const FROM_ADDRESS = process.env.EMAIL_FROM || '"Daily Commit Club" <no-reply@dailycommit.club>';

/**
 * Base HTML wrapper matching Dark Green Monolithic color system
 */
const wrapTemplate = (title, headerTag, bodyHtml) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #071C15; color: #B8D8C2; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #0B2A20; border-radius: 8px; border: 1px solid #103D2E; overflow: hidden; }
          .header { background: #103D2E; padding: 24px 20px; text-align: center; border-bottom: 1px solid #15533D; }
          .header h1 { margin: 0; font-size: 20px; color: #B8D8C2; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; }
          .header .subtitle { color: #1C6B4D; font-size: 12px; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; display: block; font-weight: 600; }
          .body { padding: 32px 24px; line-height: 1.6; font-size: 15px; color: #B8D8C2; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 4px; background: #103D2E; color: #B8D8C2; border: 1px solid #15533D; font-weight: 600; font-size: 13px; }
          .footer { background: #071C15; padding: 16px; text-align: center; font-size: 12px; color: #1C6B4D; border-top: 1px solid #103D2E; }
          .cta-btn { display: inline-block; padding: 12px 24px; background: #15533D; color: #B8D8C2; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; border: 1px solid #1C6B4D; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DAILY COMMIT CLUB</h1>
            <span class="subtitle">${headerTag}</span>
          </div>
          <div class="body">
            ${bodyHtml}
          </div>
          <div class="footer">
            <p>Commit every day. Keep your streak alive.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const sendEmail = async ({ user, type, subject, html, dateStr }) => {
  if (!user.email && !user.githubUrl) {
    logger.warn('EMAIL', `Skipping email for @${user.githubUsername}: No contact info provided.`);
    return false;
  }

  const recipientEmail = user.email || `${user.githubUsername}@users.noreply.github.com`;

  if (dateStr) {
    const alreadySent = await hasBeenNotifiedToday(user._id, type, dateStr);
    if (alreadySent) {
      logger.info('EMAIL', `Duplicate ${type} email suppressed for @${user.githubUsername} on ${dateStr}`);
      return false;
    }
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: recipientEmail,
      subject,
      html
    });

    logger.info('EMAIL', `${type} sent to ${recipientEmail} (MessageId: ${info.messageId})`);

    await recordNotification({
      userId: user._id,
      type,
      subject,
      email: recipientEmail,
      status: 'sent',
      metadata: { date: dateStr }
    });

    return true;
  } catch (error) {
    logger.error('EMAIL', `Failed to send ${type} to ${recipientEmail}`, error);
    await recordNotification({
      userId: user._id,
      type,
      subject,
      email: recipientEmail,
      status: 'failed',
      metadata: { date: dateStr, error: error.message }
    });
    return false;
  }
};

/**
 * Morning Email
 */
export const sendMorningReminder = async (user, dateStr) => {
  const subject = `Daily Commit Club — You haven't committed today`;
  const html = wrapTemplate(
    subject,
    'MORNING CHECK-IN',
    `
      <p>Hello <strong>${user.name}</strong> (@${user.githubUsername}),</p>
      <p>You haven't committed today yet. Keep your daily momentum going.</p>
      <p><span class="badge">Current Streak: ${user.currentStreak || 0} Days</span></p>
      <a href="https://github.com" class="cta-btn">Make a Commit on GitHub</a>
    `
  );

  return await sendEmail({ user, type: 'MORNING_REMINDER', subject, html, dateStr });
};

/**
 * Evening Email
 */
export const sendLastChanceEmail = async (user, dateStr) => {
  const subject = `Daily Commit Club — Your streak is waiting`;
  const html = wrapTemplate(
    subject,
    'EVENING REMINDER',
    `
      <p>Hey <strong>${user.name}</strong>,</p>
      <p>Your streak is waiting! No qualifying commit has been detected for <strong>${dateStr}</strong> yet.</p>
      <p>Commit before midnight to avoid adding to your coffee debt.</p>
      <a href="https://github.com" class="cta-btn">Push Commit Now</a>
    `
  );

  return await sendEmail({ user, type: 'LAST_CHANCE', subject, html, dateStr });
};

/**
 * Success Email
 */
export const sendSuccessEmail = async (user, dateStr, commitCount = 1, streak = 1) => {
  const subject = `Daily Commit Club — Your streak continues`;
  const html = wrapTemplate(
    subject,
    'STREAK MAINTAINED',
    `
      <p>Nice work, <strong>${user.name}</strong>!</p>
      <p>Your streak continues. We verified your commits for <strong>${dateStr}</strong>.</p>
      <p><span class="badge">🔥 Current Streak: ${streak} Days</span></p>
    `
  );

  return await sendEmail({ user, type: 'SUCCESS', subject, html, dateStr });
};

/**
 * Missed Email
 */
export const sendMissedCommitEmail = async (user, dateStr, coffeeDebt = 1) => {
  const subject = `Daily Commit Club — You missed today's challenge`;
  const html = wrapTemplate(
    subject,
    'CHALLENGE MISSED',
    `
      <p>Hey <strong>${user.name}</strong>,</p>
      <p>You missed today's challenge (${dateStr}).</p>
      <p>Your streak has been reset to 0 and 1 coffee debt has been added.</p>
      <p><span class="badge">☕ Total Coffee Debt: ${coffeeDebt}</span></p>
      <p>Start a new streak tomorrow!</p>
    `
  );

  return await sendEmail({ user, type: 'MISSED_COMMIT', subject, html, dateStr });
};

/**
 * Milestone Email
 */
export const sendStreakMilestoneEmail = async (user, streak) => {
  const subject = `Daily Commit Club — ${streak} Day Streak Milestone!`;
  const html = wrapTemplate(
    subject,
    'MILESTONE REACHED',
    `
      <p>Congratulations <strong>${user.name}</strong>!</p>
      <p>You have reached a <strong>${streak} day streak</strong> in Daily Commit Club!</p>
    `
  );

  return await sendEmail({ user, type: 'STREAK_MILESTONE', subject, html, dateStr: `milestone-${streak}` });
};
