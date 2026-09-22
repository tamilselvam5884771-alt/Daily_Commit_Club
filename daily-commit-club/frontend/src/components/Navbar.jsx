import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-[#0B2A20] border-b border-[#103D2E] px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
          className="cursor-pointer flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded bg-[#103D2E] border border-[#15533D] flex items-center justify-center text-[#B8D8C2] font-bold text-sm tracking-wider">
            DC
          </div>
          <span className="font-extrabold tracking-widest text-[#B8D8C2] text-sm md:text-base uppercase">
            DAILY COMMIT CLUB
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div 
                onClick={() => onNavigate('dashboard')} 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img 
                  src={user.githubAvatar || `https://github.com/${user.githubUsername}.png`} 
                  alt={user.name} 
                  className="w-7 h-7 rounded-full border border-[#1C6B4D] object-cover"
                />
                <span className="text-xs font-semibold text-[#B8D8C2] hidden sm:inline">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                className="text-xs font-semibold tracking-wider text-[#62907A] hover:text-[#B8D8C2] px-3 py-1.5 rounded border border-[#103D2E] hover:border-[#15533D] transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('join', { mode: 'login' })}
                className="text-xs font-semibold tracking-wider text-[#B8D8C2] hover:text-[#E2F1E7] px-3 py-1.5 transition-colors"
              >
                LOGIN
              </button>
              <button
                onClick={() => onNavigate('join', { mode: 'join' })}
                className="text-xs font-bold tracking-wider bg-[#15533D] hover:bg-[#1C6B4D] text-[#E2F1E7] px-4 py-2 rounded border border-[#1C6B4D] transition-all"
              >
                JOIN THE CLUB
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
