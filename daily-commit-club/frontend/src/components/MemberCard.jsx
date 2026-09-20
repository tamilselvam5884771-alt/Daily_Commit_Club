import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, X, Flame, Coffee, CheckCircle, Clock, AlertTriangle, Shield, Award } from 'lucide-react';
import { Character } from './Character';
import { generateCharacterDialogue } from '../utils/dialogueGenerator';
import { TiltCard } from './TiltCard';
import { audioService } from '../services/audioService';

/**
 * Compact Ornamental Paper Profile Card
 * Art-directed illustrated card displaying Display Name, GitHub URL link, Streaks, Repositories, Coffee Debt, and House Health.
 */
export const MemberCard = ({ member, onClose }) => {
  if (!member) return null;

  const user = member.user || member;
  const building = member.building || {};
  const todayStatus = member.todayStatus || 'pending';
  const commitCount = member.todayCommitCount || 0;
  const coffeeDebt = user.coffeeDebt || 0;
  const profileUrl = user.githubProfileUrl || `https://github.com/${user.githubUsername}`;

  const dialogue = generateCharacterDialogue(user, building, todayStatus);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg select-none"
      onClick={onClose}
    >
      <TiltCard
        maxTilt={8}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md ornate-border p-6 rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.25)] border border-amber-500/40"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-full transition z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Character Exit Presentation Header */}
        <div className="flex flex-col items-center text-center">
          <Character user={user} size="lg" speechText={dialogue} animateExit={true} />

          <h2 className="mt-2 text-2xl font-black font-cinzel text-amber-200 tracking-wider">
            {user.name || user.displayName || user.githubUsername}
          </h2>

          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => audioService.playClick()}
            className="text-xs text-amber-400/90 hover:text-amber-300 transition flex items-center gap-1 font-mono mt-1 underline decoration-amber-500/40"
          >
            <span>{profileUrl}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Current & Longest Streak Banner */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Current Streak
            </div>
            <div className="text-xl font-black text-amber-300 mt-0.5">
              {user.currentStreak || 0} DAYS
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Longest Streak
            </div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {user.longestStreak || user.currentStreak || 0} DAYS
            </div>
          </div>
        </div>

        {/* Today's Commit Status */}
        <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Status</div>
          <div className="text-xs font-black">
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

        {/* House Health & Coffee Debt */}
        <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-medium">House Health:</span>{' '}
            <span className={`font-black ${building.health >= 75 ? 'text-emerald-400' : building.health >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
              {building.health ?? 100}% {building.destroyed ? '(DESTROYED)' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400">Coffee Debt:</span>
            {renderCoffeeCups()}
          </div>
        </div>

        {/* Repositories */}
        <div className="mt-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-1.5">
            Verified Repositories
          </div>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {user.repositories && user.repositories.length > 0 ? (
              user.repositories.map((repo, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-200 truncate max-w-[200px]">{repo}</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
              ))
            ) : (
              <div className="p-2 rounded-lg bg-slate-950/40 text-center text-xs text-slate-500 italic">
                {commitCount > 0 ? `${commitCount} qualifying commit(s) verified today` : 'No qualifying commits logged yet today'}
              </div>
            )}
          </div>
        </div>

        {/* View GitHub Action Button */}
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => audioService.playClick()}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest text-center shadow-lg hover:from-amber-500 hover:to-amber-600 transition flex items-center justify-center gap-2"
        >
          <span>VIEW GITHUB PROFILE</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </TiltCard>
    </motion.div>
  );
};
