import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkTodayGithubActivity } from '../services/githubService';
import { syncTodayActivity } from '../services/activityService';
import { formatKolkataDisplayDate, formatKolkataTime } from '../utils/dateUtils';
import { 
  Coffee, 
  RefreshCw, 
  GitCommit, 
  Flame, 
  Trophy, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  GitBranch,
  ShieldCheck
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
    <div className="page-container flex-1 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in text-emerald-50">
      
      {/* Date & Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16382A] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-50 tracking-tight">
            Welcome, {profile?.name || 'Developer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/70 flex items-center gap-2 mt-1 font-mono">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{todayFormatted}</span>
            <span className="text-emerald-700">•</span>
            <span>Asia/Kolkata (IST)</span>
          </p>
        </div>

        <div className="flex items-center gap-3.5 self-start sm:self-auto flex-wrap">
          {lastSyncedAt && (
            <div className="text-xs text-emerald-400/60 font-mono hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Last checked: {formatKolkataTime(lastSyncedAt)}</span>
            </div>
          )}
          <button
            onClick={() => loadGithubActivity(true)}
            disabled={refreshing || loading}
            className="club-button-secondary py-2.5 px-4 text-xs flex items-center gap-2 cursor-pointer font-mono"
            title="Sync GitHub Activity"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync GitHub'}</span>
          </button>
        </div>
      </div>

      {/* 1. TODAY'S STATUS BANNER */}
      <section>
        {loading ? (
          <div className="club-card p-6 sm:p-8 animate-pulse bg-[#071A12] border-[#16382A]">
            <div className="h-4 w-32 bg-emerald-900/40 rounded mb-4"></div>
            <div className="h-8 w-64 bg-emerald-900/40 rounded mb-2"></div>
            <div className="h-4 w-48 bg-emerald-900/40 rounded"></div>
          </div>
        ) : (
          <div className={`club-card p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
            activityStatus === 'COMMITTED' 
              ? 'bg-gradient-to-r from-[#071A12] via-[#0B2A1E] to-[#071A12] border-emerald-500/50 shadow-xl shadow-emerald-950/50' 
              : activityStatus === 'PENDING'
              ? 'bg-gradient-to-r from-amber-950/20 via-[#1E190E] to-[#071A12] border-amber-500/40'
              : activityStatus === 'MISSED'
              ? 'bg-gradient-to-r from-red-950/30 via-[#231010] to-[#071A12] border-red-500/40'
              : 'bg-[#071A12] border-[#16382A]'
          }`}>
            
            {/* Background Glow */}
            {activityStatus === 'COMMITTED' && (
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 min-w-0">
                
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {activityStatus === 'COMMITTED' && (
                    <span className="status-badge status-committed">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      COMMITTED TODAY
                    </span>
                  )}
                  {activityStatus === 'PENDING' && (
                    <span className="status-badge status-pending">
                      <Clock className="w-3.5 h-3.5" />
                      PENDING
                    </span>
                  )}
                  {activityStatus === 'MISSED' && (
                    <span className="status-badge status-missed">
                      <Coffee className="w-3.5 h-3.5" />
                      MISSED TODAY
                    </span>
                  )}
                  {activityStatus === 'ERROR' && (
                    <span className="status-badge bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      GITHUB CHECK ERROR
                    </span>
                  )}
                </div>

                {/* Main Status Headline */}
                <div>
                  {activityStatus === 'COMMITTED' && (
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-50 tracking-tight">
                        Great job! You're safe today 🎉
                      </h2>
                      <p className="text-sm text-emerald-300/80 mt-1">
                        Detected <span className="font-bold text-emerald-400">{commitCount}</span> {commitCount === 1 ? 'commit' : 'commits'} pushed to GitHub today.
                      </p>
                    </div>
                  )}

                  {activityStatus === 'PENDING' && (
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-50 tracking-tight">
                        No commit detected yet today
                      </h2>
                      <p className="text-sm text-amber-200/80 mt-1">
                        Make at least 1 commit to GitHub before midnight IST to keep your streak alive and avoid owing coffee ☕
                      </p>
                    </div>
                  )}

                  {activityStatus === 'MISSED' && (
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-red-200 tracking-tight">
                        You missed today's commitment
                      </h2>
                      <p className="text-sm text-red-300/80 mt-1">
                        You owe coffee to the club! Coffee debt has been updated.
                      </p>
                    </div>
                  )}

                  {activityStatus === 'ERROR' && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-100 tracking-tight">
                        Unable to sync with GitHub
                      </h2>
                      <p className="text-sm text-emerald-300/70 mt-1">
                        {errorMessage || 'Your status was not marked as missed due to an API connectivity issue.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Button */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => loadGithubActivity(true)}
                  disabled={refreshing || loading}
                  className="club-button-primary py-3 px-5 text-xs sm:text-sm uppercase tracking-wider font-mono cursor-pointer w-full sm:w-auto text-center justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Checking...' : 'Recheck Status'}</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </section>

      {/* 2. STATISTICS GRID (4 EQUAL CARDS AT DESKTOP) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Today's Commits */}
        <div className="club-card p-6 flex flex-col justify-between min-h-[130px] min-w-0">
          <div className="flex items-center justify-between text-emerald-400/80">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Today's Commits</span>
            <GitCommit className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-50 font-mono">
              {commitCount}
            </div>
            <div className="text-xs text-emerald-400/60 mt-1 font-mono">
              {commitCount > 0 ? `${commitCount} pushed today` : '0 commits detected'}
            </div>
          </div>
        </div>

        {/* Card 2: Current Streak */}
        <div className="club-card p-6 flex flex-col justify-between min-h-[130px] min-w-0">
          <div className="flex items-center justify-between text-emerald-400/80">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono flex items-baseline gap-2">
              {profile?.current_streak || 0}
              <span className="text-sm font-normal text-amber-500/80">days</span>
            </div>
            <div className="text-xs text-emerald-400/60 mt-1 font-mono">
              Active daily streak
            </div>
          </div>
        </div>

        {/* Card 3: Longest Streak */}
        <div className="club-card p-6 flex flex-col justify-between min-h-[130px] min-w-0">
          <div className="flex items-center justify-between text-emerald-400/80">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Longest Streak</span>
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono flex items-baseline gap-2">
              {profile?.longest_streak || 0}
              <span className="text-sm font-normal text-emerald-500/80">days</span>
            </div>
            <div className="text-xs text-emerald-400/60 mt-1 font-mono">
              Personal best record
            </div>
          </div>
        </div>

        {/* Card 4: Coffee Debt */}
        <div className="club-card p-6 flex flex-col justify-between min-h-[130px] min-w-0">
          <div className="flex items-center justify-between text-emerald-400/80">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Coffee Debt</span>
            <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono flex items-baseline gap-2">
              {profile?.coffee_debt || 0}
              <span className="text-sm font-normal text-amber-500/80">coffees</span>
            </div>
            <div className="text-xs text-emerald-400/60 mt-1 font-mono">
              Owed to club members
            </div>
          </div>
        </div>

      </section>

      {/* 3. LATEST COMMIT & PROFILE DETAILS (RESPONSIVE 12-COL GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Latest Commit (Span 7 on Desktop) */}
        <div className="lg:col-span-7 club-card p-6 sm:p-7 flex flex-col justify-between min-w-0 space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#16382A] pb-3 mb-4">
              <h3 className="text-base font-bold text-emerald-100 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Latest Commit Today</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400/60">
                {latestCommit ? formatKolkataTime(latestCommit.timestamp) : 'No commit'}
              </span>
            </div>

            {latestCommit ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#04110C] border border-[#16382A]">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold mb-1 overflow-hidden">
                    <span className="truncate block max-w-full">{latestCommit.repo}</span>
                  </div>
                  <p className="text-sm text-emerald-100 font-medium line-clamp-2 leading-relaxed break-words mt-1">
                    "{latestCommit.message}"
                  </p>
                  {latestCommit.url && (
                    <a
                      href={latestCommit.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-200 underline font-mono cursor-pointer"
                    >
                      <span>View commit on GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-[#16382A] rounded-xl bg-[#04110C]/50">
                <GitCommit className="w-8 h-8 text-emerald-700 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-emerald-300/60 font-medium">No commits detected for today yet.</p>
                <p className="text-xs text-emerald-500/50 mt-0.5">Push code to your GitHub repositories to record your commit.</p>
              </div>
            )}
          </div>

          <div className="pt-3 text-xs text-emerald-500/60 font-mono flex items-center justify-between border-t border-[#16382A]">
            <span>Verified against GitHub Public API</span>
            <span>IST (Asia/Kolkata)</span>
          </div>
        </div>

        {/* GitHub Profile Card (Span 5 on Desktop) */}
        <div className="lg:col-span-5 club-card p-6 sm:p-7 flex flex-col justify-between min-w-0 space-y-4">
          <div>
            <div className="border-b border-[#16382A] pb-3 mb-4">
              <h3 className="text-base font-bold text-emerald-100 flex items-center gap-2">
                <Github className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GitHub Profile</span>
              </h3>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {profile?.github_avatar_url ? (
                <img 
                  src={profile.github_avatar_url} 
                  alt={profile.github_username || 'avatar'}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full object-cover border-2 border-emerald-500/40 shadow-md shrink-0"
                />
              ) : (
                <div className="w-14 h-14 min-w-[56px] min-h-[56px] shrink-0 rounded-full bg-emerald-800 flex items-center justify-center text-lg font-bold text-emerald-100 border border-emerald-600">
                  {profile?.name?.[0] || 'U'}
                </div>
              )}
              <div className="overflow-hidden min-w-0">
                <h4 className="text-base font-bold text-emerald-100 truncate">{profile?.name}</h4>
                <p className="text-xs font-mono text-emerald-400/80 truncate">@{profile?.github_username}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-500 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Member Verified</span>
                </div>
              </div>
            </div>

            {profile?.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                className="club-button-secondary w-full py-2.5 text-xs text-center justify-center font-mono flex items-center gap-2 cursor-pointer"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Open GitHub Profile</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
          </div>

          <div className="p-3 rounded-lg bg-[#04110C] border border-[#16382A] text-[11px] text-emerald-400/60 leading-relaxed font-mono">
            💡 Your daily activity is automatically checked against public GitHub events.
          </div>
        </div>

      </div>

    </div>
  );
}
