import React from 'react';
import { motion } from 'framer-motion';

/**
 * Character Presentation Component
 * Displays user profile image inside an ornate fantasy frame with idle breathing motion and speech bubbles.
 */
export const Character = ({
  user,
  speechText = null,
  size = 'md', // 'sm', 'md', 'lg'
  showSpeech = true
}) => {
  if (!user) return null;

  const username = user.githubUsername || user.name || 'Coder';
  const avatar = user.githubAvatar || user.profileImage || `https://github.com/${username}.png`;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }[size];

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Speech Bubble */}
      {showSpeech && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-3 px-3.5 py-1.5 bg-slate-900/90 text-amber-200 text-xs font-semibold rounded-xl border border-amber-500/40 shadow-xl backdrop-blur-md relative"
        >
          {speechText || `Hii! I'm @${username} 👋`}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-amber-500/40 rotate-45" />
        </motion.div>
      )}

      {/* Ornate Animated Character Portrait */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative group cursor-pointer"
      >
        {/* Outer Glowing Ring */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500 animate-pulse" />

        {/* Ornate Golden Frame */}
        <div className={`relative ${sizeClasses} rounded-full p-1 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 shadow-2xl border-2 border-amber-300`}>
          <img
            src={avatar}
            alt={username}
            className="w-full h-full object-cover rounded-full bg-slate-900"
          />
        </div>

        {/* Streak Flame Badge */}
        {user.currentStreak > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300 shadow-lg flex items-center gap-0.5">
            <span>🔥</span>
            <span>{user.currentStreak}d</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
