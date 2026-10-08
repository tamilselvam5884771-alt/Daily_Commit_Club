import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkTodayGithubActivity } from '../services/githubService';
import { syncTodayActivity } from '../services/activityService';
import { formatKolkataDisplayDate, formatKolkataTime } from '../utils/dateUtils';
import { 
  Coffee, 
  RefreshCw, 
  Flame, 
  Trophy, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  GitBranch,
  ShieldCheck,
  MapPin,
  CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  
  const [activityStatus, setActivityStatus] = useState('PENDING'); // COMMITTED | PENDING | MISSED | ERROR
  const [commitCount, setCommitCount] = useState(0);
  const [latestCommit, setLatestCommit] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Main sync function
  const loadGithubActivity = useCallback(async (isManualRefresh = false) => {
    if (!profile?.github_username) {
      setActivityStatus('ERROR');
      setErrorMessage('GitHub profile is not configured on your account.');
      setLoading(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage(null);

    try {
      // 1. Check GitHub API
      const ghResult = await checkTodayGithubActivity(profile.github_username);

      if (ghResult.success) {
        setActivityStatus(ghResult.status);
        setCommitCount(ghResult.commitCount);
        setLatestCommit(ghResult.latestCommit);

        // 2. Sync to Supabase & update streaks
        if (profile?.id) {
          await syncTodayActivity(profile.id, ghResult);
          await refreshProfile();
        }
      } else {
        setActivityStatus('ERROR');
        setErrorMessage(ghResult.errorMsg || 'Unable to check GitHub activity.');
      }

    } catch (err) {
      console.error('Error in loadGithubActivity:', err);
      setActivityStatus('ERROR');
      setErrorMessage('An unexpected error occurred while checking GitHub.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastSyncedAt(new Date());
    }
  }, [profile?.github_username, profile?.id, refreshProfile]);

  useEffect(() => {
    if (profile?.github_username) {
      loadGithubActivity(false);
    }
  }, [profile?.github_username]);

  const todayFormatted = formatKolkataDisplayDate();

  return (
    <div className="page-container space-y-6">
      
      {/* 1. Dashboard Header */}
      <section className="dashboard-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Welcome, {profile?.name || 'Developer'}!</span>
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-400/80 flex items-center gap-2 mt-1.5 font-mono">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{todayFormatted}</span>
            <span className="text-emerald-700">•</span>
            <span>Asia/Kolkata (IST)</span>
          </p>
        </div>

        <div className="flex items-center gap-3.5 self-start sm:self-auto flex-wrap">
          {lastSyncedAt && (
            <div className="text-xs text-emerald-400/70 font-mono hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Last checked: {formatKolkataTime(lastSyncedAt)}</span>
            </div>
          )}
          <button
            onClick={() => loadGithubActivity(true)}
            disabled={refreshing || loading}
            className="btn-secondary"
            title="Sync GitHub Activity"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync GitHub'}</span>
          </button>
        </div>
      </section>

      {/* 2. Status Card */}
      <section className="card status-card">
        {loading ? (
          <div className="animate-pulse space-y-3 w-full">
            <div className="h-4 w-32 bg-emerald-900/40 rounded"></div>
            <div className="h-8 w-64 bg-emerald-900/40 rounded"></div>
            <div className="h-4 w-48 bg-emerald-900/40 rounded"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3 min-w-0">
              <div>
                {activityStatus === 'COMMITTED' && (
                  <span className="status-pill status-pill-committed">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    COMMITTED TODAY
                  </span>
                )}
                {activityStatus === 'PENDING' && (
                  <span className="status-pill status-pending">
                    <Clock className="w-3.5 h-3.5" />
                    PENDING
                  </span>
                )}
                {activityStatus === 'MISSED' && (
                  <span className="status-pill status-missed">
                    <Coffee className="w-3.5 h-3.5" />
                    MISSED TODAY
                  </span>
                )}
                {activityStatus === 'ERROR' && (
                  <span className="status-pill bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    GITHUB CHECK ERROR
                  </span>
                )}
              </div>

              <div>
                {activityStatus === 'COMMITTED' && (
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Great job! You're safe today</span>
                      <span>🎉</span>
                    </h2>
                    <p className="text-sm text-emerald-300/80 mt-1">
                      Detected <span className="font-bold text-emerald-400">{commitCount}</span> {commitCount === 1 ? 'commit' : 'commits'} pushed to GitHub today.
                    </p>
                  </div>
                )}

                {activityStatus === 'PENDING' && (
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      No commit detected yet today
                    </h2>
                    <p className="text-sm text-amber-200/80 mt-1">
                      Make at least 1 commit to GitHub before midnight IST to keep your streak alive and avoid owing coffee ☕
                    </p>
                  </div>
                )}

                {activityStatus === 'MISSED' && (
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-red-200 tracking-tight">
                      You missed today's commitment
                    </h2>
                    <p className="text-sm text-red-300/80 mt-1">
                      You owe coffee to the club! Coffee debt has been updated.
                    </p>
                  </div>
                )}

                {activityStatus === 'ERROR' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-100 tracking-tight">
                      Unable to sync with GitHub
                    </h2>
                    <p className="text-sm text-emerald-300/70 mt-1">
                      {errorMessage || 'Your status was not marked as missed due to an API connectivity issue.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => loadGithubActivity(true)}
                disabled={refreshing || loading}
                className="btn-primary"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'CHECKING...' : 'RECHECK STATUS'}</span>
              </button>
            </div>
          </>
        )}
      </section>

      {/* 3. Statistics Grid (4 Equal Cards) */}
      <section className="stats-grid">
        
        {/* Card 1: Today's Commits */}
        <div className="card stat-card">
          <div className="flex items-center gap-2 text-emerald-400">
            <GitBranch className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300/80">TODAY'S COMMITS</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-white font-mono">
              {commitCount}
            </div>
            <div className="text-xs text-emerald-400/70 mt-1 font-mono">
              {commitCount > 0 ? `${commitCount} pushed today` : 'pushed today'}
            </div>
          </div>
        </div>

        {/* Card 2: Current Streak */}
        <div className="card stat-card">
          <div className="flex items-center gap-2 text-amber-500">
            <Flame className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300/80">CURRENT STREAK</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-amber-400 font-mono flex items-baseline gap-2">
              {profile?.current_streak || 0}
              <span className="text-base font-normal text-amber-400">days</span>
            </div>
            <div className="text-xs text-emerald-400/70 mt-1 font-mono">
              Active daily streak
            </div>
          </div>
        </div>

        {/* Card 3: Longest Streak */}
        <div className="card stat-card">
          <div className="flex items-center gap-2 text-cyan-400">
            <Trophy className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300/80">LONGEST STREAK</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-cyan-400 font-mono flex items-baseline gap-2">
              {profile?.longest_streak || 0}
              <span className="text-base font-normal text-cyan-400">days</span>
            </div>
            <div className="text-xs text-emerald-400/70 mt-1 font-mono">
              Personal best record
            </div>
          </div>
        </div>

        {/* Card 4: Coffee Debt */}
        <div className="card stat-card">
          <div className="flex items-center gap-2 text-amber-400">
            <Coffee className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300/80">COFFEE DEBT</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-amber-400 font-mono flex items-baseline gap-2">
              {profile?.coffee_debt || 0}
              <span className="text-base font-normal text-amber-400">coffees</span>
            </div>
            <div className="text-xs text-emerald-400/70 mt-1 font-mono">
              Owed to club members
            </div>
          </div>
        </div>

      </section>

      {/* 4. Activity Grid (Latest Commit & GitHub Profile) */}
      <section className="activity-grid">
        
        {/* Latest Commit Card */}
        <div className="card activity-card">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Latest Commit Today</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400/70">
                {latestCommit ? formatKolkataTime(latestCommit.timestamp) : '03:21 PM IST'}
              </span>
            </div>

            <div className="py-3 space-y-2">
              <div className="text-sm font-mono text-[#2dd4bf] font-semibold truncate block">
                {latestCommit?.repo || 'tamilselvam5884771-alt/Daily_Commit_Club'}
              </div>
              <p className="text-sm text-emerald-100 font-medium leading-relaxed break-words">
                "{latestCommit?.message || 'Pushed commits to repository'}"
              </p>

              <div className="pt-3">
                <a
                  href={latestCommit?.url || `https://github.com/${profile?.github_username || 'tamilselvam5884771-alt'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-action font-mono"
                >
                  <Github className="w-4 h-4 text-emerald-400" />
                  <span>View commit on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400/70" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 text-xs text-emerald-500/80 font-mono flex items-center justify-between border-t border-[#143527]/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Verified against GitHub Public API
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              IST (Asia/Kolkata)
            </span>
          </div>
        </div>

        {/* GitHub Profile Card */}
        <div className="card activity-card">
          <div>
            <div className="pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Github className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GitHub Profile</span>
              </h3>
            </div>

            <div className="py-3 flex items-center gap-4">
              <div className="relative shrink-0">
                {profile?.github_avatar_url ? (
                  <img 
                    src={profile.github_avatar_url} 
                    alt={profile.github_username || 'avatar'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/40 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center text-xl font-bold text-emerald-100 border-2 border-emerald-600">
                    {profile?.name?.[0] || 'H'}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center border-2 border-[#071C13]">
                  <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="overflow-hidden min-w-0">
                <h4 className="text-lg font-bold text-white truncate">{profile?.name || 'HARI'}</h4>
                <p className="text-xs font-mono text-emerald-400/80 truncate">@{profile?.github_username || 'tamilselvam5884771-alt'}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Member Verified</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={profile?.github_url || `https://github.com/${profile?.github_username || 'tamilselvam5884771-alt'}`}
                target="_blank"
                rel="noreferrer"
                className="btn-action font-mono"
              >
                <Github className="w-4 h-4 text-emerald-400" />
                <span>Open GitHub Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400/70" />
              </a>
            </div>
          </div>

          <div className="pt-4 mt-2 text-xs text-emerald-400/70 leading-relaxed font-mono flex items-center gap-2 border-t border-[#143527]/60">
            <span>💡</span>
            <span>Your daily activity is automatically checked against public GitHub events.</span>
          </div>
        </div>

      </section>

    </div>
  );
}
