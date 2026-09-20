import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const WorldEntrancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.displayName || localStorage.getItem('dcc_display_name') || 'Warrior';

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          navigate('/world');
        }, 1200);
      }
    });

    // 1. Black screen -> Stars appear
    tl.to('#entrance-stars', { opacity: 1, duration: 1 })
      // 2. Camera reveals environment
      .to('#entrance-env', { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' })
      // 3. Title reveal
      .to('#entrance-title', { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' })
      // 4. Character Welcome Speech
      .to('#entrance-speech', { opacity: 1, scale: 1, duration: 0.6 });
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full bg-[#05070e] text-slate-100 flex items-center justify-center overflow-hidden select-none">
      {/* 1. Starfield Layer */}
      <div id="entrance-stars" className="opacity-0 absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-16 w-1 h-1 bg-amber-200 rounded-full animate-star" />
        <div className="absolute top-24 left-1/3 w-1.5 h-1.5 bg-amber-100 rounded-full animate-star" />
        <div className="absolute top-36 right-1/4 w-1 h-1 bg-blue-200 rounded-full animate-star" />
        <div className="absolute top-10 right-12 w-2 h-2 bg-yellow-100 rounded-full animate-star" />
        <div className="absolute top-48 left-2/3 w-1 h-1 bg-white rounded-full animate-star" />
      </div>

      {/* 2. Environment Glow */}
      <div id="entrance-env" className="opacity-0 scale-90 absolute inset-0 bg-gradient-to-b from-amber-950/20 via-slate-900/60 to-emerald-950/20 pointer-events-none" />

      {/* 3. Entrance Message Container */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
        <motion.div
          id="entrance-title"
          className="opacity-0 translate-y-6"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            <Sparkles className="w-4 h-4 animate-spin" /> Entering The Realm
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-cinzel text-amber-200 tracking-wider">
            {displayName.toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Your home has been bound to your GitHub streak.</p>
        </motion.div>

        {/* 4. Character Speech Bubble */}
        <div
          id="entrance-speech"
          className="opacity-0 scale-90 mt-8 px-6 py-3 bg-slate-900/90 text-amber-200 text-sm font-bold rounded-2xl border border-amber-500/40 shadow-2xl"
        >
          "Welcome to the club. 👋"
        </div>
      </div>
    </div>
  );
};
