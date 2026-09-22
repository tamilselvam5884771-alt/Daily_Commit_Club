import { User } from '../models/User.js';

/**
 * Get all members
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).sort({ currentStreak: -1, name: 1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' }
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
 * Update current user profile
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'githubUrl'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' }
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
