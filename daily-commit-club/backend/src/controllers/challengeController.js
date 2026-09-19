import { Challenge } from '../models/Challenge.js';
import { User } from '../models/User.js';
import { Building } from '../models/Building.js';
import { DailyActivity } from '../models/DailyActivity.js';
import { runDailyCheck } from '../jobs/dailyCheck.js';
import { completeDay, missDay } from '../services/streakService.js';
import { damageBuilding } from '../services/buildingService.js';
import { sendMorningReminder, sendLastChanceEmail, sendSuccessEmail, sendMissedCommitEmail } from '../services/emailService.js';
import { getTodayDateString } from '../utils/dateUtils.js';

/**
 * Get active challenge metadata
 */
export const getActiveChallenge = async (req, res, next) => {
  try {
    let challenge = await Challenge.findOne({ status: 'active' });

    if (!challenge) {
      challenge = await Challenge.create({
        name: 'Daily Commit Club',
        description: 'Your GitHub activity keeps your world alive.',
        timezone: 'Asia/Kolkata',
        dailyDeadline: '23:59',
        minimumCommits: 1,
        penaltyType: 'coffee',
        penaltyAmount: 1,
        status: 'active'
      });
    }

    return res.status(200).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get global status overview for all 10 challenge members
 */
export const getChallengeStatus = async (req, res, next) => {
  try {
    const activeChallenge = await Challenge.findOne({ status: 'active' });
    const dateStr = getTodayDateString();

    const members = await User.find({ isActive: true })
      .select('-__v')
      .populate('buildingId');

    const activities = await DailyActivity.find({ date: dateStr });
    const activityMap = new Map(activities.map((a) => [a.userId.toString(), a]));

    const memberStatus = members.map((m) => {
      const act = activityMap.get(m._id.toString());
      return {
        user: {
          id: m._id,
          githubUsername: m.githubUsername,
          name: m.name,
          githubAvatar: m.githubAvatar,
          currentStreak: m.currentStreak,
          coffeeDebt: m.coffeeDebt
        },
        building: m.buildingId ? {
          number: m.buildingId.buildingNumber,
          name: m.buildingId.name,
          health: m.buildingId.health,
          destroyed: m.buildingId.destroyed
        } : null,
        todayStatus: act ? act.status : 'pending',
        todayCommitCount: act ? act.commitCount : 0
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        date: dateStr,
        challenge: activeChallenge,
        totalMembers: members.length,
        members: memberStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dev Endpoint: Manually trigger check for all members
 */
export const checkAllUsers = async (req, res, next) => {
  try {
    const { date } = req.body || {};
    const result = await runDailyCheck(date || null);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dev Endpoint: Manually trigger check for specific user
 */
export const checkSingleUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.body || {};
    const result = await runDailyCheck(date || null, userId);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dev Endpoint: Simulate successful commit day for user
 */
export const testSuccessCommit = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date, commits = 2, repo = 'owner/repo' } = req.body || {};
    const dateStr = date || getTodayDateString();

    const user = await User.findById(userId).populate('buildingId');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } });
    }

    const { activity, user: updatedUser, alreadyProcessed } = await completeDay(user, dateStr, commits, [repo]);

    if (!alreadyProcessed) {
      await sendSuccessEmail(updatedUser, dateStr, commits, updatedUser.currentStreak);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: alreadyProcessed ? 'Already processed for date' : 'Simulated success completed',
        activity,
        user: updatedUser,
        alreadyProcessed
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dev Endpoint: Simulate missed commit day for user
 */
export const testMissedCommit = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date, damage = 40, penalty = 1 } = req.body || {};
    const dateStr = date || getTodayDateString();

    const user = await User.findById(userId).populate('buildingId');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } });
    }

    const { activity, user: updatedUser, alreadyProcessed } = await missDay(user, dateStr, penalty);

    let buildingState = {};
    if (user.buildingId) {
      buildingState = await damageBuilding(user.buildingId._id || user.buildingId, damage);
    }

    if (!alreadyProcessed) {
      await sendMissedCommitEmail(updatedUser, dateStr, updatedUser.coffeeDebt, buildingState);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: alreadyProcessed ? 'Already processed for date' : 'Simulated missed day completed',
        activity,
        user: updatedUser,
        buildingState,
        alreadyProcessed
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dev Endpoint: Test Email dispatch
 */
export const testNotification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type = 'MORNING_REMINDER' } = req.body || {};
    const dateStr = getTodayDateString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } });
    }

    let sent = false;
    if (type === 'MORNING_REMINDER') sent = await sendMorningReminder(user, dateStr);
    else if (type === 'LAST_CHANCE') sent = await sendLastChanceEmail(user, dateStr);
    else if (type === 'SUCCESS') sent = await sendSuccessEmail(user, dateStr, 1, user.currentStreak);
    else if (type === 'MISSED_COMMIT') sent = await sendMissedCommitEmail(user, dateStr, user.coffeeDebt, { health: 60 });

    return res.status(200).json({
      success: true,
      data: { sent, type, user: user.githubUsername }
    });
  } catch (error) {
    next(error);
  }
};
