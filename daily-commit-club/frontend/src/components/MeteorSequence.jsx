import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { AlertTriangle, Coffee, Flame, X } from 'lucide-react';
import { TiltCard } from './TiltCard';
import { audioService } from '../services/audioService';

/**
 * Dramatic Meteor Impact Sequence Component
 * Enhanced GSAP timeline, canvas meteor flame physics, camera screen shake, and Web Audio rumble.
 */
export const MeteorSequence = ({ memberName = 'Warrior', buildingName = 'Building', onClose }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Warning overlay flash
    tl.to('#meteor-warning', { opacity: 1, duration: 0.5 })
      .to('#meteor-warning', { opacity: 0, duration: 0.4, delay: 0.6 });

    // 2. Meteor trail descent & camera shake
    tl.fromTo(
      '#meteor-core',
      { x: 350, y: -250, opacity: 0, scale: 0.3 },
      {
        x: -40,
        y: 120,
        opacity: 1,
        scale: 1.8,
        duration: 1.6,
        ease: 'power2.in',
        onStart: () => {
          // Play impact bass rumble
          audioService.playImpactRumble();
        },
      }
    );

    // 3. Impact Flash, Ripple & Screen Shake
    tl.to('#meteor-impact', { opacity: 1, scale: 2.5, duration: 0.2 })
      .to('#meteor-shockwave', { opacity: 1, scale: 4, duration: 0.4, ease: 'power2.out' })
      .to('#meteor-container', { x: '+=12', y: '+=12', yoyo: true, repeat: 6, duration: 0.04 })
      .to('#meteor-impact', { opacity: 0, duration: 0.4 })
      .to('#meteor-shockwave', { opacity: 0, duration: 0.3 })
      .to('#meteor-modal', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });

    // Canvas ember trailing effect for meteor
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: window.innerWidth * 0.7 + (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 3 - 2,
        vy: Math.random() * 4 + 2,
        radius: Math.random() * 4 + 2,
        alpha: Math.random(),
      });
    }

    let animId;
    const drawEmbers = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        if (p.alpha <= 0) {
          p.x = window.innerWidth * 0.6 + (Math.random() - 0.5) * 200;
          p.y = 0;
          p.alpha = 1;
        }
        ctx.fillStyle = `rgba(239, 68, 68, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(drawEmbers);
    };
    animId = requestAnimationFrame(drawEmbers);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      id="meteor-container"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl select-none p-4"
    >
      {/* Canvas trail embers */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* 1. Warning Sky Banner */}
      <div id="meteor-warning" className="opacity-0 absolute top-12 text-center z-20 pointer-events-none">
        <div className="text-3xl font-black font-cinzel text-rose-500 tracking-widest animate-pulse flex items-center justify-center gap-2">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
          <span>CRITICAL FAILURE DETECTED</span>
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <div className="text-sm text-slate-300 mt-1 uppercase tracking-wider">
          A METEOR IMPACTS {buildingName}
        </div>
      </div>

      {/* 2. Meteor Core */}
      <div
        id="meteor-core"
        className="opacity-0 absolute w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-600 to-red-700 shadow-[0_0_80px_rgba(239,68,68,1)] z-20 pointer-events-none"
      />

      {/* 3. Expanding Shockwave Ring */}
      <div
        id="meteor-shockwave"
        className="opacity-0 absolute w-32 h-32 rounded-full border-4 border-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.8)] z-15 pointer-events-none"
      />

      {/* 4. Impact Flash Layer */}
      <div id="meteor-impact" className="opacity-0 absolute inset-0 bg-rose-600/40 pointer-events-none z-10" />

      {/* 5. Story Result Modal */}
      <TiltCard
        id="meteor-modal"
        maxTilt={10}
        className="opacity-0 relative w-full max-w-md ornate-border p-8 rounded-3xl bg-gradient-to-b from-slate-900/95 via-rose-950/60 to-slate-950 text-center border-rose-500/50 shadow-[0_0_60px_rgba(239,68,68,0.4)] z-30"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition z-30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-950/80 border border-rose-500 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
          ☄️
        </div>

        <h3 className="text-3xl font-black font-cinzel text-rose-400">BUILDING DAMAGED</h3>
        <p className="text-xs text-slate-300 mt-1 font-outfit">
          No qualifying GitHub commits recorded today for <strong className="text-rose-400">@{memberName}</strong>.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-xs space-y-2 text-left shadow-inner">
          <div className="flex justify-between items-center text-slate-300">
            <span>Streak Reset:</span>
            <strong className="text-rose-400 text-sm font-bold">0 Days</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Building Health:</span>
            <strong className="text-rose-400 text-sm font-bold">-40% Damage</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Coffee Penalty Owed:</span>
            <strong className="text-amber-400 text-sm font-bold flex items-center gap-1">
              <Coffee className="w-4 h-4 text-amber-500" /> +1 Coffee
            </strong>
          </div>
        </div>

        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.5)] transition duration-300"
        >
          I Will Rebuild Tomorrow
        </button>
      </TiltCard>
    </div>
  );
};
