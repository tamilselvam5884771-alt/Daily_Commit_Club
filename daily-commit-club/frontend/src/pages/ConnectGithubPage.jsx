import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { useAuth } from '../context/AuthContext';
import { Github, KeyRound, Sparkles, ArrowRight } from 'lucide-react';

export const ConnectGithubPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const displayName = localStorage.getItem('dcc_display_name') || 'Warrior';
  const [devUsername, setDevUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Live GitHub OAuth Button Handler
  const handleGitHubConnect = () => {
    window.location.href = '/api/auth/github';
  };

  // Dev Quick-Login Helper
  const handleMockConnect = async (e) => {
    e.preventDefault();
    if (!devUsername.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/auth/github/callback?mockUsername=${encodeURIComponent(devUsername.trim())}`);
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('dcc_token', data.data.token);

        // Update user display name in backend
        await fetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.data.token}`
          },
          body: JSON.stringify({ displayName })
        });

        await refreshUser();
        navigate('/setup-profile');
      }
    } catch (err) {
      console.error('Dev connect error:', err);
    } finally {
      setLoading(false);
    }
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
            <Sparkles className="w-4 h-4 animate-spin" /> Step 3 of Onboarding
          </div>

          <h2 className="text-3xl font-black font-cinzel text-amber-200 tracking-wider">
            CONNECT YOUR GITHUB
          </h2>

          <p className="mt-3 text-xs text-slate-300 font-outfit leading-relaxed italic">
            "Your house needs to know whether you're keeping your streak alive."
          </p>

          <div className="my-4 text-xs font-semibold text-amber-300">
            Welcome, <strong className="text-amber-200 font-bold">{displayName}</strong>!
          </div>

          {/* Live GitHub Connect Button */}
          <button
            onClick={handleGitHubConnect}
            className="mt-4 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl hover:from-amber-400 hover:to-amber-600 transition flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5" />
            <span>CONNECT GITHUB</span>
          </button>

          {/* Dev Mode Quick Testing Portal */}
          <div className="my-6 flex items-center gap-3 text-[11px] text-slate-500 uppercase tracking-widest">
            <div className="h-px bg-slate-800 flex-1" />
            <span>Dev Mode Quick Sync</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <form onSubmit={handleMockConnect} className="space-y-3">
            <input
              type="text"
              placeholder="Enter GitHub handle for verification"
              value={devUsername}
              onChange={(e) => setDevUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 font-semibold text-xs tracking-wider transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Binding Account...' : 'DEV SYNC GITHUB'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </WorldBackground>
  );
};
