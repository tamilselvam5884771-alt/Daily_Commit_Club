import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, LayoutDashboard, Users, LogOut, Menu, X, Github } from 'lucide-react';

export default function Navbar() {
  const { profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItemClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <header className="navbar-header">
      <div className="page-container navbar-inner">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-inner">
            <Coffee className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-emerald-100 font-mono block leading-none">
              DAILY COMMIT CLUB
            </span>
            <span className="text-[10px] text-emerald-400/60 font-mono tracking-widest uppercase">
              GitHub Commitment Tracker
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={navItemClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/members" className={navItemClass}>
            <Users className="w-4 h-4" />
            <span>Members</span>
          </NavLink>

          <NavLink to="/coffee" className={navItemClass}>
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>Coffee Debt</span>
          </NavLink>
        </nav>

        {/* User Pill & Logout */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-[#17372b]">
            {profile?.github_avatar_url ? (
              <img 
                src={profile.github_avatar_url} 
                alt={profile.name || 'User avatar'} 
                className="w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] shrink-0 rounded-full object-cover border border-emerald-500/30"
              />
            ) : (
              <div className="w-6 h-6 min-w-[24px] min-h-[24px] shrink-0 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-100">
                {profile?.name?.[0] || 'U'}
              </div>
            )}
            <span className="text-xs font-semibold text-emerald-200">{profile?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-emerald-400/70 hover:text-emerald-100 hover:bg-[#0d291f] rounded-lg transition-colors border border-transparent hover:border-[#17372b] cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-emerald-300 hover:text-emerald-100 rounded-lg focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#17372b] bg-[#071a12] px-4 py-4 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-1">
            <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/members" onClick={() => setMobileMenuOpen(false)} className={navItemClass}>
              <Users className="w-4 h-4" />
              <span>Members</span>
            </NavLink>

            <NavLink to="/coffee" onClick={() => setMobileMenuOpen(false)} className={navItemClass}>
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Coffee Debt</span>
            </NavLink>
          </nav>

          <div className="pt-3 border-t border-[#17372b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile?.github_avatar_url && (
                <img src={profile.github_avatar_url} alt="" className="w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] shrink-0 rounded-full object-cover" />
              )}
              <span className="text-xs text-emerald-200 font-semibold">{profile?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-[#0a2118] text-xs text-emerald-300 font-semibold border border-[#17372b] flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
