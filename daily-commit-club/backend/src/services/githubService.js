import { graphql } from '@octokit/graphql';
import { GITHUB_CONFIG } from '../config/github.js';
import { logger } from '../utils/logger.js';
import { getChallengeDate, getChallengeDayStart, getChallengeDayEnd } from '../utils/dateUtils.js';

/**
 * Fetches basic GitHub user profile information using access token
 */
export const getGitHubUser = async (accessToken) => {
  try {
    const response = await fetch(GITHUB_CONFIG.USER_API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DailyCommitClub-App'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub API HTTP ${response.status}: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('GITHUB', 'Failed to fetch GitHub user profile', error);
    throw { isGitHubApiError: true, message: 'Failed to communicate with GitHub API', originalError: error };
  }
};

/**
 * Fetches primary/verified GitHub email address
 */
export const getGitHubEmail = async (accessToken) => {
  try {
    const response = await fetch(`${GITHUB_CONFIG.USER_API_URL}/emails`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DailyCommitClub-App'
      }
    });

    if (!response.ok) {
      return null;
    }

    const emails = await response.json();
    if (Array.isArray(emails)) {
      const primary = emails.find((e) => e.primary && e.verified) || emails[0];
      return primary ? primary.email : null;
    }
    return null;
  } catch (error) {
    logger.warn('GITHUB', `Could not fetch GitHub emails: ${error.message}`);
    return null;
  }
};

/**
 * Normalized GitHub commit activity retriever for challenge day in IST
 * 
 * @param {string|object} user User object or GitHub username string
 * @param {string|null} dateStr YYYY-MM-DD challenge date (default today IST)
 * @param {string|null} accessToken GitHub access token
 * 
 * Returns normalized object format:
 * Success (commits): { success: true, username, date, qualifyingCommit: true, commitCount: N, repositories: [{ name, commits }] }
 * Success (0 commits): { success: true, username, date, qualifyingCommit: false, commitCount: 0, repositories: [] }
 * API Failure: { success: false, errorType: "GITHUB_API_ERROR", error: message }
 */
export const getTodayCommitActivity = async (user, dateStr = null, accessToken = null) => {
  const username = typeof user === 'string' ? user : (user.githubUsername || user.username);
  const targetDate = dateStr || getChallengeDate();

  try {
    logger.info('GITHUB', `Checking commit activity for @${username} on ${targetDate}`);
    
    const startISO = getChallengeDayStart(targetDate);
    const endISO = getChallengeDayEnd(targetDate);

    // If no token, fall back to public REST activity search
    if (!accessToken && !process.env.GITHUB_TOKEN) {
      return await getPublicCommitActivity(username, targetDate, startISO, endISO);
    }

    const token = accessToken || process.env.GITHUB_TOKEN;

    const query = `
      query getCommitDetails($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            restrictedContributionsCount
            commitContributionsByRepository {
              repository {
                name
                nameWithOwner
              }
              contributions {
                totalCount
              }
            }
          }
        }
      }
    `;

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    });

    const response = await graphqlWithAuth(query, {
      username,
      from: startISO,
      to: endISO
    });

    const contributions = response?.user?.contributionsCollection;
    if (!contributions) {
      return {
        success: true,
        username,
        date: targetDate,
        qualifyingCommit: false,
        commitCount: 0,
        repositories: []
      };
    }

    const commitCount = (contributions.totalCommitContributions || 0) + (contributions.restrictedContributionsCount || 0);
    const repoList = contributions.commitContributionsByRepository
      ? contributions.commitContributionsByRepository.map((r) => ({
          name: r.repository.nameWithOwner || r.repository.name,
          commits: r.contributions.totalCount || 0
        }))
      : [];

    return {
      success: true,
      username,
      date: targetDate,
      qualifyingCommit: commitCount >= 1,
      commitCount,
      repositories: repoList
    };
  } catch (error) {
    logger.error('GITHUB', `GitHub API query failed for @${username}`, error);
    // CRITICAL: Return success: false with errorType "GITHUB_API_ERROR" so it is NEVER marked as missed!
    return {
      success: false,
      errorType: 'GITHUB_API_ERROR',
      error: error.message || 'GitHub API Communication Failure'
    };
  }
};

/**
 * Public REST API events lookup fallback
 */
const getPublicCommitActivity = async (username, targetDate, startISO, endISO) => {
  try {
    const url = `https://api.github.com/users/${username}/events/public`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'DailyCommitClub-App',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        return {
          success: true,
          username,
          date: targetDate,
          qualifyingCommit: false,
          commitCount: 0,
          repositories: []
        };
      }
      throw new Error(`GitHub Public Events API returned HTTP ${res.status}`);
    }

    const events = await res.json();
    const startTime = new Date(startISO).getTime();
    const endTime = new Date(endISO).getTime();

    let commitCount = 0;
    const repoMap = new Map();

    if (Array.isArray(events)) {
      for (const event of events) {
        const created = new Date(event.created_at).getTime();
        if (created >= startTime && created <= endTime && event.type === 'PushEvent') {
          const payloadCommits = event.payload?.commits?.length || 1;
          commitCount += payloadCommits;
          const repoName = event.repo?.name || 'unknown-repo';
          repoMap.set(repoName, (repoMap.get(repoName) || 0) + payloadCommits);
        }
      }
    }

    const repoList = Array.from(repoMap.entries()).map(([name, commits]) => ({ name, commits }));

    return {
      success: true,
      username,
      date: targetDate,
      qualifyingCommit: commitCount >= 1,
      commitCount,
      repositories: repoList
    };
  } catch (err) {
    logger.error('GITHUB', `Public events lookup failed for @${username}`, err);
    return {
      success: false,
      errorType: 'GITHUB_API_ERROR',
      error: err.message || 'GitHub API Error'
    };
  }
};

/**
 * Fetch repositories owned by user
 */
export const getUserRepositories = async (username, accessToken = null) => {
  try {
    const token = accessToken || process.env.GITHUB_TOKEN;
    const headers = {
      'User-Agent': 'DailyCommitClub-App',
      Accept: 'application/vnd.github.v3+json'
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const repos = await res.json();
    return Array.isArray(repos) ? repos.map((r) => r.full_name) : [];
  } catch (error) {
    logger.error('GITHUB', `Failed to fetch repos for @${username}`, error);
    return [];
  }
};

/**
 * Isolated Qualifying Commit Logic:
 * V1 rule: commitCount >= minimumCommits (default 1)
 */
export const hasQualifyingCommit = (activityResult, minimumCommits = 1) => {
  if (!activityResult || !activityResult.success) return false;
  return activityResult.qualifyingCommit && activityResult.commitCount >= minimumCommits;
};
