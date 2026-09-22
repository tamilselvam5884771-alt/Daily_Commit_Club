import React, { useEffect, useState } from 'react';
import { getUserActivity } from '../services/activityApi';

export const MemberProfileModal = ({ member, onClose }) => {
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user = {}, todayStatus = 'pending', todayCommitCount = 0 } = member || {};
  const name = user.name || 'Member';
  const githubUsername = user.githubUsername || 'username';
  const avatar = user.githubAvatar || `https://github.com/${githubUsername}.png`;
  const githubUrl = user.githubUrl || `https://github.com/${githubUsername}`;
  const currentStreak = user.currentStreak || 0;
  const longestStreak = user.longestStreak || 0;
  const coffeeDebt = user.coffeeDebt || 0;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user.id && !user._id) return;
      try {
        setLoading(true);
        const res = await getUserActivity(user.id || user._id);
        if (res && res.data) {
          setActivityHistory(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch activity history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Generate 30 days grid data
  const generate30DayGrid = () => {
    const grid = [];
    const today = new Date();
    
    // Map activity by date string (YYYY-MM-DD)
    const actMap = new Map();
    if (Array.isArray(activityHistory)) {
      activityHistory.forEach((a) => {
        actMap.set(a.date, a);
      });
    }

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const monthDayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const act = actMap.get(dateStr);
      const commitCount = act ? act.commitCount : 0;
      const status = act ? act.status : 'no_activity';

      grid.push({
        dateStr,
        monthDayStr,
        commitCount,
        status
      });
    }

    return grid;
  };

  const gridData = generate30DayGrid();

  // Pick monolithic green shade based on commit count
  const getCellShade = (count) => {
    if (count === 0) return 'bg-[#071C15] border-[#103D2E]';
    if (count === 1) return 'bg-[#103D2E] border-[#15533D]';
    if (count <= 3) return 'bg-[#15533D] border-[#1C6B4D]';
    return 'bg-[#1C6B4D] border-[#238561]';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#071C15]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="editorial-card max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in relative border border-[#15533D]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#62907A] hover:text-[#E2F1E7] text-lg font-mono p-2 transition-colors"
        >
          ✕
        </button>

        {/* Profile Header */}
        <div className="flex items-start gap-4 border-b border-[#103D2E] pb-6">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded border border-[#15533D] object-cover"
          />
          <div>
            <h2 className="text-xl font-bold tracking-wider text-[#E2F1E7] uppercase">
              {name}
            </h2>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#8EBDA5] hover:text-[#E2F1E7] block mt-1"
            >
              @{githubUsername}
            </a>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-mono font-semibold text-[#B8D8C2] bg-[#103D2E] px-2.5 py-1 rounded border border-[#15533D]">
                🔥 {currentStreak} DAY STREAK
              </span>
              <span className="text-xs font-mono text-[#62907A]">
                Coffee Debt: <strong className="text-[#B8D8C2]">{coffeeDebt}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#071C15] p-3 rounded border border-[#103D2E]">
            <div className="text-[10px] font-bold tracking-widest text-[#62907A] uppercase">TODAY</div>
            <div className="text-sm font-mono font-bold text-[#E2F1E7] mt-1">
              {todayCommitCount} {todayCommitCount === 1 ? 'COMMIT' : 'COMMITS'}
            </div>
          </div>

          <div className="bg-[#071C15] p-3 rounded border border-[#103D2E]">
            <div className="text-[10px] font-bold tracking-widest text-[#62907A] uppercase">LONGEST STREAK</div>
            <div className="text-sm font-mono font-bold text-[#B8D8C2] mt-1">
              {longestStreak} DAYS
            </div>
          </div>

          <div className="bg-[#071C15] p-3 rounded border border-[#103D2E]">
            <div className="text-[10px] font-bold tracking-widest text-[#62907A] uppercase">COFFEE DEBT</div>
            <div className="text-sm font-mono font-bold text-[#B8D8C2] mt-1">
              ☕ {coffeeDebt}
            </div>
          </div>
        </div>

        {/* 30-Day Monolithic Dark-Green Contribution Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-[#8EBDA5] uppercase">
            <span>30-DAY ACTIVITY CALENDAR</span>
            <span className="text-[10px] font-mono text-[#62907A] font-normal">Monolithic Dark Green</span>
          </div>

          <div className="bg-[#071C15] p-4 rounded border border-[#103D2E]">
            <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
              {gridData.map((item, idx) => (
                <div
                  key={idx}
                  title={`${item.monthDayStr}: ${item.commitCount} commit(s)`}
                  className={`aspect-square rounded-[3px] border ${getCellShade(item.commitCount)} transition-transform hover:scale-110 cursor-pointer`}
                />
              ))}
            </div>
            
            {/* Matrix Legend */}
            <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-[#62907A] mt-4 pt-2 border-t border-[#103D2E]/40">
              <span>Less</span>
              <span className="w-2.5 h-2.5 bg-[#071C15] border border-[#103D2E] rounded-[2px]" />
              <span className="w-2.5 h-2.5 bg-[#103D2E] border border-[#15533D] rounded-[2px]" />
              <span className="w-2.5 h-2.5 bg-[#15533D] border border-[#1C6B4D] rounded-[2px]" />
              <span className="w-2.5 h-2.5 bg-[#1C6B4D] border border-[#238561] rounded-[2px]" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="space-y-3">
          <div className="text-xs font-bold tracking-widest text-[#8EBDA5] uppercase">
            RECENT ACTIVITY
          </div>

          <div className="bg-[#071C15] rounded border border-[#103D2E] divide-y divide-[#103D2E]/60 max-h-48 overflow-y-auto font-mono text-xs">
            {gridData.slice().reverse().slice(0, 7).map((item, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between text-[#B8D8C2]">
                <div className="flex items-center gap-2">
                  <span className={item.commitCount > 0 ? 'text-[#B8D8C2]' : 'text-[#62907A]'}>
                    {item.commitCount > 0 ? '✓' : '×'}
                  </span>
                  <span>{item.monthDayStr}</span>
                </div>
                <span className="text-[11px] text-[#62907A]">
                  {item.commitCount} {item.commitCount === 1 ? 'commit' : 'commits'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-3 bg-[#103D2E] hover:bg-[#15533D] text-[#E2F1E7] font-bold tracking-widest text-xs uppercase rounded border border-[#15533D] transition-colors"
          >
            VIEW GITHUB PROFILE ↗
          </a>
        </div>

      </div>
    </div>
  );
};
