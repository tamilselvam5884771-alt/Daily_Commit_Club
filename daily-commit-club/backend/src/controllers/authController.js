import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Building } from '../models/Building.js';
import { extractGitHubUsernameFromUrl } from './githubController.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'daily_commit_club_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register User with Native Email/Password, GitHub Verification, and House Claiming
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, githubUrl, buildingId, profileImage } = req.body;

    // 1. Basic Field Validations
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NAME', message: 'Please enter your name.' }
      });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address.' }
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' }
      });
    }

    // 2. Validate & Normalize GitHub Profile URL
    const githubUsername = extractGitHubUsernameFromUrl(githubUrl);
    if (!githubUsername) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GITHUB_URL',
          message: 'Please enter a valid full GitHub profile URL (e.g. https://github.com/yourusername).'
        }
      });
    }

    const normalizedGitHubUrl = `https://github.com/${githubUsername}`;

    // 3. Check for existing Email or GitHub username in database
    const normalizedEmail = email.toLowerCase().trim();
    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMAIL_IN_USE', message: 'An account with that email address already exists.' }
      });
    }

    const existingGitHubUser = await User.findOne({ githubUsername });
    if (existingGitHubUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'GITHUB_IN_USE', message: `GitHub profile @${githubUsername} is already registered.` }
      });
    }

    // 4. Validate & Claim House / Building Selection
    let claimedBuilding = null;
    if (buildingId) {
      claimedBuilding = await Building.findById(buildingId);
      if (!claimedBuilding) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_HOUSE', message: 'Selected house does not exist.' }
        });
      }

      if (claimedBuilding.ownerId) {
        return res.status(400).json({
          success: false,
          error: { code: 'HOUSE_ALREADY_CLAIMED', message: 'That house has already been claimed by another member.' }
        });
      }
    } else {
      // Find first available house if buildingId not passed
      claimedBuilding = await Building.findOne({ ownerId: null }).sort({ buildingNumber: 1 });
      if (!claimedBuilding) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_HOUSES_AVAILABLE', message: 'All 10 houses in the realm are currently occupied!' }
        });
      }
    }

    // Fetch GitHub avatar if not provided
    const avatarUrl = profileImage || `https://github.com/${githubUsername}.png`;

    // 5. Create User
    const user = new User({
      name: name.trim(),
      displayName: name.trim(),
      email: normalizedEmail,
      password: password,
      githubProfileUrl: normalizedGitHubUrl,
      githubUsername: githubUsername,
      githubAvatar: avatarUrl,
      profileImage: avatarUrl,
      buildingId: claimedBuilding._id,
      role: 'member'
    });

    await user.save();

    // 6. Assign building to user atomically
    claimedBuilding.ownerId = user._id;
    await claimedBuilding.save();

    logger.info('AUTH', `User registered successfully: ${user.name} (@${user.githubUsername}) - House #${claimedBuilding.buildingNumber}`);

    // 7. Issue JWT Token & Set Cookie
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
        githubProfileUrl: user.githubProfileUrl,
        profileImage: user.profileImage,
        buildingId: claimedBuilding,
        currentStreak: user.currentStreak
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User with Email and Password
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Please provide both email and password.' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Select password field for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password').populate('buildingId');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    logger.info('AUTH', `User logged in: ${user.email} (@${user.githubUsername})`);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
        githubProfileUrl: user.githubProfileUrl,
        profileImage: user.profileImage,
        buildingId: user.buildingId,
        currentStreak: user.currentStreak
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Currently Logged In User Profile
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('buildingId');
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout Endpoint
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
};

/**
 * Forgot Password Endpoint
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_EMAIL', message: 'Please enter your registered email address.' }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
  } catch (error) {
    next(error);
  }
};
