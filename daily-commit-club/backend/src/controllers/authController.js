import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { verifyGitHubProfileByUrl } from '../services/githubService.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'daily_commit_club_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Register User with Name + GitHub Profile URL + Password + Confirm Password
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, githubUrl, password, confirmPassword, profileImage } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NAME', message: 'Please enter your name.' }
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Password must be at least 6 characters long.' }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'PASSWORD_MISMATCH', message: 'Password and confirm password do not match.' }
      });
    }

    if (!githubUrl || !githubUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_GITHUB_URL', message: 'Please enter your GitHub profile URL.' }
      });
    }

    const trimmedName = name.trim();

    // Check if user with same name already exists (case-insensitive)
    const existingNameUser = await User.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (existingNameUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'NAME_TAKEN', message: 'A member with this name is already registered.' }
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
    let existingGithubUser = await User.findOne({
      $or: [{ githubUsername: githubUsername.toLowerCase() }, { githubId }]
    });

    if (existingGithubUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'GITHUB_ALREADY_REGISTERED', message: `GitHub user @${githubUsername} is already a member.` }
      });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User
    const user = new User({
      name: trimmedName,
      githubUrl: githubProfileUrl,
      githubUsername: githubUsername,
      githubId,
      githubAvatar: profileImage && profileImage.trim() ? profileImage.trim() : githubAvatar,
      passwordHash,
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Omit passwordHash in response
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(201).json({
      success: true,
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login Endpoint for Returning Users with Name + Password
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    if (!name || !name.trim() || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Please enter both name and password.' }
      });
    }

    const trimmedName = name.trim();

    // Find user by name (case-insensitive search) and explicitly select passwordHash
    const user = await User.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid name or password.' }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid name or password.' }
      });
    }

    logger.info('AUTH', `User logged in: ${user.name} (@${user.githubUsername})`);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(200).json({
      success: true,
      token,
      user: userObj
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
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
};

