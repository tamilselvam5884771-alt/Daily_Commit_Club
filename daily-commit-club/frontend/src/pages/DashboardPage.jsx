import React, { useState, useEffect, useCallback } from 'react';
import { getChallengeStatus, syncUserCommits } from '../services/challengeApi';
import { MemberCard } from '../components/MemberCard';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchStatus = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncing(true);
      const res = await getChallengeStatus();
      if (res && res.success && res.data) {
        setStatusData(res.data);
        setLastUpdated(new Date());
        setSyncError(null);
      }
      if (refreshUser) {
        await refreshUser(true); // Silent refresh - does not set global loading to true
      }
    } catch (err) {
      console.warn('Failed to load challenge status from database', err);
      setSyncError('Unable to connect to backend server right now.');
    } finally {
      setLoading(false);
      if (isManual) setSyncing(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    fetchStatus(false);
    // Background polling every 60s created ONLY ONCE on mount
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (!user || syncing) return;
    const targetUserId = user._id || user.id;
    if (!targetUserId) return;

    setSyncing(true);
    setSyncStatusText('SYNCING...');
    setSyncError(null);

    try {
      const res = await syncUserCommits(targetUserId);
      if (res && res.success) {
        setSyncStatusText('SYNCED ✓');
        await fetchStatus(false);
      } else if (res && res.errorType === 'GITHUB_API_ERROR') {
        setSyncStatusText('GITHUB UNAVAILABLE');
        setSyncError(res.message || 'GitHub API rate limit 403 / connection timeout. No penalty applied.');
      } else {
        setSyncStatusText('SYNCED ✓');
        await fetchStatus(false);
      }
    } catch (err) {
      console.warn('Manual sync error:', err);
      setSyncStatusText('SYNC ERROR');
      setSyncError('GitHub sync request encountered a network error.');
    } finally {
      setSyncing(false);
      setTimeout(() => {
        setSyncStatusText(null);
      }, 4000);
    }
  };

  const dateStr = statusData?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const members = statusData?.members || [];
  const daysCount = statusData?.daysCount || 1;
  const totalMembers = statusData?.totalMembers ?? members.length;
  
  const committedCount = statusData?.committedTodayCount !== undefined 
    ? statusData.committedTodayCount 
    : members.filter(m => m.todayStatus === 'completed' || m.todayStatus === 'committed').length;

  // Calculate Group Streak dynamically (Minimum streak across active members, 0 if no members)
  const groupStreak = members.length > 0
    ? Math.min(...members.map(m => m.user?.currentStreak || 0))
    : 0;

  // Filter members with coffee debt from real database records
  const coffeeDebtors = members
    .filter(m => (m.user?.coffeeDebt || 0) > 0)
    .sort((a, b) => (b.user?.coffeeDebt || 0) - (a.user?.coffeeDebt || 0));

  // Find logged in member status in current challenge
  const loggedInMemberStatus = user ? members.find(
    m => (m.user?._id || m.user?.id)?.toString() === (user._id || user.id)?.toString() ||
         m.user?.githubUsername?.toLowerCase() === user.githubUsername?.toLowerCase()
  ) : null;

  const currentTodayStatus = loggedInMemberStatus?.todayStatus || 'pending';
  const currentTodayCommits = loggedInMemberStatus?.todayCommitCount || 0;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#071C15] bg-radial-green bg-grain px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="editorial-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#15533D]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-widest text-[#62907A] uppercase">
                DAY {daysCount} • {dateStr}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#238561] bg-[#103D2E] border border-[#1C6B4D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#238561]" /> SYNC STRATEGY: 60S / MANUAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#E2F1E7] uppercase mt-1">
              DAILY COMMIT CLUB
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Committed Ratio */}
            <div className="text-right">
              <div className="text-xs font-bold tracking-widest text-[#62907A] uppercase">
                TODAY'S STATUS
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#E2F1E7] mt-0.5">
                {committedCount} / {totalMembers} <span className="text-xs text-[#8EBDA5] font-normal uppercase">COMMITTED</span>
              </div>
            </div>

            {/* Group Streak */}
            <div className="pl-6 border-l border-[#103D2E] text-right">
              <div className="text-xs font-bold tracking-widest text-[#62907A] uppercase">
                GROUP STREAK
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#E2F1E7] flex items-center justify-end gap-1 mt-0.5">
                🔥 {groupStreak} <span className="text-xs text-[#8EBDA5] font-normal uppercase">DAYS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Error Banner if any */}
        {syncError && (
          <div className="bg-[#0B2A20] border border-[#1C6B4D] p-3 rounded text-xs font-mono text-[#8EBDA5] flex items-center justify-between">
            <span>⚠️ {syncError}</span>
            <button onClick={() => fetchStatus(true)} className="underline hover:text-[#E2F1E7]">RETRY</button>
          </div>
        )}

        {/* Logged-In User Account Section */}
        {user && (
          <div className="editorial-card p-6 border-2 border-[#1C6B4D] bg-[#0B2A20]/90 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#103D2E] pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={user.githubAvatar || `https://github.com/${user.githubUsername}.png`}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-[#238561] object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold tracking-wider text-[#E2F1E7] uppercase">
                      {user.name}
                    </h2>
                    <span className="text-[10px] font-mono font-bold text-[#E2F1E7] bg-[#238561] px-2 py-0.5 rounded uppercase">
                      LOGGED IN ACCOUNT
                    </span>
                  </div>
                  <a
                    href={user.githubUrl || `https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#8EBDA5] hover:text-[#E2F1E7] block mt-0.5"
                  >
                    @{user.githubUsername}
                  </a>
                </div>
              </div>

              {/* Status Pill & Manual Sync Button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-[#62907A] uppercase tracking-wider mb-1">
                    YOUR COMMIT STATUS TODAY
                  </div>
                  {currentTodayStatus === 'completed' || currentTodayStatus === 'committed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold tracking-wider uppercase status-committed">
                      <span>✓</span> COMMITTED ({currentTodayCommits} {currentTodayCommits === 1 ? 'COMMIT' : 'COMMITS'})
                    </span>
                  ) : currentTodayStatus === 'github_api_error' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold tracking-wider uppercase status-waiting">
                      <span>⚠</span> GITHUB API UNAVAILABLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold tracking-wider uppercase status-waiting">
                      <span>○</span> PENDING COMMIT
                    </span>
                  )}
                </div>

                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="px-3.5 py-2 bg-[#15533D] hover:bg-[#1C6B4D] text-[#E2F1E7] text-xs font-mono font-bold tracking-wider rounded border border-[#1C6B4D] transition-colors disabled:opacity-50 min-w-[130px] text-center"
                  title="Check today's commit status on GitHub"
                >
                  {syncStatusText || (syncing ? '↻ SYNCING...' : '↻ SYNC GITHUB')}
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs pt-1">
              <div className="bg-[#071C15] p-3 rounded border border-[#103D2E]">
                <div className="text-[10px] text-[#62907A] uppercase font-bold tracking-wider">CURRENT STREAK</div>
                <div className="text-lg font-bold text-[#E2F1E7] mt-0.5">
                  🔥 {user.currentStreak || 0} DAYS
                </div>
              </div>

              <div className="bg-[#071C15] p-3 rounded border border-[#103D2E]">
                <div className="text-[10px] text-[#62907A] uppercase font-bold tracking-wider">LONGEST STREAK</div>
                <div className="text-lg font-bold text-[#B8D8C2] mt-0.5">
                  🏆 {user.longestStreak || 0} DAYS
                </div>
              </div>

              <div className="bg-[#071C15] p-3 rounded border border-[#103D2E]">
                <div className="text-[10px] text-[#62907A] uppercase font-bold tracking-wider">COMPLETED DAYS</div>
                <div className="text-lg font-bold text-[#8EBDA5] mt-0.5">
                  ✓ {user.totalCompletedDays || 0} DAYS
                </div>
              </div>

              <div className="bg-[#071C15] p-3 rounded border border-[#103D2E]">
                <div className="text-[10px] text-[#62907A] uppercase font-bold tracking-wider">COFFEE DEBT</div>
                <div className="text-lg font-bold text-[#B8D8C2] mt-0.5">
                  ☕ {user.coffeeDebt || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Member List (Left) + Summary & Coffee Board (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Member List (2 Columns on Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest text-[#8EBDA5] uppercase">
                CLUB MEMBERS ({members.length})
              </h2>
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-[11px] font-mono text-[#62907A]">
                    Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
                <button
                  onClick={() => fetchStatus(true)}
                  disabled={syncing}
                  className="text-xs font-mono text-[#62907A] hover:text-[#B8D8C2] transition-colors disabled:opacity-50"
                >
                  {syncing ? '↻ Syncing...' : '↻ Refresh'}
                </button>
              </div>
            </div>

            {loading && members.length === 0 ? (
              <div className="editorial-card p-12 text-center text-[#62907A] font-mono text-xs">
                Retrieving club members from database...
              </div>
            ) : members.length === 0 ? (
              <div className="editorial-card p-8 text-center space-y-3 border border-[#15533D]">
                <p className="text-sm text-[#8EBDA5]">No club members registered in database yet.</p>
                <button
                  onClick={() => onNavigate('join', { mode: 'join' })}
                  className="px-4 py-2 bg-[#15533D] text-[#E2F1E7] text-xs font-bold uppercase rounded border border-[#1C6B4D]"
                >
                  Be First to Join
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.map((member, idx) => {
                  const mId = member.user?._id || member.user?.id;
                  const isCurrent = user && (
                    mId?.toString() === (user._id || user.id)?.toString() ||
                    member.user?.githubUsername?.toLowerCase() === user.githubUsername?.toLowerCase()
                  );
                  return (
                    <MemberCard
                      key={mId || member.user?.githubUsername || idx}
                      member={member}
                      isCurrentUser={Boolean(isCurrent)}
                      onClick={(m) => setSelectedMember(m)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Daily Summary & Coffee Board */}
          <div className="space-y-6">
            
            {/* Daily Summary Card */}
            <div className="editorial-card p-6 space-y-4 border border-[#15533D]">
              <h3 className="text-xs font-bold tracking-widest text-[#8EBDA5] uppercase border-b border-[#103D2E] pb-3">
                DAILY SUMMARY
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between text-[#B8D8C2]">
                  <span className="text-[#62907A]">Total Members</span>
                  <span className="font-bold">{totalMembers}</span>
                </div>
                <div className="flex items-center justify-between text-[#B8D8C2]">
                  <span className="text-[#62907A]">Committed Today</span>
                  <span className="font-bold text-[#E2F1E7]">{committedCount}</span>
                </div>
                <div className="flex items-center justify-between text-[#B8D8C2]">
                  <span className="text-[#62907A]">Pending / Waiting</span>
                  <span className="font-bold text-[#8EBDA5]">{totalMembers - committedCount}</span>
                </div>
              </div>
            </div>

            {/* Coffee Board */}
            <div className="editorial-card p-6 space-y-4 border border-[#15533D]">
              <div className="flex items-center justify-between border-b border-[#103D2E] pb-3">
                <h3 className="text-xs font-bold tracking-widest text-[#8EBDA5] uppercase flex items-center gap-2">
                  <span>☕</span> COFFEE BOARD
                </h3>
                <span className="text-[10px] font-mono text-[#62907A]">DEBT TRACKER</span>
              </div>

              {coffeeDebtors.length === 0 ? (
                <div className="text-xs font-mono text-[#62907A] text-center py-4">
                  No coffee debts recorded. Outstanding commitment!
                </div>
              ) : (
                <div className="space-y-2.5 font-mono text-xs">
                  {coffeeDebtors.map((debtor, idx) => (
                    <div
                      key={debtor.user?.id || debtor.user?._id || idx}
                      className="flex items-center justify-between p-2.5 bg-[#071C15] rounded border border-[#103D2E]"
                    >
                      <div className="flex items-center gap-2 text-[#E2F1E7] uppercase font-bold">
                        <span>☕</span>
                        <span>{debtor.user?.name}</span>
                      </div>
                      <span className="text-[#B8D8C2] font-semibold">
                        {debtor.user?.coffeeDebt} {debtor.user?.coffeeDebt === 1 ? 'coffee' : 'coffees'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

