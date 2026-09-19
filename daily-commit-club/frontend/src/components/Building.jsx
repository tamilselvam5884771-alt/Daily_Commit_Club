import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable <Building /> Component
 * Renders 10 visually distinct SVG illustrated building silhouettes with monolithic color themes and health damage states.
 */

const THEME_CLASSES = {
  Amber: 'theme-amber',
  Emerald: 'theme-emerald',
  Burgundy: 'theme-burgundy',
  Sapphire: 'theme-sapphire',
  Violet: 'theme-violet',
  Copper: 'theme-copper',
  Teal: 'theme-teal',
  Crimson: 'theme-crimson',
  Forest: 'theme-forest',
  Indigo: 'theme-indigo'
};

const THEME_COLORS = {
  Amber: { primary: '#f59e0b', dark: '#78350f', light: '#fef3c7', glow: 'rgba(245, 158, 11, 0.5)' },
  Emerald: { primary: '#10b981', dark: '#064e3b', light: '#d1fae5', glow: 'rgba(16, 185, 129, 0.5)' },
  Burgundy: { primary: '#e11d48', dark: '#4c0519', light: '#ffe4e6', glow: 'rgba(225, 29, 72, 0.5)' },
  Sapphire: { primary: '#3b82f6', dark: '#1e3a8a', light: '#dbeafe', glow: 'rgba(59, 130, 246, 0.5)' },
  Violet: { primary: '#8b5cf6', dark: '#4c1d95', light: '#ede9fe', glow: 'rgba(139, 92, 246, 0.5)' },
  Copper: { primary: '#f97316', dark: '#431407', light: '#ffedd5', glow: 'rgba(249, 115, 22, 0.5)' },
  Teal: { primary: '#14b8a6', dark: '#042f2e', light: '#ccfbf1', glow: 'rgba(20, 184, 166, 0.5)' },
  Crimson: { primary: '#ef4444', dark: '#450a0a', light: '#fee2e2', glow: 'rgba(239, 68, 68, 0.5)' },
  Forest: { primary: '#22c55e', dark: '#052e16', light: '#dcfce7', glow: 'rgba(34, 197, 94, 0.5)' },
  Indigo: { primary: '#6366f1', dark: '#1e1b4b', light: '#e0e7ff', glow: 'rgba(99, 102, 241, 0.5)' }
};

