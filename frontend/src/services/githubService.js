import { getKolkataDateString } from '../utils/dateUtils';

/**
 * Service to fetch user's public GitHub activity for today (Asia/Kolkata timezone)
 * @param {string} username - GitHub username
 * @returns {Promise<{
 *   success: boolean,
 *   status: 'COMMITTED' | 'PENDING' | 'ERROR',
 *   commitCount: number,
 *   latestCommit: { repo: string, message: string, timestamp: string, url: string } | null,
 *   errorMsg: string | null
 * }>}
 */
export const checkTodayGithubActivity = async (username) => {
  if (!username) {
    return {
      success: false,
      status: 'ERROR',
      commitCount: 0,
      latestCommit: null,
      errorMsg: 'GitHub username is not configured.'
    };
  }

  const cleanUsername = username.trim();
  const todayKolkataDate = getKolkataDateString();

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/events/public`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.status === 404) {
      return {
        success: false,
        status: 'ERROR',
        commitCount: 0,
        latestCommit: null,
        errorMsg: `GitHub account '@${cleanUsername}' could not be found.`
      };
    }

    if (res.status === 403 || res.status === 429) {
      return {
        success: false,
        status: 'ERROR',
        commitCount: 0,
        latestCommit: null,
        errorMsg: 'GitHub API rate limit exceeded. Please try again in a few minutes.'
      };
    }

    if (!res.ok) {
      return {
        success: false,
        status: 'ERROR',
        commitCount: 0,
        latestCommit: null,
        errorMsg: `GitHub API error (HTTP ${res.status}).`
      };
    }

    const events = await res.json();
    if (!Array.isArray(events)) {
      return {
        success: false,
        status: 'ERROR',
        commitCount: 0,
        latestCommit: null,
        errorMsg: 'Invalid response format from GitHub API.'
      };
    }

    // Filter PushEvents created today in Asia/Kolkata
    let todayCommits = 0;
    let latestCommit = null;

    for (const event of events) {
      if (event.type === 'PushEvent' && event.created_at) {
        const eventDateKolkata = getKolkataDateString(new Date(event.created_at));

        if (eventDateKolkata === todayKolkataDate) {
          const commits = event.payload?.commits || [];
          const numCommits = commits.length > 0 ? commits.length : (event.payload?.size || 1); // Fallback to size or 1 commit for PushEvent
          todayCommits += numCommits;

          if (!latestCommit) {
            const firstCommit = commits[commits.length - 1] || commits[0];
            const repoName = event.repo?.name || 'GitHub Repository';
            const commitSha = firstCommit?.sha || event.payload?.head || '';
            const commitMsg = firstCommit?.message || 'Pushed commits to repository';
            const commitUrl = commitSha 
              ? `https://github.com/${repoName}/commit/${commitSha}`
              : `https://github.com/${repoName}`;

            latestCommit = {
              repo: repoName,
              message: commitMsg,
              timestamp: event.created_at,
              url: commitUrl
            };
          }
        }
      }
    }

    const status = todayCommits > 0 ? 'COMMITTED' : 'PENDING';

    return {
      success: true,
      status: status,
      commitCount: todayCommits,
      latestCommit: latestCommit,
      errorMsg: null
    };

  } catch (err) {
    console.error('Error fetching GitHub activity:', err);
    return {
      success: false,
      status: 'ERROR',
      commitCount: 0,
      latestCommit: null,
      errorMsg: 'Unable to reach GitHub. Check your network connection.'
    };
  }
};
