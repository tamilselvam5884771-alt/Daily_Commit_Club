import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Sparkles, ArrowRight, Volume2, VolumeX, LogIn } from 'lucide-react';
import { TiltCard } from '../components/TiltCard';
import { audioService } from '../services/audioService';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [audioActive, setAudioActive] = React.useState(audioService.isEnabled);

  const toggleSound = () => {
    const state = audioService.toggleAudio();
    setAudioActive(state);
    if (state) audioService.playVictoryFanfare();
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen flex flex-col items-center justify-between p-6 overflow-hidden">
        {/* Top Header Bar */}
        <div className="pt-6 w-full max-w-6xl flex items-center justify-between z-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-300/90"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>The 10-Coder Realm Challenge</span>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={toggleSound}
              className="p-2.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 hover:bg-slate-800 transition shadow-lg flex items-center gap-2 text-xs font-semibold"
            >
              {audioActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>{audioActive ? 'SOUND ON' : 'MUTED'}</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to="/login"
                onClick={() => audioService.playClick()}
                className="px-5 py-2.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 hover:bg-slate-800 transition text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>LOGIN</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Center Hero Section */}
        <div className="flex flex-col items-center text-center my-auto max-w-3xl z-20">
          {/* Distant Building Silhouettes Ring */}
          <TiltCard maxTilt={20} glare={false} className="mb-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="flex items-center justify-center gap-4 text-amber-400 text-4xl filter drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
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
          </TiltCard>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-6xl md:text-8xl font-black font-cinzel tracking-wider bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
          >
            DAILY COMMIT CLUB
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-5 text-xl md:text-2xl font-light text-slate-200 tracking-wide max-w-xl italic font-outfit drop-shadow-md"
          >
            "Commit every day. Keep your house alive."
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => {
                audioService.playClick();
                navigate('/register');
              }}
              onMouseEnter={() => audioService.playHover()}
              className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-black text-sm uppercase tracking-[0.25em] shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:shadow-[0_0_80px_rgba(245,158,11,0.9)] transition duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 w-1/2 bg-white/20 animate-light-sweep pointer-events-none" />
              <span>ENTER THE CLUB</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <Link
              to="/login"
              onClick={() => audioService.playClick()}
              className="px-8 py-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 text-amber-300 hover:bg-slate-800 text-xs font-black uppercase tracking-widest transition shadow-lg"
            >
              LOGIN TO HOUSE
            </Link>
          </motion.div>
        </div>

        {/* Bottom Information Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="pb-6 flex items-center gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest border-t border-slate-800/80 pt-4 z-20"
        >
          <span>10 HOUSES</span>
          <span>•</span>
          <span>10 CODERS</span>
          <span>•</span>
          <span>ONE DAILY COMMIT</span>
        </motion.div>
      </div>
    </WorldBackground>
  );
};
