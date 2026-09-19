import { Notification } from '../models/Notification.js';
import { logger } from '../utils/logger.js';

/**
 * Checks whether a notification of the given type has already been sent to a user for a specific date
 */
export const hasBeenNotifiedToday = async (userId, type, dateStr) => {
  const existing = await Notification.findOne({
    userId,
    type,
    'metadata.date': dateStr,
    status: 'sent'
  });
  return !!existing;
};

/**
 * Records a notification event in MongoDB
 */
export const recordNotification = async ({ userId, type, subject, email, status = 'sent', metadata = {} }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      subject,
      email,
      status,
      sentAt: new Date(),
      metadata
    });
    logger.info('EMAIL', `Notification record created [ID: ${notification._id}, Type: ${type}, User: ${userId}]`);
    return notification;
  } catch (error) {
    logger.error('EMAIL', `Failed to record notification log for ${email}`, error);
    return null;
  }
};