export const Building = ({
  building,
  themeOverride = null,
  health = 100,
  destroyed = false,
  owner = null,
  isSelected = false,
  isHovered = false,
  onClick = () => {}
}) => {
  const num = building?.buildingNumber || 1;
  const themeName = themeOverride || building?.theme || 'Amber';
  const theme = THEME_COLORS[themeName] || THEME_COLORS.Amber;
  const isHealthy = health > 60 && !destroyed;
  const isDamaged = health <= 60 && health > 0 && !destroyed;
  const isDestroyed = destroyed || health === 0;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer group select-none ${THEME_CLASSES[themeName] || ''}`}
      style={{ width: '180px', height: '220px' }}
    >
      {/* Background Aura Glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30 transition-opacity group-hover:opacity-70"
        style={{ background: theme.glow }}
      />

      {/* Building SVG Silhouette Container */}
      <div className="relative w-full h-full flex flex-col items-center justify-end">
        {isDestroyed ? (
          /* Destroyed Collapsed Structure */
          <svg viewBox="0 0 100 100" className="w-40 h-32 text-slate-700">
            <path d="M 20 90 L 35 70 L 50 85 L 75 75 L 85 90 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <circle cx="30" cy="80" r="4" fill="#0f172a" />
            <circle cx="65" cy="82" r="6" fill="#0f172a" />
            <line x1="40" y1="90" x2="45" y2="70" stroke="#ef4444" strokeWidth="2" />
          </svg>
        ) : (
          /* Distinct Illustrated Silhouettes 1-10 */
          <svg viewBox="0 0 120 150" className="w-full h-full drop-shadow-2xl">
            {/* Base Foundation */}
            <rect x="15" y="130" width="90" height="12" rx="2" fill="#0f172a" stroke={theme.primary} strokeWidth="1.5" />

            {/* Silhouette Switch */}
            {num === 1 && (
              /* 01: Observatory Dome */
              <g>
                <rect x="30" y="60" width="60" height="70" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <path d="M 30 60 A 30 30 0 0 1 90 60 Z" fill={theme.primary} opacity="0.9" />
                <line x1="60" y1="30" x2="60" y2="15" stroke={theme.light} strokeWidth="3" />
                <circle cx="60" cy="12" r="3" fill={theme.light} />
                <circle cx="60" cy="80" r="10" fill={isHealthy ? theme.light : '#334155'} />
              </g>
            )}

            {num === 2 && (
              /* 02: Forest House */
              <g>
                <path d="M 20 80 L 60 25 L 100 80 Z" fill={theme.primary} />
                <rect x="30" y="80" width="60" height="50" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <rect x="50" y="95" width="20" height="35" fill={theme.primary} />
                <circle cx="60" cy="55" r="7" fill={isHealthy ? theme.light : '#1e293b'} />
              </g>
            )}

            {num === 3 && (
              /* 03: Spire Watchtower */
              <g>
                <rect x="40" y="40" width="40" height="90" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <polygon points="40,40 60,5 80,40" fill={theme.primary} />
                <rect x="52" y="60" width="16" height="20" fill={isHealthy ? theme.light : '#1e293b'} rx="8" />
                <rect x="52" y="95" width="16" height="20" fill={isHealthy ? theme.light : '#1e293b'} rx="8" />
              </g>
            )}

            {num === 4 && (
              /* 04: Sapphire Castle */
              <g>
                <rect x="25" y="55" width="70" height="75" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <rect x="20" y="35" width="20" height="20" fill={theme.primary} />
                <rect x="80" y="35" width="20" height="20" fill={theme.primary} />
                <polygon points="30,15 20,35 40,35" fill={theme.light} />
                <polygon points="90,15 80,35 100,35" fill={theme.light} />
                <path d="M 45 130 A 15 20 0 0 1 75 130 Z" fill={theme.primary} />
              </g>
            )}

            {num === 5 && (
              /* 05: Library of Arcana */
              <g>
                <rect x="25" y="50" width="70" height="80" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <polygon points="20,50 60,20 100,50" fill={theme.primary} />
                <line x1="35" y1="50" x2="35" y2="130" stroke={theme.primary} strokeWidth="2" />
                <line x1="85" y1="50" x2="85" y2="130" stroke={theme.primary} strokeWidth="2" />
                <rect x="50" y="70" width="20" height="30" fill={isHealthy ? theme.light : '#1e293b'} />
              </g>
            )}

            {num === 6 && (
              /* 06: Copper Workshop */
              <g>
                <rect x="25" y="65" width="70" height="65" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <polygon points="20,65 60,35 100,65" fill={theme.primary} />
                <rect x="75" y="25" width="12" height="30" fill={theme.dark} stroke={theme.primary} strokeWidth="1.5" />
                <circle cx="45" cy="85" r="8" fill={isHealthy ? theme.light : '#1e293b'} />
                <circle cx="75" cy="85" r="8" fill={isHealthy ? theme.light : '#1e293b'} />
              </g>
            )}

            {num === 7 && (
              /* 07: Watermill Keep */
              <g>
                <rect x="35" y="50" width="60" height="80" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <polygon points="30,50 65,20 100,50" fill={theme.primary} />
                <circle cx="25" cy="100" r="18" fill="none" stroke={theme.primary} strokeWidth="3" />
                <line x1="25" y1="82" x2="25" y2="118" stroke={theme.primary} strokeWidth="2" />
                <line x1="7" y1="100" x2="43" y2="100" stroke={theme.primary} strokeWidth="2" />
              </g>
            )}

            {num === 8 && (
              /* 08: Crimson Bastion */
              <g>
                <rect x="30" y="45" width="60" height="85" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <polygon points="25,45 60,10 95,45" fill={theme.primary} />
                <rect x="50" y="60" width="20" height="15" fill={isHealthy ? theme.light : '#1e293b'} />
                <rect x="50" y="85" width="20" height="15" fill={isHealthy ? theme.light : '#1e293b'} />
              </g>
            )}

            {num === 9 && (
              /* 09: Garden Grove Sanctuary */
              <g>
                <path d="M 30 70 Q 60 30 90 70 Z" fill={theme.primary} />
                <rect x="30" y="70" width="60" height="60" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <circle cx="60" cy="55" r="8" fill={theme.light} />
                <rect x="52" y="90" width="16" height="40" fill={theme.primary} />
              </g>
            )}

            {num === 10 && (
              /* 10: Clock Tower Apex */
              <g>
                <rect x="40" y="35" width="40" height="95" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <polygon points="35,35 60,5 85,35" fill={theme.primary} />
                <circle cx="60" cy="55" r="10" fill={isHealthy ? theme.light : '#1e293b'} stroke={theme.primary} strokeWidth="1.5" />
                <line x1="60" y1="55" x2="60" y2="49" stroke="#000" strokeWidth="2" />
                <line x1="60" y1="55" x2="64" y2="55" stroke="#000" strokeWidth="2" />
              </g>
            )}

            {/* Minor Crack Overlays if Damaged */}
            {isDamaged && (
              <path d="M 40 70 L 48 80 L 44 95" stroke="#ef4444" strokeWidth="2" fill="none" />
            )}
          </svg>
        )}
      </div>

      {/* Building Label Header */}
      <div className="mt-2 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-300">
          Building #{num}
        </div>
        <div className="text-sm font-semibold truncate px-1" style={{ color: theme.primary }}>
          {building?.name || `Structure ${num}`}
        </div>
        
        {/* Owner Avatar & Username */}
        {owner ? (
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <img
              src={owner.githubAvatar || owner.profileImage || `https://github.com/${owner.githubUsername}.png`}
              alt={owner.githubUsername}
              className="w-5 h-5 rounded-full border border-amber-400"
            />
            <span className="text-xs text-amber-200 font-medium">@{owner.githubUsername}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 italic">Unclaimed</span>
        )}
      </div>

      {/* Health Bar Overlay */}
      <div className="absolute top-0 right-0 left-0 flex justify-center">
        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-500 ${
              health > 60 ? 'bg-emerald-500' : health > 30 ? 'bg-amber-500' : 'bg-rose-600'
            }`}
            style={{ width: `${health}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};
