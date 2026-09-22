import React from 'react';

export const LandingPage = ({ onNavigate, stats = {} }) => {
  const memberCount = stats.totalMembers || 10;
  const daysCount = stats.daysCount || 27;
  const committedTodayCount = stats.committedTodayCount !== undefined ? stats.committedTodayCount : 8;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#071C15] bg-radial-green bg-grain flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="max-w-xl w-full text-center space-y-10 z-10 animate-fade-in">
        
        {/* Main Title Stack */}
        <div className="space-y-1">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-widest text-[#E2F1E7] leading-none uppercase select-none">
            DAILY
          </h1>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-widest text-[#B8D8C2] leading-none uppercase select-none">
            COMMIT
          </h1>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-widest text-[#1C6B4D] leading-none uppercase select-none">
            CLUB
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#8EBDA5] tracking-wide font-normal max-w-md mx-auto">
          "Commit every day. Keep your streak alive."
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-b border-[#103D2E] py-6 my-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#E2F1E7]">
              {memberCount}
            </div>
            <div className="text-[10px] sm:text-xs tracking-widest uppercase text-[#62907A] font-semibold mt-1">
              MEMBERS
            </div>
          </div>

          <div className="text-center border-x border-[#103D2E]">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#E2F1E7]">
              {daysCount}
            </div>
            <div className="text-[10px] sm:text-xs tracking-widest uppercase text-[#62907A] font-semibold mt-1">
              DAYS
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#B8D8C2]">
              {committedTodayCount}
            </div>
            <div className="text-[10px] sm:text-xs tracking-widest uppercase text-[#62907A] font-semibold mt-1">
              COMMITTED TODAY
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('join', { mode: 'join' })}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#15533D] hover:bg-[#1C6B4D] text-[#E2F1E7] font-bold tracking-widest text-sm uppercase rounded border border-[#1C6B4D] hover:border-[#238561] transition-all shadow-lg shadow-[#071C15]"
          >
            JOIN THE CLUB
          </button>
          
          <button
            onClick={() => onNavigate('join', { mode: 'login' })}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0B2A20] hover:bg-[#103D2E] text-[#B8D8C2] font-semibold tracking-widest text-sm uppercase rounded border border-[#103D2E] hover:border-[#15533D] transition-all"
          >
            LOGIN
          </button>
        </div>

      </div>

      {/* Decorative subtle lighting blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1C6B4D]/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};
