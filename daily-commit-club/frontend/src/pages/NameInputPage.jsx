import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Sparkles, ArrowRight } from 'lucide-react';

export const NameInputPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem('dcc_display_name') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('dcc_display_name', name.trim());
    navigate('/choose-home');
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen p-6 flex flex-col items-center justify-center select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-md ornate-border p-8 rounded-3xl bg-slate-900/90 text-center border border-amber-500/30 shadow-2xl"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            <Sparkles className="w-4 h-4 animate-spin" /> Step 1 of Onboarding
          </div>

          <h1 className="text-3xl md:text-4xl font-black font-cinzel text-amber-200 tracking-wider">
            DAILY COMMIT CLUB
          </h1>

          <p className="mt-4 text-base text-slate-300 font-outfit">
            What's your name?
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm font-semibold text-slate-100 text-center focus:outline-none focus:border-amber-400 transition shadow-inner"
            />

            <button
              type="submit"
              disabled={!name.trim()}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-xl ${
                name.trim()
                  ? 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </WorldBackground>
  );
};
