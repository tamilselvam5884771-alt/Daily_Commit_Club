import { DailyActivity } from '../models/DailyActivity.js';
import { getTodayDateString } from '../utils/dateUtils.js';

/**
 * Get current user's activity history
 */
export const getMyActivity = async (req, res, next) => {
  try {
    const activities = await DailyActivity.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's today activity status
 */
export const getMyTodayActivity = async (req, res, next) => {
  try {
    const dateStr = getTodayDateString();
    let activity = await DailyActivity.findOne({ userId: req.user._id, date: dateStr });

    if (!activity) {
      activity = {
        userId: req.user._id,
        date: dateStr,
        commitCount: 0,
        repositories: [],
        qualifyingCommit: false,
        status: 'pending',
        streakBefore: req.user.currentStreak,
        streakAfter: req.user.currentStreak
      };
    }

    return res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user activity history by user ID
 */
export const getUserActivity = async (req, res, next) => {
  try {
    const activities = await DailyActivity.find({ userId: req.params.id })
      .sort({ date: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};
