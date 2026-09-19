import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame, CheckCircle, X } from 'lucide-react';

/**
 * Celebration Success Sequence Component
 * Fires celebratory fireworks/confetti when a user completes their daily commit challenge.
 */
export const SuccessSequence = ({ memberName = 'Warrior', streak = 1, onClose }) => {
  useEffect(() => {
    // Fire celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative w-full max-w-sm ornate-border p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-950 text-center border-emerald-500/40 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-900/60 border border-emerald-400 flex items-center justify-center text-3xl mb-3">
          🔥
        </div>

        <h3 className="text-2xl font-black font-cinzel text-emerald-300">ANOTHER DAY SURVIVED</h3>
        <p className="text-xs text-slate-300 mt-1">Qualifying commit verified for @{memberName}!</p>

        <div className="my-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">New Streak Level</div>
          <div className="text-3xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1.5">
            <Flame className="w-7 h-7 text-amber-500 animate-bounce" /> {streak} DAYS
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1">Your building remains fortified and alive.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
        >
          Keep Realm Alive
        </button>
      </motion.div>
    </div>
  );
};
