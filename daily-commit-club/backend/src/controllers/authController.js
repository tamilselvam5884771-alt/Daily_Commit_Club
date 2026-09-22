import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { verifyGitHubProfileByUrl } from '../services/githubService.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'daily_commit_club_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Register User with Name + GitHub Profile URL
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, githubUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NAME', message: 'Please enter your name.' }
      });
    }

    if (!githubUrl || !githubUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_GITHUB_URL', message: 'Please enter your GitHub profile URL.' }
      });
    }

    // Verify GitHub URL via GitHub REST API
    const verification = await verifyGitHubProfileByUrl(githubUrl);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_GITHUB_PROFILE', message: verification.error }
      });
    }

    const { githubId, githubUsername, githubAvatar, githubProfileUrl } = verification;

    // Check if GitHub profile is already registered
    let existingUser = await User.findOne({
      $or: [{ githubUsername: githubUsername.toLowerCase() }, { githubId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'GITHUB_ALREADY_REGISTERED', message: `GitHub user @${githubUsername} is already a member.` }
      });
    }

    // Create User
    const user = new User({
      name: name.trim(),
      githubUrl: githubProfileUrl,
      githubUsername: githubUsername,
      githubId,
      githubAvatar,
      currentStreak: 0,
      longestStreak: 0,
      coffeeDebt: 0
    });

    await user.save();

    logger.info('AUTH', `User registered successfully: ${user.name} (@${user.githubUsername})`);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Simple Login Endpoint for Returning Users
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { name, githubUrl } = req.body;

    if (!githubUrl || !githubUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_GITHUB_URL', message: 'Please enter your GitHub profile URL.' }
      });
    }

    const verification = await verifyGitHubProfileByUrl(githubUrl);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_GITHUB_PROFILE', message: verification.error }
      });
    }

    const { githubUsername } = verification;

    let user = await User.findOne({
      $or: [
        { githubUsername: githubUsername },
        { githubUsername: githubUsername.toLowerCase() }
      ]
    });

    if (!user && name && name.trim()) {
      user = await User.findOne({ name: name.trim() });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `No member found for GitHub profile @${githubUsername}. Please join the club first.` }
      });
    }

    // Optionally update name/avatar if changed
    if (name && name.trim()) {
      user.name = name.trim();
    }
    user.githubAvatar = verification.githubAvatar;
    await user.save();

    logger.info('AUTH', `User logged in: ${user.name} (@${user.githubUsername})`);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Currently Logged In User Profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found.' }
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout Endpoint
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
};
