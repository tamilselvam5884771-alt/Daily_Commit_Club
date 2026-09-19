import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { useAuth } from '../context/AuthContext';
import { Github, KeyRound, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [devUsername, setDevUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Live GitHub OAuth Login redirect
  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  // Dev Quick-Login Helper for testing without live GitHub Client Secret
  const handleMockLogin = async (e) => {
    e.preventDefault();
    if (!devUsername.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/auth/github/callback?mockUsername=${encodeURIComponent(devUsername.trim())}`);
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('dcc_token', data.data.token);
        await refreshUser();

        const u = data.data.user;
        if (!u.buildingId) navigate('/choose-home');
        else navigate('/world');
      }
    } catch (err) {
      console.error('Dev Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen flex items-center justify-center p-6 select-none">
        {/* Fantasy Portal Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-md ornate-border p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/85 to-slate-950/95 text-center shadow-2xl border border-amber-500/30"
        >
          {/* Portal Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border-2 border-amber-400/80 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] mb-4">
            <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
          </div>

          <h2 className="text-3xl font-black font-cinzel text-amber-200 tracking-wider">
            ENTER THE CLUB
          </h2>
          <p className="mt-2 text-xs text-slate-300 font-outfit leading-relaxed">
            Authenticate your GitHub identity to bind your commit activity to the realm.
          </p>

          {/* Live GitHub OAuth Button */}
          <button
            onClick={handleGitHubLogin}
            className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600 hover:border-amber-400 text-slate-100 font-bold text-sm tracking-wide shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5 text-amber-300" />
            <span>CONTINUE WITH GITHUB</span>
          </button>

          {/* Dev Mode Quick Authentication Divider */}
          <div className="my-6 flex items-center gap-3 text-xs text-slate-500 uppercase tracking-widest">
            <div className="h-px bg-slate-800 flex-1" />
            <span>Dev Testing Portal</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <form onSubmit={handleMockLogin} className="space-y-3">
            <input
              type="text"
              placeholder="Enter GitHub Username (e.g. torvalds)"
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
              <span>{loading ? 'Entering Realm...' : 'ENTER AS DEV USER'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </WorldBackground>
  );
};
