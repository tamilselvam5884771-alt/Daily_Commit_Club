import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { AlertTriangle, Coffee, X } from 'lucide-react';

/**
 * Dramatic Meteor Impact Sequence Component
 * Plays a cinematic GSAP timeline animation when a member misses a commit day.
 */
export const MeteorSequence = ({ memberName = 'Warrior', buildingName = 'Building', onClose }) => {
  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Warning overlay flash
    tl.to('#meteor-warning', { opacity: 1, duration: 0.5 })
      .to('#meteor-warning', { opacity: 0, duration: 0.5, delay: 0.8 });

    // 2. Meteor trail descent
    tl.fromTo(
      '#meteor-core',
      { x: 300, y: -200, opacity: 0, scale: 0.5 },
      { x: -50, y: 150, opacity: 1, scale: 1.5, duration: 1.8, ease: 'power2.in' }
    );

    // 3. Impact Flash & Explosion Shake
    tl.to('#meteor-impact', { opacity: 1, scale: 2, duration: 0.3 })
      .to('#meteor-container', { x: '+=10', y: '+=10', yoyo: true, repeat: 5, duration: 0.05 })
      .to('#meteor-impact', { opacity: 0, duration: 0.5 })
      .to('#meteor-modal', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
  }, []);

  return (
    <div id="meteor-container" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg select-none">
      {/* 1. Warning Sky Banner */}
      <div id="meteor-warning" className="opacity-0 absolute top-12 text-center">
        <div className="text-3xl font-black font-cinzel text-rose-500 tracking-widest animate-pulse">
          ⚠️ CRITICAL FAILURE DETECTED ⚠️
        </div>
        <div className="text-sm text-slate-300 mt-1">A METEOR APPROACHES {buildingName.toUpperCase()}</div>
      </div>

      {/* 2. Meteor Trail */}
      <div id="meteor-core" className="opacity-0 absolute w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-rose-600 to-red-600 shadow-[0_0_60px_rgba(239,68,68,0.9)]" />

      {/* 3. Impact Flash Layer */}
      <div id="meteor-impact" className="opacity-0 absolute inset-0 bg-rose-600/30 pointer-events-none" />

      {/* 4. Final Story Result Modal */}
      <motion.div
        id="meteor-modal"
        initial={{ opacity: 0, scale: 0.8 }}
        className="relative w-full max-w-sm ornate-border p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-rose-950/40 to-slate-950 text-center border-rose-500/40 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-full bg-rose-900/60 border border-rose-500 flex items-center justify-center text-3xl mb-3">
          ☄️
        </div>

        <h3 className="text-2xl font-black font-cinzel text-rose-400">YOUR BUILDING HAS FALLEN</h3>
        <p className="text-xs text-slate-300 mt-1">No qualifying GitHub commits were recorded today for @{memberName}.</p>

        <div className="my-4 p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs space-y-1.5 text-left">
          <div className="flex justify-between text-slate-300">
            <span>Streak Reset:</span> <strong className="text-rose-400">0 Days</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Building Status:</span> <strong className="text-rose-400">Damaged (-40%)</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Coffee Penalty Owed:</span> <strong className="text-amber-400 flex items-center gap-1"><Coffee className="w-3.5 h-3.5" /> +1 Coffee</strong>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition"
        >
          I Will Rebuild Tomorrow
        </button>
      </motion.div>
    </div>
  );
};
