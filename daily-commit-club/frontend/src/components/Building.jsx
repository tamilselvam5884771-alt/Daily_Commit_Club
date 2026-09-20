import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TiltCard } from './TiltCard';
import { audioService } from '../services/audioService';

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
  Amber: { primary: '#f59e0b', dark: '#451a03', light: '#fef3c7', glow: 'rgba(245, 158, 11, 0.5)' },
  Emerald: { primary: '#10b981', dark: '#022c22', light: '#d1fae5', glow: 'rgba(16, 185, 129, 0.5)' },
  Burgundy: { primary: '#e11d48', dark: '#4c0519', light: '#ffe4e6', glow: 'rgba(225, 29, 72, 0.5)' },
  Sapphire: { primary: '#3b82f6', dark: '#172554', light: '#dbeafe', glow: 'rgba(59, 130, 246, 0.5)' },
  Violet: { primary: '#8b5cf6', dark: '#2e1065', light: '#ede9fe', glow: 'rgba(139, 92, 246, 0.5)' },
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
  isDoorOpen = false,
  onClick = () => {}
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const num = building?.buildingNumber || 1;
  const themeName = themeOverride || building?.theme || 'Amber';
  const theme = THEME_COLORS[themeName] || THEME_COLORS.Amber;

  const isHealthy = health >= 75 && !destroyed;
  const isMinorDamage = health < 75 && health >= 50 && !destroyed;
  const isDamaged = health < 50 && health >= 25 && !destroyed;
  const isCritical = health < 25 && health > 0 && !destroyed;
  const isDestroyed = destroyed || health === 0;

  const activeDoor = isDoorOpen || isSelected || isHovered;

  const handleMouseEnter = () => {
    setIsHovered(true);
    audioService.playHover();
  };

  const handleClick = (e) => {
    audioService.playClick();
    onClick(e);
  };

  return (
    <TiltCard
      maxTilt={12}
      scaleOnHover={1.05}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`relative cursor-pointer group select-none ${THEME_CLASSES[themeName] || ''}`}
      style={{ width: '220px', height: '260px' }}
    >
      {/* Surrounding Property Ground Base & Garden Path */}
      <div className="absolute bottom-0 inset-x-2 h-14 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent rounded-b-3xl pointer-events-none z-0 border-b border-amber-500/20">
        {/* Garden Stones Path */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-60">
          <div className="w-2.5 h-1.5 rounded-full bg-slate-700" />
          <div className="w-3.5 h-2 rounded-full bg-slate-600" />
          <div className="w-2.5 h-1.5 rounded-full bg-slate-700" />
        </div>
      </div>

      {/* Ambient Glow Pulse */}
      <div
        className={`absolute inset-4 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none ${
          isHovered || isSelected ? 'opacity-90 scale-125' : 'opacity-35'
        }`}
        style={{ background: theme.glow }}
      />

      {/* Chimney Smoke */}
      {isHealthy && (
        <div className="absolute top-2 right-12 pointer-events-none z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300/40 animate-smoke" />
        </div>
      )}

      {/* 10 Art-Directed Illustrated Houses (SVG) */}
      <div className="relative w-full h-full flex flex-col items-center justify-end z-10 pb-4">
        {isDestroyed ? (
          /* Destroyed Ruin Structure */
          <svg viewBox="0 0 120 120" className="w-48 h-36">
            <path d="M 15 100 L 35 70 L 50 90 L 80 75 L 105 100 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <polygon points="40,100 45,75 55,100" fill="#1e293b" />
            <circle cx="30" cy="90" r="6" fill="#020617" />
            <circle cx="85" cy="92" r="8" fill="#020617" />
            <line x1="45" y1="100" x2="52" y2="70" stroke="#ef4444" strokeWidth="3" />
          </svg>
        ) : (
          <svg viewBox="0 0 160 180" className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
            <defs>
              <linearGradient id={`grad-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.primary} />
                <stop offset="100%" stopColor={theme.dark} />
              </linearGradient>
            </defs>

            {/* Base Platform */}
            <rect x="20" y="155" width="120" height="14" rx="3" fill="#090d16" stroke={theme.primary} strokeWidth="1.5" />

            {/* HOUSE 01: Amber Citadel (Spire Fortress) */}
            {num === 1 && (
              <g>
                <path d="M 40 80 L 80 20 L 120 80 Z" fill={`url(#grad-${num})`} />
                <rect x="45" y="80" width="70" height="75" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <circle cx="80" cy="55" r="12" fill={theme.light} opacity="0.8" />
                <line x1="80" y1="20" x2="80" y2="5" stroke={theme.light} strokeWidth="3" />
                <circle cx="80" cy="4" r="4" fill={theme.light} />
                <rect x="70" y="115" width="20" height="40" rx="3" fill="#0f172a" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  rx="2"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 02: Emerald Sanctuary (Botanical Canopy) */}
            {num === 2 && (
              <g>
                <path d="M 30 90 Q 80 25 130 90 Z" fill={theme.primary} opacity="0.9" />
                <rect x="40" y="90" width="80" height="65" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <circle cx="80" cy="65" r="14" fill={theme.light} opacity="0.9" />
                <path d="M 40 90 L 80 110 L 120 90" stroke={theme.light} strokeWidth="2" fill="none" />
                <rect x="70" y="115" width="20" height="40" rx="4" fill="#022c22" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  rx="2"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 03: Burgundy Keep (Gothic Watchtower) */}
            {num === 3 && (
              <g>
                <rect x="45" y="45" width="70" height="110" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <path d="M 40 45 L 50 30 L 60 45 L 70 30 L 80 45 L 90 30 L 100 45 L 110 30 L 120 45 Z" fill={theme.primary} />
                <polygon points="80,5 60,30 100,30" fill={theme.primary} />
                <circle cx="80" cy="70" r="10" fill={theme.light} stroke={theme.primary} strokeWidth="2" />
                <rect x="70" y="115" width="20" height="40" rx="10" fill="#4c0519" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  rx="2"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 04: Sapphire Obelisk (Crystalline Prism) */}
            {num === 4 && (
              <g>
                <polygon points="80,10 50,60 110,60" fill={theme.primary} />
                <rect x="45" y="60" width="70" height="95" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <polygon points="80,70 65,95 95,95" fill={theme.light} opacity="0.8" />
                <rect x="70" y="115" width="20" height="40" fill="#172554" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 05: Violet Academy (Observatorium) */}
            {num === 5 && (
              <g>
                <ellipse cx="80" cy="60" rx="35" ry="25" fill={theme.primary} />
                <rect x="45" y="60" width="70" height="95" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <ellipse cx="80" cy="60" rx="45" ry="8" fill="none" stroke={theme.light} strokeWidth="2" />
                <circle cx="80" cy="90" r="10" fill={theme.light} />
                <rect x="70" y="115" width="20" height="40" rx="10" fill="#2e1065" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  rx="2"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 06: Copper Foundry (Steampunk Colossus) */}
            {num === 6 && (
              <g>
                <rect x="50" y="30" width="12" height="40" fill={theme.dark} stroke={theme.primary} strokeWidth="1.5" />
                <rect x="98" y="30" width="12" height="40" fill={theme.dark} stroke={theme.primary} strokeWidth="1.5" />
                <rect x="40" y="70" width="80" height="85" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <circle cx="80" cy="95" r="14" fill="none" stroke={theme.primary} strokeWidth="4" />
                <rect x="70" y="115" width="20" height="40" rx="2" fill="#431407" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 07: Teal Monolith (Cybernetic Array) */}
            {num === 7 && (
              <g>
                <polygon points="35,40 125,25 125,50 35,65" fill={theme.primary} />
                <rect x="45" y="60" width="70" height="95" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <line x1="55" y1="80" x2="105" y2="80" stroke={theme.light} strokeWidth="3" />
                <line x1="55" y1="100" x2="105" y2="100" stroke={theme.light} strokeWidth="3" />
                <rect x="70" y="115" width="20" height="40" fill="#042f2e" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 08: Crimson Bastion (Warlord Outpost) */}
            {num === 8 && (
              <g>
                <polygon points="40,70 80,20 120,70" fill={theme.primary} />
                <polygon points="25,40 40,70 25,70" fill={theme.light} />
                <polygon points="135,40 120,70 135,70" fill={theme.light} />
                <rect x="40" y="70" width="80" height="85" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <rect x="70" y="115" width="20" height="40" fill="#450a0a" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 09: Forest Grove (Living Treehouse Keep) */}
            {num === 9 && (
              <g>
                <path d="M 40 85 C 30 40, 130 40, 120 85 Z" fill={theme.primary} />
                <rect x="45" y="85" width="70" height="70" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <circle cx="80" cy="65" r="8" fill={theme.light} />
                <rect x="70" y="115" width="20" height="40" rx="10" fill="#052e16" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  rx="2"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* HOUSE 10: Indigo Zenith (Starlight Apex) */}
            {num === 10 && (
              <g>
                <path d="M 80 15 Q 100 45 120 70 L 40 70 Z" fill={theme.primary} />
                <circle cx="80" cy="40" r="6" fill={theme.light} />
                <rect x="45" y="70" width="70" height="85" fill={theme.dark} stroke={theme.primary} strokeWidth="2" />
                <rect x="70" y="115" width="20" height="40" rx="10" fill="#1e1b4b" stroke={theme.primary} strokeWidth="1.5" />
                <rect
                  x="70"
                  y="115"
                  width={activeDoor ? 4 : 20}
                  height="40"
                  rx="2"
                  fill={theme.primary}
                  className="transition-all duration-500"
                />
              </g>
            )}

            {/* Damage Cracks Overlay */}
            {(isMinorDamage || isDamaged || isCritical) && (
              <path d="M 50 85 L 60 95 L 55 115" stroke="#ef4444" strokeWidth="2.5" fill="none" />
            )}
          </svg>
        )}
      </div>

      {/* House Label & Owner Status */}
      <div className="absolute bottom-2 inset-x-0 text-center z-20 pointer-events-none">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
          House #{num}
        </div>
        <div className="text-xs font-black truncate px-2" style={{ color: theme.primary }}>
          {building?.name || `House ${num}`}
        </div>

        {owner ? (
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <img
              src={owner.githubAvatar || owner.profileImage || `https://github.com/${owner.githubUsername}.png`}
              alt={owner.githubUsername}
              className="w-5 h-5 rounded-full border border-amber-400"
            />
            <span className="text-[11px] text-amber-200 font-bold truncate max-w-[100px]">
              @{owner.githubUsername}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
            Unclaimed
          </span>
        )}
      </div>

      {/* Health Bar Top Indicator */}
      <div className="absolute top-2 inset-x-0 flex justify-center z-20 pointer-events-none">
        <div className="w-20 h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-500 ${
              health >= 75 ? 'bg-emerald-400' : health >= 40 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${health}%` }}
          />
        </div>
      </div>
    </TiltCard>
  );
};
