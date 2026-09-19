/**
 * GitHub OAuth & API Configuration
 * 
 * Scopes:
 * - read:user   : Fetch user profile (username, avatar, id, name)
 * - user:email  : Fetch verified email address if private
 * - repo        : Fetch public and private repository commit activity for challenge validation
 * - public_repo : Fallback scope if private repo access is not granted
 */

export const GITHUB_CONFIG = {
  CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  AUTHORIZE_URL: 'https://github.com/login/oauth/authorize',
  TOKEN_URL: 'https://github.com/login/oauth/access_token',
  USER_API_URL: 'https://api.github.com/user',
  GRAPHQL_API_URL: 'https://api.github.com/graphql',
  SCOPES: ['read:user', 'user:email', 'repo']
};
