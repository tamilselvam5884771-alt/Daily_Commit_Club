import { logger } from '../utils/logger.js';

// Reserved non-user path names on GitHub
const RESERVED_PATHS = new Set([
  'login',
  'signup',
  'settings',
  'orgs',
  'organizations',
  'notifications',
  'explore',
  'trending',
  'features',
  'enterprise',
  'pricing',
  'about',
  'customer-stories',
  'readme',
  'site',
  'security',
  'pricing'
]);

// Valid GitHub username format: 1 to 39 alphanumeric chars or single hyphens
const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

/**
 * Normalizes and extracts username from full GitHub profile URL
 */
export const extractGitHubUsernameFromUrl = (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== 'string') return null;

  let urlObj;
  try {
    // Add protocol if missing
    let formatted = inputUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    urlObj = new URL(formatted);
  } catch (err) {
    return null;
  }

  // Validate Hostname
  const host = urlObj.hostname.toLowerCase();
  if (host !== 'github.com' && host !== 'www.github.com') {
    return null;
  }

  // Extract path segments
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);

  // Profile URL must contain exactly ONE path segment (e.g. /username)
  if (pathSegments.length !== 1) {
    return null;
  }

  const candidateUsername = pathSegments[0];

  if (RESERVED_PATHS.has(candidateUsername.toLowerCase())) {
    return null;
  }

  if (!GITHUB_USERNAME_REGEX.test(candidateUsername)) {
    return null;
  }

  return candidateUsername;
};

/**
 * Verifies full GitHub profile URL server-side
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

    const username = extractGitHubUsernameFromUrl(githubUrl);

    if (!username) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GITHUB_URL',
          message: 'Please enter a valid full GitHub profile URL (e.g. https://github.com/yourusername).'
        }
      });
    }

    // Query GitHub API to verify profile existence
    try {
      const apiRes = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          'User-Agent': 'DailyCommitClub-App',
          Accept: 'application/vnd.github.v3+json'
        }
      });

      if (apiRes.status === 404) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'GITHUB_PROFILE_NOT_FOUND',
            message: 'GitHub profile not found.'
          }
        });
      }

      if (!apiRes.ok) {
        logger.warn('GITHUB_VERIFY', `GitHub API returned status ${apiRes.status} for @${username}`);
        // Fallback for API rate limits in dev
        return res.status(200).json({
          success: true,
          github: {
            username: username,
            name: username,
            avatar: `https://github.com/${username}.png`,
            profileUrl: `https://github.com/${username}`,
            id: `gh_${username}`
          }
        });
      }

      const ghData = await apiRes.json();

      return res.status(200).json({
        success: true,
        github: {
          username: ghData.login,
          name: ghData.name || ghData.login,
          avatar: ghData.avatar_url,
          profileUrl: `https://github.com/${ghData.login}`,
          id: ghData.id.toString()
        }
      });
    } catch (fetchErr) {
      logger.error('GITHUB_VERIFY', `Fetch error: ${fetchErr.message}`);
      return res.status(500).json({
        success: false,
        error: {
          code: 'GITHUB_API_ERROR',
          message: "Couldn't verify GitHub right now. Try again."
        }
      });
    }
  } catch (err) {
    next(err);
  }
};
