import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame, Trophy, Sparkles, X, ShieldCheck } from 'lucide-react';
import { TiltCard } from './TiltCard';
import { audioService } from '../services/audioService';

/**
 * Awwwards-Grade Celebration Success Sequence Component
 * Plays a cinematic celebration with multi-burst fireworks, light beams, Web Audio fanfare, and 3D card physics.
 */
export const SuccessSequence = ({ memberName = 'Warrior', streak = 1, onClose }) => {
  useEffect(() => {
    // 1. Web Audio Fanfare Sound
    audioService.playVictoryFanfare();

    // 2. Multi-stage confetti celebration
    const end = Date.now() + 2 * 1000;
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Center burst explosion
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: colors,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl select-none p-4">
      {/* Background Rotating Light Beams Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-amber-500/20 to-teal-500/20 blur-3xl animate-pulse-glow" />
        <div className="absolute w-[800px] h-[800px] opacity-20 animate-ray-rotate bg-[radial-gradient(circle,rgba(16,185,129,0.4)_0%,transparent_70%)]" />
      </div>

      <TiltCard
        maxTilt={12}
        scaleOnHover={1.02}
        className="relative w-full max-w-md ornate-border p-8 rounded-3xl bg-gradient-to-b from-slate-900/95 via-emerald-950/60 to-slate-950 text-center border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.3)]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Sparkles Badge Header */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-[0_0_30px_rgba(16,185,129,0.6)] mb-4"
        >
          <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-4xl">
            🔥
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-bounce" />
        </motion.div>

        {/* Title Stagger */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Commit Verified</span>
          </div>
          <h3 className="text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-300 to-amber-300">
            REALM FORTIFIED
          </h3>
          <p className="text-xs text-slate-300 mt-1 font-outfit">
            Daily pledge fulfilled for <strong className="text-amber-300">@{memberName}</strong>!
          </p>
        </motion.div>

        {/* Streak Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="my-6 p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-center relative overflow-hidden group shadow-inner"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            CURRENT STREAK LEVEL
          </div>

          <div className="text-4xl font-black text-amber-400 mt-2 flex items-center justify-center gap-2">
            <Flame className="w-9 h-9 text-amber-500 animate-bounce" />
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {streak} {streak === 1 ? 'DAY' : 'DAYS'}
            </span>
          </div>

          <p className="text-xs text-emerald-400/90 mt-2 font-medium flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Building protection active until tomorrow's reset</span>
          </p>
        </motion.div>

        {/* Action CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.5)] transition duration-300"
        >
          Protect The Realm
        </motion.button>
      </TiltCard>
    </div>
  );
};
