import React from 'react';

export const MemberCard = ({ member, onClick, isCurrentUser = false }) => {
  const { user = {}, todayStatus = 'pending', todayCommitCount = 0, lastCommitMessage } = member;

  const name = user.name || 'Member';
  const githubUsername = user.githubUsername || 'username';
  const avatar = user.githubAvatar || `https://github.com/${githubUsername}.png`;
  const githubUrl = user.githubUrl || `https://github.com/${githubUsername}`;
  const streak = user.currentStreak || 0;

  // Monochromatic green status formatting (Strictly NO RED)
  const renderStatusBadge = () => {
    if (todayStatus === 'completed' || todayStatus === 'committed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase status-committed">
          <span>✓</span> COMMITTED TODAY
        </span>
      );
    }
    if (todayStatus === 'missed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase status-missed">
          <span>×</span> MISSED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase status-waiting">
        <span>○</span> WAITING
      </span>
    );
  };

  return (
    <div
      onClick={() => onClick(member)}
      className={`editorial-card p-5 cursor-pointer relative group flex flex-col justify-between space-y-4 transition-all ${
        isCurrentUser ? 'border-2 border-[#238561] bg-[#0B2A20]/90 shadow-md' : 'border border-[#15533D]'
      }`}
    >
      {/* Top Header: Avatar + Info */}
      <div className="flex items-start gap-3.5">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className={`w-12 h-12 rounded object-cover transition-colors ${
              isCurrentUser ? 'border-2 border-[#238561]' : 'border border-[#15533D] group-hover:border-[#1C6B4D]'
            }`}
          />
          {isCurrentUser && (
            <span className="absolute -bottom-1 -right-1 bg-[#238561] text-[#E2F1E7] text-[9px] font-extrabold px-1 rounded uppercase">
              YOU
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-sm font-bold tracking-wider text-[#E2F1E7] uppercase truncate group-hover:text-[#B8D8C2] transition-colors">
              {name}
            </h3>
            {isCurrentUser && (
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#238561] bg-[#103D2E] px-1.5 py-0.5 rounded border border-[#1C6B4D]">
                LOGGED IN
              </span>
            )}
          </div>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-mono text-[#62907A] hover:text-[#8EBDA5] truncate block mt-0.5"
          >
            github.com/{githubUsername}
          </a>
        </div>
      </div>

      {/* Middle Row: Status Badge & Commit Count */}
      <div className="flex items-center justify-between pt-1 border-t border-[#103D2E]/60">
        <div>{renderStatusBadge()}</div>
        {todayCommitCount > 0 && (
          <span className="text-xs font-mono font-semibold text-[#8EBDA5]">
            {todayCommitCount} {todayCommitCount === 1 ? 'COMMIT' : 'COMMITS'}
          </span>
        )}
      </div>

      {/* Bottom Row: Streak & Last Commit */}
      <div className="space-y-2 pt-1 border-t border-[#103D2E]/60">
        <div className="flex items-center justify-between text-xs font-semibold text-[#B8D8C2]">
          <span className="text-[#62907A] uppercase text-[10px] tracking-widest">Streak</span>
          <span className="font-mono text-[#E2F1E7] flex items-center gap-1">
            🔥 {streak} DAY STREAK
          </span>
        </div>

        {lastCommitMessage && (
          <div className="text-[11px] text-[#62907A] font-mono truncate pt-0.5">
            <span className="text-[#1C6B4D]">Last commit: </span>
            <span className="text-[#8EBDA5]">"{lastCommitMessage}"</span>
          </div>
        )}
      </div>
    </div>
  );
};

