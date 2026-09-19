import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { hasBeenNotifiedToday, recordNotification } from './notificationService.js';

// Configure Nodemailer transporter
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
 * Base HTML wrapper for fantasy/cinematic emails
 */
const wrapTemplate = (title, contentHeader, bodyHtml, accentColor = '#6366f1') => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, ${accentColor}, #0f172a); padding: 30px 20px; text-align: center; border-bottom: 2px solid ${accentColor}; }
          .header h1 { margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
          .header subtitle { color: #cbd5e1; font-size: 14px; margin-top: 5px; display: block; }
          .body { padding: 30px 25px; line-height: 1.6; }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; background: rgba(255,255,255,0.1); font-weight: bold; font-size: 13px; }
          .footer { background: #0f172a; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
          .cta-btn { display: inline-block; padding: 12px 24px; background: ${accentColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DAILY COMMIT CLUB</h1>
            <span class="subtitle">${contentHeader}</span>
          </div>
          <div class="body">
            ${bodyHtml}
          </div>
          <div class="footer">
            <p>Your GitHub activity keeps your world alive. • Challenge Timezone: Asia/Kolkata</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Helper to dispatch email and record notification log
 */
const sendEmail = async ({ user, type, subject, html, dateStr }) => {
  if (!user.email) {
    logger.warn('EMAIL', `Skipping email for @${user.githubUsername}: No email address provided.`);
    return false;
  }

  // Deduplication check
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
      to: user.email,
      subject,
      html
    });

    logger.info('EMAIL', `${type} sent to ${user.email} (MessageId: ${info.messageId})`);

    await recordNotification({
      userId: user._id,
      type,
      subject,
      email: user.email,
      status: 'sent',
      metadata: { date: dateStr }
    });

    return true;
  } catch (error) {
    logger.error('EMAIL', `Failed to send ${type} to ${user.email}`, error);
    await recordNotification({
      userId: user._id,
      type,
      subject,
      email: user.email,
      status: 'failed',
      metadata: { date: dateStr, error: error.message }
    });
    return false;
  }
};

/**
 * 1. Morning Reminder Email
 */
export const sendMorningReminder = async (user, dateStr) => {
  const subject = `🌅 Dawn of a New Challenge Day - ${dateStr}`;
  const html = wrapTemplate(
    subject,
    'MORNING BRIEFING',
    `
      <p>Greetings, <strong>@${user.githubUsername}</strong>!</p>
      <p>A new day has arrived in the realm of Daily Commit Club. Your building requires your continuous dedication to remain standing.</p>
      <p><span class="badge">Current Streak: ${user.currentStreak} Days</span></p>
      <p>Make at least <strong>1 qualifying GitHub commit</strong> today before midnight (23:59 IST) to maintain your realm.</p>
      <a href="https://github.com" class="cta-btn">Open GitHub & Commit</a>
    `,
    '#3b82f6'
  );

  return await sendEmail({ user, type: 'MORNING_REMINDER', subject, html, dateStr });
};

/**
 * 2. Last Chance Warning Email
 */
export const sendLastChanceEmail = async (user, dateStr) => {
  const subject = `⚠️ Your building is in danger!`;
  const html = wrapTemplate(
    subject,
    'CRITICAL WARNING',
    `
      <p>Attention <strong>@${user.githubUsername}</strong>!</p>
      <p>The shadows are closing in. We have not detected any qualifying GitHub commits from your account for today (<strong>${dateStr}</strong>).</p>
      <p style="color: #ef4444; font-weight: bold;">If you fail to commit before midnight (23:59 IST), your building will take severe structural damage and your streak will be reset!</p>
      <p>Coffee Penalty at stake: <strong>+1 Coffee Debt</strong></p>
      <a href="https://github.com" class="cta-btn" style="background: #ef4444;">Push Commit Immediately</a>
    `,
    '#f59e0b'
  );

  return await sendEmail({ user, type: 'LAST_CHANCE', subject, html, dateStr });
};

/**
 * 3. Success Email
 */
export const sendSuccessEmail = async (user, dateStr, commitCount = 1, streak = 1) => {
  const subject = `🔥 Your building survives another day.`;
  const html = wrapTemplate(
    subject,
    'VICTORY RECORDED',
    `
      <p>Excellent work, <strong>@${user.githubUsername}</strong>!</p>
      <p>Your commit activity for <strong>${dateStr}</strong> has been verified.</p>
      <ul>
        <li>Commits logged today: <strong>${commitCount}</strong></li>
        <li>New Streak: <strong>${streak} Days 🔥</strong></li>
      </ul>
      <p>Your building remains fortified and alive for another cycle.</p>
    `,
    '#10b981'
  );

  return await sendEmail({ user, type: 'SUCCESS', subject, html, dateStr });
};

/**
 * 4. Missed Commit Penalty Email
 */
export const sendMissedCommitEmail = async (user, dateStr, coffeeDebt = 1, buildingState = {}) => {
  const subject = `☄️ Your building has fallen.`;
  const html = wrapTemplate(
    subject,
    'DEFENCE FAILED',
    `
      <p>Regrettable news, <strong>@${user.githubUsername}</strong>.</p>
      <p>No qualifying GitHub commits were recorded for <strong>${dateStr}</strong>.</p>
      <div style="background: #291515; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0;">
        <p style="margin: 0; color: #fca5a5;"><strong>Consequences:</strong></p>
        <ul style="margin-top: 5px; color: #fca5a5;">
          <li>Streak Reset to: <strong>0 Days</strong></li>
          <li>Building Health: <strong>${buildingState.health || 0}% ${buildingState.destroyed ? '(DESTROYED)' : ''}</strong></li>
          <li>Coffee Debt Owed: <strong>${coffeeDebt} Coffees ☕</strong></li>
        </ul>
      </div>
      <p>Tomorrow is a new day. Push a commit tomorrow to begin rebuilding!</p>
    `,
    '#ef4444'
  );

  return await sendEmail({ user, type: 'MISSED_COMMIT', subject, html, dateStr });
};

/**
 * 5. Streak Milestone Email
 */
export const sendStreakMilestoneEmail = async (user, streak) => {
  const subject = `🏆 MILESTONE ACHIEVED: ${streak} Day Streak!`;
  const html = wrapTemplate(
    subject,
    'LEGENDARY STATUS',
    `
      <p>Hail, <strong>@${user.githubUsername}</strong>!</p>
      <p>You have reached an extraordinary streak milestone of <strong>${streak} Consecutive Days</strong> in Daily Commit Club!</p>
      <p>Your realm thrives and stands as a beacon for all 10 members.</p>
    `,
    '#8b5cf6'
  );

  return await sendEmail({ user, type: 'STREAK_MILESTONE', subject, html, dateStr: `milestone-${streak}` });
};
