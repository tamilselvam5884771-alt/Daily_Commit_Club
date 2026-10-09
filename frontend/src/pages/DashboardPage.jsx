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
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  GitBranch,
  ShieldCheck,
  MapPin,
  CheckCircle,
  ArrowUpRight
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

  // Main sync function (100% untouched logic)
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
    <div className="page-container space-y-8 font-pixel">
      
      {/* 1. Dashboard Header */}
      <section className="dashboard-header border-b border-emerald-900/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="pixel-badge">
              <span className="pixel-dot"></span>
              <span>DAILY QUEST • IST</span>
            </span>
            <span className="text-xs text-emerald-600">•</span>
            <span className="text-xs text-emerald-300 font-medium">{todayFormatted}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#ecfdf5] tracking-tight font-display-clean">
            Welcome, <span className="text-emerald-400">{profile?.name || 'Player 1'}</span>! ☕
          </h1>

          <p className="text-sm text-emerald-200/80 leading-relaxed font-sans-clean">
            Commit to GitHub before 8:00 PM IST or owe coffee to the club
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {lastSyncedAt && (
            <div className="text-xs text-[#86efac] font-silkscreen hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#030f0a] border-2 border-[#0d422c] shadow-[2px_2px_0px_#020604]">
              <Clock className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>SYNC: {formatKolkataTime(lastSyncedAt)}</span>
            </div>
          )}
          <button
            onClick={() => loadGithubActivity(true)}
            disabled={refreshing || loading}
            className="btn-secondary"
            title="Sync GitHub Activity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#00ff88]' : ''}`} />
            <span>{refreshing ? 'SYNCING...' : 'SYNC GITHUB'}</span>
          </button>
        </div>
      </section>

      {/* 2. Hero Pixel Status Board */}
      <section className="card status-card">
        {loading ? (
          <div className="animate-pulse space-y-3 w-full py-4">
            <div className="h-5 w-40 bg-[#0d422c]"></div>
            <div className="h-8 w-72 bg-[#0d422c]"></div>
            <div className="h-4 w-56 bg-[#0d422c]"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3 min-w-0 z-10">
              <div>
                {activityStatus === 'COMMITTED' && (
                  <span className="status-pill status-pill-committed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
                    <span>COMMITTED TODAY</span>
                  </span>
                )}
                {activityStatus === 'PENDING' && (
                  <span className="status-pill status-pending">
                    <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>PENDING MISSION</span>
                  </span>
                )}
                {activityStatus === 'MISSED' && (
                  <span className="status-pill status-missed">
                    <Coffee className="w-3.5 h-3.5 text-[#ef4444]" />
                    <span>MISSED COMMITMENT</span>
                  </span>
                )}
                {activityStatus === 'ERROR' && (
                  <span className="status-pill bg-[#061910] text-[#fbbf24] border-2 border-[#fbbf24]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>SYNC ERROR</span>
                  </span>
                )}
              </div>

              <div>
                {activityStatus === 'COMMITTED' && (
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-bold text-[#ecfdf5] tracking-tight">
                      MISSION ACCOMPLISHED! YOU'RE SAFE TODAY 🎉
                    </h2>
                    <p className="text-sm text-[#86efac] mt-2 font-silkscreen">
                      Detected <span className="text-[#00ff88] font-bold">{commitCount}</span> {commitCount === 1 ? 'commit' : 'commits'} logged to GitHub today. Streak preserved!
                    </p>
                  </div>
                )}

                {activityStatus === 'PENDING' && (
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-bold text-[#ecfdf5] tracking-tight">
                      NO COMMITS DETECTED YET TODAY ⏳
                    </h2>
                    <p className="text-sm text-[#fbbf24] mt-2 font-silkscreen">
                      Push at least 1 commit before 8:00 PM IST to protect your streak and avoid owing coffee ☕
                    </p>
                  </div>
                )}

                {activityStatus === 'MISSED' && (
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-bold text-[#f87171] tracking-tight">
                      MISSION FAILED — DEADLINE MISSED 💀
                    </h2>
                    <p className="text-sm text-[#fca5a5] mt-2 font-silkscreen">
                      The 8:00 PM IST deadline has passed. Coffee debt has been added to your roster!
                    </p>
                  </div>
                )}

                {activityStatus === 'ERROR' && (
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold text-[#ecfdf5] tracking-tight">
                      UNABLE TO SYNC GITHUB ACTIVITY
                    </h2>
                    <p className="text-sm text-[#86efac] mt-2 font-silkscreen">
                      {errorMessage || 'Your status was not marked as missed due to an API connectivity issue.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 z-10 pt-2 sm:pt-0">
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

      {/* 3. Retro Pixel HUD Stats Grid (4 Cards) */}
      <section className="stats-grid">
        
        {/* Card 1: Today's Commits */}
        <div className="card stat-card group hover:border-[#00ff88] transition-all">
          <div className="flex items-center justify-between text-[#86efac]">
            <span className="text-[10px] font-arcade uppercase tracking-wider">TODAY'S COMMITS</span>
            <GitBranch className="w-4 h-4 text-[#10b981] group-hover:text-[#00ff88]" />
          </div>
          <div className="my-2">
            <div className="text-4xl sm:text-5xl font-bold text-[#ecfdf5] tracking-tight">
              {commitCount}
            </div>
            <div className="text-xs text-[#86efac] mt-1 font-silkscreen">
              {commitCount > 0 ? `${commitCount} verified today` : '0 commits so far'}
            </div>
          </div>
        </div>

        {/* Card 2: Current Streak */}
        <div className="card stat-card group hover:border-[#fbbf24] transition-all">
          <div className="flex items-center justify-between text-[#86efac]">
            <span className="text-[10px] font-arcade uppercase tracking-wider">CURRENT STREAK</span>
            <Flame className="w-4 h-4 text-[#fbbf24]" />
          </div>
          <div className="my-2">
            <div className="text-4xl sm:text-5xl font-bold text-[#fbbf24] tracking-tight flex items-baseline gap-2">
              {profile?.current_streak || 0}
              <span className="text-sm font-arcade text-[#fbbf24]/70">DAYS</span>
            </div>
            <div className="text-xs text-[#86efac] mt-1 font-silkscreen">
              Active consecutive streak
            </div>
          </div>
        </div>

        {/* Card 3: Longest Streak */}
        <div className="card stat-card group hover:border-[#34d399] transition-all">
          <div className="flex items-center justify-between text-[#86efac]">
            <span className="text-[10px] font-arcade uppercase tracking-wider">LONGEST STREAK</span>
            <Trophy className="w-4 h-4 text-[#34d399]" />
          </div>
          <div className="my-2">
            <div className="text-4xl sm:text-5xl font-bold text-[#ecfdf5] tracking-tight flex items-baseline gap-2">
              {profile?.longest_streak || 0}
              <span className="text-sm font-arcade text-[#86efac]">DAYS</span>
            </div>
            <div className="text-xs text-[#86efac] mt-1 font-silkscreen">
              All-time personal record
            </div>
          </div>
        </div>

        {/* Card 4: Coffee Debt */}
        <div className="card stat-card group hover:border-[#ef4444] transition-all">
          <div className="flex items-center justify-between text-[#86efac]">
            <span className="text-[10px] font-arcade uppercase tracking-wider">COFFEE DEBT</span>
            <Coffee className="w-4 h-4 text-[#fbbf24]" />
          </div>
          <div className="my-2">
            <div className="text-4xl sm:text-5xl font-bold text-[#fbbf24] tracking-tight flex items-baseline gap-2">
              {profile?.coffee_debt || 0}
              <span className="text-sm font-arcade text-[#fbbf24]/70">CUPS</span>
            </div>
            <div className="text-xs text-[#86efac] mt-1 font-silkscreen">
              Owed to club members
            </div>
          </div>
        </div>

      </section>

      {/* 4. Activity & Profile Grid (2 Columns) */}
      <section className="activity-grid">
        
        {/* Latest Commit Card */}
        <div className="card activity-card">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0d422c]">
              <h3 className="text-sm font-bold text-[#ecfdf5] flex items-center gap-2 font-arcade uppercase">
                <GitBranch className="w-4 h-4 text-[#00ff88]" />
                <span>Latest Commit Today</span>
              </h3>
              <span className="text-xs font-silkscreen text-[#86efac] px-2 py-0.5 bg-[#030f0a] border border-[#0d422c]">
                {latestCommit ? formatKolkataTime(latestCommit.timestamp) : 'PENDING'}
              </span>
            </div>

            <div className="py-4 space-y-3">
              <div className="text-xs font-mono text-[#00ff88] font-bold truncate block">
                {latestCommit?.repo || 'tamilselvam5884771-alt/Daily_Commit_Club'}
              </div>
              
              <div className="p-3 bg-[#030f0a] border-2 border-[#0d422c] font-silkscreen text-xs text-[#a7f3d0] leading-relaxed break-words shadow-[2px_2px_0px_#020604]">
                "{latestCommit?.message || 'Awaiting commit push for today'}"
              </div>

              <div className="pt-2">
                <a
                  href={latestCommit?.url || `https://github.com/${profile?.github_username || 'tamilselvam5884771-alt'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-action"
                >
                  <Github className="w-4 h-4 text-[#00ff88]" />
                  <span>VIEW COMMIT ON GITHUB</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-2 text-xs text-[#86efac] font-silkscreen flex items-center justify-between border-t-2 border-[#0d422c]">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#00ff88]" />
              GitHub Public API
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00ff88]" />
              Asia/Kolkata (IST)
            </span>
          </div>
        </div>

        {/* GitHub Profile Card */}
        <div className="card activity-card">
          <div>
            <div className="pb-3 border-b-2 border-[#0d422c]">
              <h3 className="text-sm font-bold text-[#ecfdf5] flex items-center gap-2 font-arcade uppercase">
                <Github className="w-4 h-4 text-[#00ff88]" />
                <span>Player Profile</span>
              </h3>
            </div>

            <div className="py-4 flex items-center gap-4">
              <div className="relative shrink-0">
                {profile?.github_avatar_url ? (
                  <img 
                    src={profile.github_avatar_url} 
                    alt={profile.github_username || 'avatar'}
                    className="w-16 h-16 object-cover border-2 border-[#10b981] shadow-[3px_3px_0px_#020604]"
                  />
                ) : (
                  <div className="w-16 h-16 bg-[#064e3b] flex items-center justify-center text-xl font-arcade text-white border-2 border-[#10b981]">
                    {profile?.name?.[0] || 'H'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00ff88] text-black flex items-center justify-center border-2 border-[#030d08]">
                  <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="overflow-hidden min-w-0 space-y-1">
                <h4 className="text-lg font-bold text-[#ecfdf5] truncate">{profile?.name || 'Developer'}</h4>
                <p className="text-xs font-mono text-[#86efac] truncate">@{profile?.github_username || 'unknown'}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#10b981]/20 border border-[#10b981] text-[10px] text-[#00ff88] font-arcade uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  <span>VERIFIED MEMBER</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={profile?.github_url || `https://github.com/${profile?.github_username || 'tamilselvam5884771-alt'}`}
                target="_blank"
                rel="noreferrer"
                className="btn-action"
              >
                <Github className="w-4 h-4 text-[#00ff88]" />
                <span>OPEN GITHUB PROFILE</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="pt-3 mt-2 text-xs text-[#86efac] font-silkscreen flex items-center gap-2 border-t-2 border-[#0d422c]">
            <span className="pixel-dot"></span>
            <span>Real-time commitment verified against GitHub Events.</span>
          </div>
        </div>

      </section>

    </div>
  );
}
