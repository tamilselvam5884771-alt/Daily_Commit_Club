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
  Search,
  ShieldCheck,
  CheckCircle
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
      // 1. Fetch only Daily Commit Club profiles (must have github_username)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('github_username', 'is', null)
        .order('name', { ascending: true });

      if (profilesError) throw profilesError;

      // 2. Fetch today's daily_activity records for these users
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
    <div className="page-container space-y-6">
        
      {/* 1. Page Header */}
      <section className="dashboard-header">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Daily Commit Club Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Member Status
          </h1>
          <p className="text-xs sm:text-sm text-emerald-400/80 mt-1 font-mono">
            Real-time daily commitment status for {formatKolkataDisplayDate()} • Asia/Kolkata (IST)
          </p>
        </div>

        <button
          onClick={fetchMembersData}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </section>

      {/* 2. Summary Stats Grid (5 Cards) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono font-semibold text-emerald-400/70 uppercase">Total Members</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">{totalMembers}</div>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase">Committed</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
            {committedCount}
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono font-semibold text-amber-400 uppercase">Pending</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1 flex items-center gap-1.5">
            {pendingCount}
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono font-semibold text-red-400 uppercase">Missed</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono mt-1 flex items-center gap-1.5">
            {missedCount}
            <Coffee className="w-4 h-4 text-red-400" />
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono font-semibold text-amber-400 uppercase">Coffee Debt</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
            {totalCoffeeOwed} ☕
          </div>
        </div>

      </section>

      {/* 3. Search Bar */}
      <section className="relative max-w-md">
        <Search className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search member by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '38px', height: '44px', fontSize: '0.875rem' }}
        />
      </section>

      {/* 4. Members Directory Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(i => (
              <div key={i} className="card p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-900/40"></div>
                  <div className="space-y-1.5">
                    <div className="w-28 h-4 bg-emerald-900/40 rounded"></div>
                    <div className="w-20 h-3 bg-emerald-900/40 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-red-300">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="card p-12 text-center text-emerald-400/60 space-y-2">
            <Users className="w-8 h-8 mx-auto text-emerald-400/40" />
            <p className="text-sm">No members found matching your search.</p>
          </div>
        ) : (
          <div className={`grid gap-5 ${filteredMembers.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2'}`}>
            {filteredMembers.map(member => (
              <div key={member.id} className="card flex flex-col justify-between space-y-5">
                
                {/* Member Top Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      {member.github_avatar_url ? (
                        <img 
                          src={member.github_avatar_url} 
                          alt={member.name}
                          className="w-14 h-14 rounded-full object-cover border border-[#143527]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-emerald-800 flex items-center justify-center text-lg font-bold text-emerald-100">
                          {member.name?.[0] || 'M'}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center border-2 border-[#071a12]">
                        <CheckCircle className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{member.name}</h3>
                      <p className="text-xs font-mono text-emerald-400/70 truncate">@{member.github_username}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Member Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {member.todayStatus === 'COMMITTED' && (
                      <span className="status-pill status-pill-committed">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMMITTED
                      </span>
                    )}
                    {member.todayStatus === 'PENDING' && (
                      <span className="status-pill status-pending">
                        <Clock className="w-3.5 h-3.5" />
                        PENDING
                      </span>
                    )}
                    {member.todayStatus === 'MISSED' && (
                      <span className="status-pill status-missed">
                        <Coffee className="w-3.5 h-3.5" />
                        MISSED
                      </span>
                    )}
                    {member.todayStatus === 'ERROR' && (
                      <span className="status-pill status-missed">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        ERROR
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-[#04110C] border border-[#143527] font-mono text-center">
                  <div>
                    <div className="text-[10px] text-emerald-400/60 uppercase">Commits</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {member.todayCommits}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-emerald-400/60 uppercase">Streak</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">
                      {member.current_streak || 0}d
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-emerald-400/60 uppercase">Debt</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">
                      {member.coffee_debt || 0} ☕
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-1">
                  <a
                    href={member.github_url || `https://github.com/${member.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-action font-mono text-xs"
                  >
                    <Github className="w-4 h-4 text-emerald-400" />
                    <span>View GitHub Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400/70" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
