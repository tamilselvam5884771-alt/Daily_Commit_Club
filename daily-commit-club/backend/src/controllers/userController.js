import { User } from '../models/User.js';

/**
 * Get current user profile
 */
export const getMyProfile = async (req, res, next) => {
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
 * Update current user profile
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['displayName', 'name', 'email', 'profileImage', 'animatedAvatar'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).populate('buildingId');

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
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('buildingId');
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
