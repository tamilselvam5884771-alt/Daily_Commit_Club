import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated Character Exit Sequence & Presentation Component
 * Character steps OUT FROM THE HOUSE with entrance animation, idle breathing, decorative frame, and speech bubble.
 */
export const Character = ({
  user,
  speechText = null,
  size = 'md', // 'sm', 'md', 'lg'
  showSpeech = true,
  animateExit = true
}) => {
  if (!user) return null;

  const displayName = user.name || user.displayName || user.githubUsername || 'Warrior';
  const username = user.githubUsername || 'coder';
  const avatar = user.profileImage || user.githubAvatar || `https://github.com/${username}.png`;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }[size];

  const speech = speechText || `Hi, I'm ${displayName} 👋`;

  return (
    <motion.div
      initial={animateExit ? { opacity: 0, scale: 0.3, y: 40 } : { opacity: 1, scale: 1, y: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="relative flex flex-col items-center justify-center z-30"
    >
      {/* Speech Bubble */}
      {showSpeech && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-3 px-4 py-2 bg-slate-900/95 text-amber-200 text-xs font-black rounded-2xl border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md relative"
        >
          <span>{speech}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-slate-900 border-r border-b border-amber-400/60 rotate-45" />
        </motion.div>
      )}

      {/* Ornate Character Body Frame & Idle Breathing */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative group cursor-pointer"
      >
        {/* Outer Glow Ring */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />

        {/* Ornate Frame */}
        <div className={`relative ${sizeClasses} rounded-full p-1 bg-gradient-to-b from-amber-300 via-amber-600 to-amber-950 shadow-2xl border-2 border-amber-400 overflow-hidden`}>
          <img
            src={avatar}
            alt={username}
            className="w-full h-full object-cover rounded-full bg-slate-950"
          />
        </div>

        {/* Streak Flame Badge */}
        {user.currentStreak > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 shadow-lg flex items-center gap-1">
            <span>🔥</span>
            <span>{user.currentStreak}d</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
