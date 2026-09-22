import { verifyGitHubProfileByUrl, parseAndValidateGitHubUrl } from '../services/githubService.js';
import { logger } from '../utils/logger.js';

export const extractGitHubUsernameFromUrl = (inputUrl) => {
  const result = parseAndValidateGitHubUrl(inputUrl);
  return result.valid ? result.username : null;
};

/**
 * POST /api/github/verify
 */
export const verifyGitHubUrl = async (req, res, next) => {
  try {
    const { githubUrl } = req.body;

    if (!githubUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_GITHUB_URL',
          message: 'Please enter your full GitHub profile URL.'
        }
      });
    }

    const verification = await verifyGitHubProfileByUrl(githubUrl);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GITHUB_URL',
          message: verification.error
        }
      });
    }

    return res.status(200).json({
      success: true,
      githubId: verification.githubId,
      githubUsername: verification.githubUsername,
      githubAvatar: verification.githubAvatar,
      githubProfileUrl: verification.githubProfileUrl,
      github: {
        id: verification.githubId,
        username: verification.githubUsername,
        avatar: verification.githubAvatar,
        profileUrl: verification.githubProfileUrl
      }
    });
  } catch (err) {
    next(err);
  }
};
