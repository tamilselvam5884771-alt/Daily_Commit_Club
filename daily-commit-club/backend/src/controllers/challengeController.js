import { Challenge } from '../models/Challenge.js';
import { User } from '../models/User.js';
import { DailyActivity } from '../models/DailyActivity.js';
import { runDailyCheck } from '../jobs/dailyCheck.js';
import { completeDay, missDay } from '../services/streakService.js';
import { sendMorningReminder, sendLastChanceEmail, sendSuccessEmail, sendMissedCommitEmail } from '../services/emailService.js';
import { getTodayDateString } from '../utils/dateUtils.js';
import { getTodayCommitActivity, hasQualifyingCommit } from '../services/githubService.js';

/**
 * Get active challenge metadata
 */
export const getActiveChallenge = async (req, res, next) => {
  try {
    let challenge = await Challenge.findOne({ status: 'active' });

    if (!challenge) {
      challenge = await Challenge.create({
        name: 'Daily Commit Club',
        description: 'Commit every day. Keep your streak alive.',
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
 * Get global status overview for challenge members
 * GET /api/challenge/status
 */
export const getChallengeStatus = async (req, res, next) => {
  try {
    let activeChallenge = await Challenge.findOne({ status: 'active' });

    if (!activeChallenge) {
      activeChallenge = await Challenge.create({
        name: 'Daily Commit Club',
        description: 'Commit every day. Keep your streak alive.',
        timezone: 'Asia/Kolkata',
        dailyDeadline: '23:59',
        minimumCommits: 1,
        penaltyType: 'coffee',
        penaltyAmount: 1,
        status: 'active'
      });
    }

    const dateStr = getTodayDateString(activeChallenge.timezone || 'Asia/Kolkata');

    const members = await User.find({ isActive: true }).select('-__v');
    let activities = await DailyActivity.find({ date: dateStr });
    const activityMap = new Map(activities.map((a) => [a.userId.toString(), a]));

    // Live sync today's commit status for pending members
    for (const m of members) {
      const act = activityMap.get(m._id.toString());
      if (!act || act.status === 'pending') {
        try {
          const activityResult = await getTodayCommitActivity(m.githubUsername, dateStr);
          if (activityResult && activityResult.success && hasQualifyingCommit(activityResult, activeChallenge.minimumCommits)) {
            const { activity, user: updatedUser } = await completeDay(
              m,
              dateStr,
              activityResult.commitCount,
              activityResult.repositories
            );
            activityMap.set(m._id.toString(), activity);
            if (updatedUser) {
              m.currentStreak = updatedUser.currentStreak;
              m.longestStreak = updatedUser.longestStreak;
              m.totalCompletedDays = updatedUser.totalCompletedDays;
            }
          }
        } catch (e) {
          // Ignore live sync failures gracefully
        }
      }
    }

    let committedTodayCount = 0;

    const memberStatus = members.map((m) => {
      const act = activityMap.get(m._id.toString());
      const isCommitted = act && act.status === 'completed';
      if (isCommitted) committedTodayCount++;

      return {
        user: {
          id: m._id,
          _id: m._id,
          githubUsername: m.githubUsername,
          githubUrl: m.githubUrl,
          name: m.name,
          githubAvatar: m.githubAvatar,
          currentStreak: m.currentStreak,
          longestStreak: m.longestStreak,
          totalCompletedDays: m.totalCompletedDays,
          totalMissedDays: m.totalMissedDays,
          coffeeDebt: m.coffeeDebt,
          lastSuccessfulCommitDate: m.lastSuccessfulCommitDate
        },
        todayStatus: act ? act.status : 'pending',
        todayCommitCount: act ? act.commitCount : 0,
        lastCommitMessage: act && act.repositories && act.repositories[0] ? `Committed to ${act.repositories[0].name}` : 'No commit details recorded'
      };
    });

    const daysCount = Math.max(1, Math.floor((new Date() - new Date(activeChallenge.startDate)) / (1000 * 60 * 60 * 24)) + 1);

    return res.status(200).json({
      success: true,
      data: {
        date: dateStr,
        challenge: activeChallenge,
        daysCount,
        totalMembers: members.length,
        committedTodayCount,
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

    const user = await User.findById(userId);
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
    const { date, penalty = 1 } = req.body || {};
    const dateStr = date || getTodayDateString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } });
    }

    const { activity, user: updatedUser, alreadyProcessed } = await missDay(user, dateStr, penalty);

    if (!alreadyProcessed) {
      await sendMissedCommitEmail(updatedUser, dateStr, updatedUser.coffeeDebt);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: alreadyProcessed ? 'Already processed for date' : 'Simulated missed day completed',
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
    else if (type === 'MISSED_COMMIT') sent = await sendMissedCommitEmail(user, dateStr, user.coffeeDebt);

    return res.status(200).json({
      success: true,
      data: { sent, type, user: user.githubUsername }
    });
  } catch (error) {
    next(error);
  }
};
