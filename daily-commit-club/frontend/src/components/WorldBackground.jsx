import React from 'react';
import { getTimeOfDay, TIME_OF_DAY_STYLES } from '../services/timeOfDayService';

/**
 * SeasonEnvironment Component
 * Renders season-specific particle overlays (spring sakura, summer gold, autumn leaves, winter snow, legendary aurora)
 */
export const SeasonEnvironment = ({ season = 'spring' }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Spring Sakura Floating Petals */}
      {season === 'spring' && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950/40 opacity-70">
          <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-pink-300/40 animate-ping" />
          <div className="absolute top-20 right-1/3 w-3 h-3 rounded-full bg-emerald-300/30 animate-pulse" />
        </div>
      )}

      {/* Summer Gold Glow */}
      {season === 'summer' && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-amber-950/40 opacity-70">
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        </div>
      )}

      {/* Autumn Leaves & Warm Tint */}
      {season === 'autumn' && (
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 via-transparent to-orange-950/50 opacity-70">
          <div className="absolute top-12 left-10 w-2 h-2 bg-amber-600/50 rotate-45 animate-float" />
          <div className="absolute top-32 right-20 w-3 h-3 bg-orange-700/50 rotate-12 animate-float" />
        </div>
      )}

      {/* Winter Snow Overlay */}
      {season === 'winter' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-blue-950/20 to-slate-950/60 opacity-80">
          <div className="absolute top-5 left-1/3 w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <div className="absolute top-15 right-1/4 w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
        </div>
      )}

      {/* Legendary Aurora Starlight Overlay */}
      {season === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 via-indigo-950/40 to-amber-950/30 opacity-90">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-r from-purple-500/10 via-amber-400/20 to-indigo-500/10 blur-3xl animate-pulse" />
        </div>
      )}
    </div>
  );
};

/**
 * WorldBackground Component
 * Renders dynamic day/night atmosphere, sun/moon positioning, star layers, fog, and seasonal ambient environments.
 */
export const WorldBackground = ({ season = 'spring', children }) => {
  const timeOfDay = getTimeOfDay();
  const timeStyle = TIME_OF_DAY_STYLES[timeOfDay] || TIME_OF_DAY_STYLES.night;

  return (
    <div className={`relative min-h-screen w-full bg-gradient-to-b ${timeStyle.gradient} text-slate-100 overflow-hidden select-none`}>
      {/* Time of Day Atmosphere Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: timeStyle.skyTint }}
      />

      {/* Sun / Moon Orb Component */}
      {timeStyle.showMoon ? (
        <div className="absolute top-10 right-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-amber-200 shadow-[0_0_50px_rgba(254,243,199,0.6)] opacity-80 pointer-events-none" />
      ) : (
        <div
          className="absolute top-12 left-1/4 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.6)] pointer-events-none transition-opacity duration-1000"
          style={{ opacity: timeStyle.sunOpacity }}
        />
      )}

      {/* Twinkling Star Layer */}
      {(timeOfDay === 'night' || timeOfDay === 'evening') && (
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-12 left-16 w-1 h-1 bg-amber-200 rounded-full animate-star" />
          <div className="absolute top-24 left-1/3 w-1.5 h-1.5 bg-amber-100 rounded-full animate-star" />
          <div className="absolute top-36 right-1/4 w-1 h-1 bg-blue-200 rounded-full animate-star" />
          <div className="absolute top-10 right-12 w-2 h-2 bg-yellow-100 rounded-full animate-star" />
          <div className="absolute top-48 left-2/3 w-1 h-1 bg-white rounded-full animate-star" />
        </div>
      )}

      {/* Drifting Clouds & Fog */}
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-fog">
        <div className="absolute top-16 -left-32 w-96 h-32 bg-slate-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-[30rem] h-40 bg-slate-500/20 rounded-full blur-3xl" />
      </div>

      {/* Season Environment Particles */}
      <SeasonEnvironment season={season} />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
