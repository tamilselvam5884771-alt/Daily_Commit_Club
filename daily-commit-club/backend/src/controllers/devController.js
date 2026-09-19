import { User } from '../models/User.js';
import { completeDay, missDay } from '../services/streakService.js';
import { damageBuilding } from '../services/buildingService.js';
import { sendSuccessEmail, sendMissedCommitEmail } from '../services/emailService.js';
import { getChallengeDate } from '../utils/dateUtils.js';

/**
 * Dev Simulation: Simulate Successful Commit Day
 * POST /api/dev/simulate-success/:userId
 */
export const simulateSuccess = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date, commits = 3, repo = 'sample/demo-repo' } = req.body || {};
    const dateStr = date || getChallengeDate();

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
        simulation: 'SIMULATE_SUCCESS',
        date: dateStr,
        alreadyProcessed,
        activity,
        user: {
          id: updatedUser._id,
          githubUsername: updatedUser.githubUsername,
          currentStreak: updatedUser.currentStreak,
          longestStreak: updatedUser.longestStreak
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dev Simulation: Simulate Missed Commit Day
 * POST /api/dev/simulate-miss/:userId
 */
export const simulateMiss = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date, damage = 40, penalty = 1 } = req.body || {};
    const dateStr = date || getChallengeDate();

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
        simulation: 'SIMULATE_MISS',
        date: dateStr,
        alreadyProcessed,
        activity,
        buildingState,
        user: {
          id: updatedUser._id,
          githubUsername: updatedUser.githubUsername,
          currentStreak: updatedUser.currentStreak,
          longestStreak: updatedUser.longestStreak,
          coffeeDebt: updatedUser.coffeeDebt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dev Simulation: Simulate GitHub API Error
 * POST /api/dev/simulate-github-error/:userId
 */
export const simulateGitHubError = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.body || {};
    const dateStr = date || getChallengeDate();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } });
    }

    // Return the exact error structure specified by Phase 2 rules
    const simulatedError = {
      success: false,
      errorType: 'GITHUB_API_ERROR',
      error: 'Simulated GitHub API network/rate-limit timeout'
    };

    return res.status(200).json({
      success: true,
      data: {
        simulation: 'SIMULATE_GITHUB_ERROR',
        date: dateStr,
        user: user.githubUsername,
        githubServiceOutput: simulatedError,
        resultAction: 'NO missed day status, NO streak reset, NO building damage, NO coffee penalty applied'
      }
    });
  } catch (error) {
    next(error);
  }
};
