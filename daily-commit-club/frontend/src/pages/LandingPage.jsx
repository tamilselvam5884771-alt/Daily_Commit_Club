import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen flex flex-col items-center justify-between p-6 overflow-hidden">
        {/* Top Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-300/80"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>The 10-Coder Realm Challenge</span>
        </motion.div>

        {/* Center Hero Section */}
        <div className="flex flex-col items-center text-center my-auto max-w-2xl">
          {/* Distant Building Silhouettes Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-6 flex items-center justify-center gap-4 text-amber-400 text-3xl pointer-events-none"
          >
            <span>🏰</span>
            <span>🏡</span>
            <span>🏯</span>
            <span>🏢</span>
            <span>🗼</span>
            <span>🏰</span>
            <span>🏡</span>
            <span>🏯</span>
            <span>🏢</span>
            <span>🗼</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-5xl md:text-7xl font-black font-cinzel tracking-wider bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
          >
            DAILY COMMIT CLUB
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-4 text-lg md:text-xl font-light text-slate-300 tracking-wide max-w-lg italic font-outfit"
          >
            "Your GitHub activity keeps your world alive."
          </motion.p>

          {/* Primary CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8"
          >
            <button
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-bold text-base uppercase tracking-widest shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_rgba(245,158,11,0.8)] transition duration-300 flex items-center gap-3"
            >
              <span>ENTER THE CLUB</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Secondary Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="pb-6 flex items-center gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest border-t border-slate-800/60 pt-4"
        >
          <span>10 BUILDINGS</span>
          <span>•</span>
          <span>10 CODERS</span>
          <span>•</span>
          <span>ONE DAILY CHALLENGE</span>
        </motion.div>
      </div>
    </WorldBackground>
  );
};
