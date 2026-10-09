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
  ArrowUpRight, 
  Flame, 
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
    <div className="page-container space-y-8 font-pixel">
        
      {/* 1. Header */}
      <section className="dashboard-header border-b border-emerald-900/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="pixel-badge">
              <span className="pixel-dot"></span>
              <span>MEMBER ROSTER</span>
            </span>
            <span className="text-xs text-emerald-600">•</span>
            <span className="text-xs text-emerald-300 font-medium">{formatKolkataDisplayDate()}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#ecfdf5] tracking-tight font-display-clean">
            Member Status Board 👥
          </h1>
          <p className="text-sm text-emerald-200/80 leading-relaxed font-sans-clean">
            Real-time daily commitment status across all registered club members
          </p>
        </div>

        <button
          onClick={fetchMembersData}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00ff88]' : ''}`} />
          <span>REFRESH DIRECTORY</span>
        </button>
      </section>

      {/* 2. 5 HUD Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-[10px] font-arcade text-[#86efac] uppercase">TOTAL</span>
          <div className="text-3xl sm:text-4xl font-bold text-[#ecfdf5] mt-2 tracking-tight">{totalMembers}</div>
        </div>

        <div className="card p-4 flex flex-col justify-between hover:border-[#00ff88] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-arcade text-[#00ff88] uppercase">COMMITTED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#00ff88] mt-2 tracking-tight">
            {committedCount}
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between hover:border-[#fbbf24] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-arcade text-[#fbbf24] uppercase">PENDING</span>
            <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#fbbf24] mt-2 tracking-tight">
            {pendingCount}
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between hover:border-[#ef4444] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-arcade text-[#ef4444] uppercase">MISSED</span>
            <Coffee className="w-3.5 h-3.5 text-[#ef4444]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#f87171] mt-2 tracking-tight">
            {missedCount}
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between col-span-2 sm:col-span-1 hover:border-[#fbbf24] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-arcade text-[#fbbf24] uppercase">COFFEE DEBT</span>
            <Coffee className="w-3.5 h-3.5 text-[#fbbf24]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#fbbf24] mt-2 tracking-tight">
            {totalCoffeeOwed} <span className="text-sm font-arcade text-[#fbbf24]/70">CUPS</span>
          </div>
        </div>

      </section>

      {/* 3. Retro Pixel Search Bar */}
      <section className="relative max-w-md">
        <Search className="w-4 h-4 text-[#86efac] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="SEARCH PLAYER BY NAME OR GITHUB..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '44px', height: '48px', fontSize: '0.85rem' }}
        />
      </section>

      {/* 4. Members Directory Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0d422c]"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 bg-[#0d422c]"></div>
                    <div className="w-24 h-3 bg-[#0d422c]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-[#fca5a5]">
            <AlertTriangle className="w-8 h-8 text-[#ef4444] mx-auto mb-2" />
            <p className="text-sm font-arcade">{error}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="card p-12 text-center text-[#86efac] space-y-3">
            <Users className="w-8 h-8 mx-auto text-[#10b981]" />
            <p className="text-sm font-silkscreen">NO PLAYERS FOUND MATCHING "{searchQuery}".</p>
          </div>
        ) : (
          <div className={`grid gap-5 ${filteredMembers.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2'}`}>
            {filteredMembers.map(member => (
              <div key={member.id} className="card flex flex-col justify-between space-y-5 group hover:border-[#00ff88] transition-all">
                
                {/* Member Top Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      {member.github_avatar_url ? (
                        <img 
                          src={member.github_avatar_url} 
                          alt={member.name}
                          className="w-14 h-14 object-cover border-2 border-[#10b981] shadow-[3px_3px_0px_#020604]"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[#064e3b] flex items-center justify-center text-lg font-arcade text-white border-2 border-[#10b981]">
                          {member.name?.[0] || 'M'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#00ff88] text-black flex items-center justify-center border-2 border-[#030d08]">
                        <CheckCircle className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h3 className="text-lg font-bold text-[#ecfdf5] truncate">{member.name}</h3>
                      <p className="text-xs font-mono text-[#86efac] truncate">@{member.github_username}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#00ff88] font-arcade">
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        <span>VERIFIED</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {member.todayStatus === 'COMMITTED' && (
                      <span className="status-pill status-pill-committed">
                        <CheckCircle2 className="w-3 h-3 text-[#00ff88]" />
                        <span>COMMITTED</span>
                      </span>
                    )}
                    {member.todayStatus === 'PENDING' && (
                      <span className="status-pill status-pending">
                        <Clock className="w-3 h-3 text-[#fbbf24]" />
                        <span>PENDING</span>
                      </span>
                    )}
                    {member.todayStatus === 'MISSED' && (
                      <span className="status-pill status-missed">
                        <Coffee className="w-3 h-3 text-[#ef4444]" />
                        <span>MISSED</span>
                      </span>
                    )}
                    {member.todayStatus === 'ERROR' && (
                      <span className="status-pill bg-[#061910] text-[#fbbf24] border-2 border-[#fbbf24]">
                        <AlertTriangle className="w-3 h-3 text-[#fbbf24]" />
                        <span>ERROR</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-[#030f0a] border-2 border-[#0d422c] text-center shadow-[2px_2px_0px_#020604]">
                  <div>
                    <div className="text-[10px] font-arcade text-[#86efac]/70 uppercase">COMMITS</div>
                    <div className="text-base font-bold text-[#ecfdf5] mt-0.5">
                      {member.todayCommits}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-arcade text-[#86efac]/70 uppercase">STREAK</div>
                    <div className="text-base font-bold text-[#fbbf24] mt-0.5">
                      {member.current_streak || 0}D
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-arcade text-[#86efac]/70 uppercase">DEBT</div>
                    <div className="text-base font-bold text-[#fbbf24] mt-0.5">
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
                    className="btn-action"
                  >
                    <Github className="w-4 h-4 text-[#00ff88]" />
                    <span>VIEW GITHUB PROFILE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
