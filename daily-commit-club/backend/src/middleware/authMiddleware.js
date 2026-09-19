import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized, no access token provided',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'daily_commit_club_super_secret_jwt_key_2026');
    const user = await User.findById(decoded.id).select('-__v');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User belonging to this token no longer exists',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'User account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('AUTH', `Token verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Not authorized, token invalid or expired',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: {
        message: 'Access denied: Admin privileges required',
        code: 'FORBIDDEN'
      }
    });
  }
};
