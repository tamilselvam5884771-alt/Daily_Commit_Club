import jwt from 'jsonwebtoken';
import { GITHUB_CONFIG } from '../config/github.js';
import { User } from '../models/User.js';
import { getGitHubUser, getGitHubEmail } from '../services/githubService.js';
import { logger } from '../utils/logger.js';

/**
 * Initiates GitHub OAuth login flow by redirecting to GitHub Authorization
 */
export const githubLogin = (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.CLIENT_ID || 'mock_client_id',
    redirect_uri: GITHUB_CONFIG.CALLBACK_URL,
    scope: GITHUB_CONFIG.SCOPES.join(' ')
  });

  const redirectUrl = `${GITHUB_CONFIG.AUTHORIZE_URL}?${params.toString()}`;
  logger.info('AUTH', `Redirecting user to GitHub OAuth: ${redirectUrl}`);
  return res.redirect(redirectUrl);
};

/**
 * GitHub OAuth Callback
 * Exchanges code for access token, gets profile, upserts user, issues JWT token
 */
export const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      // If code is missing (e.g. in dev testing), allow mock authorization code parameter
      if (process.env.ALLOW_DEV_ENDPOINTS === 'true' && req.query.mockUsername) {
        return handleMockLogin(req.query.mockUsername, res);
      }
      return res.status(400).json({
        success: false,
        error: { message: 'Authorization code is missing from GitHub callback', code: 'MISSING_CODE' }
      });
    }

    // Exchange authorization code for GitHub access token
    const tokenResponse = await fetch(GITHUB_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CONFIG.CLIENT_ID,
        client_secret: GITHUB_CONFIG.CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CONFIG.CALLBACK_URL
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      logger.error('AUTH', `GitHub token exchange failed: ${tokenData.error_description || tokenData.error}`);
      return res.status(400).json({
        success: false,
        error: { message: tokenData.error_description || 'Failed to exchange authorization code with GitHub', code: 'OAUTH_FAILED' }
      });
    }

    const accessToken = tokenData.access_token;

    // Retrieve GitHub Profile and Email via githubService
    const ghUser = await getGitHubUser(accessToken);
    const primaryEmail = (await getGitHubEmail(accessToken)) || ghUser.email || '';

    // Upsert User in MongoDB
    let user = await User.findOne({ githubId: ghUser.id.toString() });

    if (!user) {
      user = new User({
        githubId: ghUser.id.toString(),
        githubUsername: ghUser.login,
        name: ghUser.name || ghUser.login,
        email: primaryEmail,
        githubAvatar: ghUser.avatar_url,
        profileImage: ghUser.avatar_url,
        role: 'member'
      });
    } else {
      user.githubUsername = ghUser.login;
      user.name = ghUser.name || user.name;
      if (primaryEmail) user.email = primaryEmail;
      user.githubAvatar = ghUser.avatar_url;
    }

    await user.save();
    logger.info('AUTH', `GitHub authentication successful for @${user.githubUsername} (ID: ${user._id})`);

    // Create JWT Token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'daily_commit_club_super_secret_jwt_key_2026', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // Set cookie for browser sessions
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'GitHub authentication successful',
        token: jwtToken,
        user: {
          id: user._id,
          githubUsername: user.githubUsername,
          name: user.name,
          email: user.email,
          role: user.role,
          currentStreak: user.currentStreak,
          buildingId: user.buildingId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets currently logged in user profile
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
 * Logout
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
};

/**
 * Dev Helper for mocking login without live GitHub Client Secret
 */
const handleMockLogin = async (mockUsername, res) => {
  let user = await User.findOne({ githubUsername: mockUsername });
  if (!user) {
    user = await User.create({
      githubId: `mock_${Date.now()}`,
      githubUsername: mockUsername,
      name: `${mockUsername} (Mock)`,
      email: `${mockUsername}@example.com`,
      githubAvatar: `https://github.com/${mockUsername}.png`
    });
  }

  const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'daily_commit_club_super_secret_jwt_key_2026', {
    expiresIn: '7d'
  });

  return res.status(200).json({
    success: true,
    data: {
      message: 'Mock GitHub authentication successful',
      token: jwtToken,
      user
    }
  });
};
