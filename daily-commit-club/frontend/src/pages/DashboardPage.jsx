import React, { useState, useEffect } from 'react';
import { getChallengeStatus } from '../services/challengeApi';
import { MemberCard } from '../components/MemberCard';
import { MemberProfileModal } from '../components/MemberProfileModal';

export const DashboardPage = ({ onNavigate }) => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await getChallengeStatus();
      if (res && res.success && res.data) {
        setStatusData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load challenge status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const dateStr = statusData?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const members = statusData?.members || [];
  const committedCount = statusData?.committedTodayCount !== undefined 
    ? statusData.committedTodayCount 
    : members.filter(m => m.todayStatus === 'completed' || m.todayStatus === 'committed').length;
  const totalMembers = statusData?.totalMembers || members.length || 10;

  // Calculate Group Streak (Minimum streak across active members or max consecutive group days)
  const groupStreak = members.length > 0
    ? Math.min(...members.map(m => m.user?.currentStreak || 0))
    : 14;

  // Filter members with coffee debt
  const coffeeDebtors = members
    .filter(m => (m.user?.coffeeDebt || 0) > 0)
    .sort((a, b) => (b.user?.coffeeDebt || 0) - (a.user?.coffeeDebt || 0));

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#071C15] bg-radial-green bg-grain px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <div className="editorial-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#15533D]">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#62907A] uppercase">
              Today: {dateStr}
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

        {/* Main Grid: Member List (Left) + Summary & Coffee Board (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Member List (2 Columns on Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest text-[#8EBDA5] uppercase">
                CLUB MEMBERS ({members.length})
              </h2>
              <button
                onClick={fetchStatus}
                className="text-xs font-mono text-[#62907A] hover:text-[#B8D8C2] transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {loading && members.length === 0 ? (
              <div className="editorial-card p-12 text-center text-[#62907A] font-mono text-xs">
                Checking commit status across members...
              </div>
            ) : members.length === 0 ? (
              <div className="editorial-card p-8 text-center space-y-3">
                <p className="text-sm text-[#8EBDA5]">No club members registered yet.</p>
                <button
                  onClick={() => onNavigate('join', { mode: 'join' })}
                  className="px-4 py-2 bg-[#15533D] text-[#E2F1E7] text-xs font-bold uppercase rounded border border-[#1C6B4D]"
                >
                  Be First to Join
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.map((member, idx) => (
                  <MemberCard
                    key={member.user?.id || member.user?._id || idx}
                    member={member}
                    onClick={(m) => setSelectedMember(m)}
                  />
                ))}
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
                      key={debtor.user?.id || idx}
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
