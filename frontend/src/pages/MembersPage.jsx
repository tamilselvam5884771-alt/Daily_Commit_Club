import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getKolkataDateString, formatKolkataDisplayDate, formatKolkataTime } from '../utils/dateUtils';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  AlertTriangle, 
  Github, 
  ExternalLink, 
  Flame, 
  GitCommit,
  RefreshCw,
  Search
} from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = getKolkataDateString();

  const fetchMembersData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (profilesError) throw profilesError;

      // 2. Fetch today's daily_activity records for all users
      const { data: activityData, error: activityError } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('activity_date', todayStr);

      if (activityError) throw activityError;

      // Map activity by user_id
      const activityMap = {};
      (activityData || []).forEach(act => {
        activityMap[act.user_id] = act;
      });

      // Combine profiles with today's status
      const combined = (profilesData || []).map(p => {
        const todayAct = activityMap[p.id];
        let status = 'PENDING';
        let commitCount = 0;
        let latestRepo = null;
        let latestTime = null;

        if (todayAct) {
          status = todayAct.status || 'PENDING';
          commitCount = todayAct.commit_count || 0;
          latestRepo = todayAct.latest_commit_repo;
          latestTime = todayAct.latest_commit_at;
        }

        return {
          ...p,
          todayStatus: status,
          todayCommits: commitCount,
          latestRepo,
          latestTime
        };
      });

      // Sort by status priority: COMMITTED -> PENDING -> MISSED -> ERROR
      const statusPriority = { COMMITTED: 1, PENDING: 2, MISSED: 3, ERROR: 4 };
      combined.sort((a, b) => {
        const pA = statusPriority[a.todayStatus] || 5;
        const pB = statusPriority[b.todayStatus] || 5;
        if (pA !== pB) return pA - pB;
        // Secondary sort by commit count descending
        return b.todayCommits - a.todayCommits;
      });

      setMembers(combined);

    } catch (err) {
      console.error('Error fetching members data:', err);
      setError('Failed to load members activity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersData();
  }, []);

  // Compute summary stats
  const totalMembers = members.length;
  const committedCount = members.filter(m => m.todayStatus === 'COMMITTED').length;
  const pendingCount = members.filter(m => m.todayStatus === 'PENDING').length;
  const missedCount = members.filter(m => m.todayStatus === 'MISSED').length;
  const totalCoffeeOwed = members.reduce((sum, m) => sum + (m.coffee_debt || 0), 0);

  // Filtered members for search
  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.github_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05140e] text-emerald-50 font-sans pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/40 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Daily Commit Club Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-50 tracking-tight">
              Member Status
            </h1>
            <p className="text-xs text-emerald-400/70 mt-1">
              Real-time daily commitment status for all club members on {formatKolkataDisplayDate()}
            </p>
          </div>

          <button
            onClick={fetchMembersData}
            disabled={loading}
            className="club-button-secondary py-2.5 px-4 text-xs shrink-0 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <div className="club-card p-4">
            <span className="text-[11px] font-mono font-semibold text-emerald-400/70 uppercase">Total Members</span>
            <div className="text-2xl font-extrabold text-emerald-50 font-mono mt-1">{totalMembers}</div>
          </div>

          <div className="club-card p-4 border-emerald-500/40 bg-emerald-950/60">
            <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase">Committed Today</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
              {committedCount}
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="club-card p-4 border-amber-500/30 bg-amber-950/20">
            <span className="text-[11px] font-mono font-semibold text-amber-300 uppercase">Pending</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1 flex items-center gap-1.5">
              {pendingCount}
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="club-card p-4 border-red-500/30 bg-red-950/20">
            <span className="text-[11px] font-mono font-semibold text-red-300 uppercase">Missed Today</span>
            <div className="text-2xl font-extrabold text-red-400 font-mono mt-1 flex items-center gap-1.5">
              {missedCount}
              <Coffee className="w-4 h-4 text-red-400" />
            </div>
          </div>

          <div className="club-card p-4 border-amber-500/40 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono font-semibold text-amber-400/80 uppercase">Total Coffee Debt</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {totalCoffeeOwed} ☕
            </div>
          </div>

        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="club-input pl-10 text-xs py-2.5"
          />
        </div>

        {/* MEMBERS LIST GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="club-card p-5 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-900/50"></div>
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-emerald-900/50 rounded"></div>
                    <div className="w-16 h-3 bg-emerald-900/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="club-card p-8 text-center text-red-300 bg-red-950/30 border-red-800/40">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="club-card p-8 text-center text-emerald-400/60">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No members found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMembers.map(member => (
              <div 
                key={member.id} 
                className={`club-card p-5 flex flex-col justify-between space-y-4 ${
                  member.todayStatus === 'COMMITTED' 
                    ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/70 to-emerald-950/30' 
                    : member.todayStatus === 'PENDING'
                    ? 'border-amber-500/30'
                    : member.todayStatus === 'MISSED'
                    ? 'border-red-500/30 bg-red-950/10'
                    : 'border-emerald-900/60'
                }`}
              >
                
                {/* Member Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {member.github_avatar_url ? (
                      <img 
                        src={member.github_avatar_url} 
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover border border-emerald-500/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-100">
                        {member.name?.[0] || 'M'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-emerald-100 leading-snug">{member.name}</h3>
                      <a 
                        href={member.github_url || `https://github.com/${member.github_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-emerald-400/70 hover:text-emerald-200 inline-flex items-center gap-1"
                      >
                        @{member.github_username}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {member.todayStatus === 'COMMITTED' && (
                      <span className="status-badge status-committed text-[10px] py-1 px-2.5">
                        <CheckCircle2 className="w-3 h-3" />
                        COMMITTED
                      </span>
                    )}
                    {member.todayStatus === 'PENDING' && (
                      <span className="status-badge status-pending text-[10px] py-1 px-2.5">
                        <Clock className="w-3 h-3" />
                        PENDING
                      </span>
                    )}
                    {member.todayStatus === 'MISSED' && (
                      <span className="status-badge status-missed text-[10px] py-1 px-2.5">
                        <Coffee className="w-3 h-3" />
                        MISSED
                      </span>
                    )}
                    {member.todayStatus === 'ERROR' && (
                      <span className="status-badge bg-emerald-900 text-emerald-300 text-[10px] py-1 px-2.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        ERROR
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Stats Row */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-emerald-950/80 border border-emerald-900/50 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-emerald-500/70 uppercase block">Commits</span>
                    <span className="text-sm font-bold text-emerald-100">{member.todayCommits}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-500/70 uppercase block">Streak</span>
                    <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-0.5">
                      <Flame className="w-3 h-3 text-amber-500" />
                      {member.current_streak || 0}d
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-500/70 uppercase block">Coffee</span>
                    <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-0.5">
                      ☕ {member.coffee_debt || 0}
                    </span>
                  </div>
                </div>

                {/* Recent Repo Footer */}
                {member.latestRepo ? (
                  <div className="text-[11px] font-mono text-emerald-400/60 truncate flex items-center gap-1.5">
                    <GitCommit className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{member.latestRepo}</span>
                    {member.latestTime && (
                      <span className="text-emerald-600 font-sans">• {formatKolkataTime(member.latestTime)}</span>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-emerald-600 italic">
                    No commits recorded today
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
