import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, X, Flame, Coffee, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Character } from './Character';
import { generateCharacterDialogue } from '../utils/dialogueGenerator';

/**
 * Ornate Member Information Card (Phase 4 Enhanced)
 * Storybook styled modal card displaying member profile, streak, today's status, repositories, and visual coffee debt icons (☕ ☕ ☕).
 */
export const MemberCard = ({ member, onClose }) => {
  if (!member) return null;

  const user = member.user || member;
  const building = member.building || {};
  const todayStatus = member.todayStatus || 'pending';
  const commitCount = member.todayCommitCount || 0;
  const coffeeDebt = user.coffeeDebt || 0;

  const dialogue = generateCharacterDialogue(user, building, todayStatus);

  // Render coffee cup icons matching coffeeDebt count
  const renderCoffeeCups = () => {
    if (coffeeDebt === 0) return <span className="text-slate-400 italic">0 Owed</span>;
    const cups = [];
    for (let i = 0; i < Math.min(coffeeDebt, 5); i++) {
      cups.push(<Coffee key={i} className="w-4 h-4 text-amber-400 inline" />);
    }
    return (
      <span className="flex items-center gap-1">
        {cups} {coffeeDebt > 5 && <span className="text-xs text-amber-300 font-bold">+{coffeeDebt - 5}</span>}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md ornate-border p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 text-slate-100 shadow-2xl border border-amber-500/30"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Dynamic Character Speech */}
        <div className="flex flex-col items-center text-center">
          <Character user={user} size="lg" speechText={dialogue} />

          <h2 className="mt-3 text-2xl font-bold font-cinzel text-amber-200 tracking-wider">
            {user.name || user.githubUsername}
          </h2>
          <a
            href={`https://github.com/${user.githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-amber-400/80 hover:text-amber-300 transition flex items-center gap-1 mt-0.5"
          >
            @{user.githubUsername} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Streak & Today Status Banner */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-amber-500/20 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Current Streak
            </div>
            <div className="text-xl font-extrabold text-amber-300 mt-1">
              {user.currentStreak || 0} Days
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-amber-500/20 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              Today's Status
            </div>
            <div className="text-sm font-bold mt-1 flex items-center justify-center gap-1.5">
              {todayStatus === 'completed' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> COMMITTED ({commitCount})
                </span>
              ) : todayStatus === 'missed' ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> MISSED
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> PENDING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Building Health & Coffee Debt Display */}
        <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Building Health:</span>{' '}
            <span className={`font-bold ${building.health >= 75 ? 'text-emerald-400' : building.health >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
              {building.health ?? 100}% {building.destroyed ? '(DESTROYED)' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400">Coffee Debt:</span>
            {renderCoffeeCups()}
          </div>
        </div>

        {/* Repositories Section */}
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-2">
            Verified Repositories
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {user.repositories && user.repositories.length > 0 ? (
              user.repositories.map((repo, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-200 truncate max-w-[200px]">{repo}</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
              ))
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-800/30 text-center text-xs text-slate-500 italic">
                {commitCount > 0 ? `${commitCount} qualifying commit(s) verified today` : 'No qualifying commits logged yet today'}
              </div>
            )}
          </div>
        </div>

        {/* View GitHub Button */}
        <a
          href={`https://github.com/${user.githubUsername}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-bold text-sm text-center shadow-lg hover:from-amber-500 hover:to-amber-600 transition flex items-center justify-center gap-2"
        >
          VIEW GITHUB PROFILE <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};
