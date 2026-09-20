import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, forgotPasswordUser } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { audioService } from '../services/audioService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      audioService.playClick();
      const res = await loginUser(email, password);

      if (res && res.success) {
        await refreshUser();
        audioService.playVictoryFanfare();
        navigate('/world');
      } else {
        setErrorMsg(res?.error?.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      audioService.playClick();
      const res = await forgotPasswordUser(forgotEmail);
      setForgotSuccess(res?.message || 'If registered, reset instructions have been sent.');
    } catch (err) {
      setForgotSuccess('If registered, reset instructions have been sent.');
    }
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen flex items-center justify-center p-4 z-20">
        {/* Minimal Form Card Overlaying the World */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md ornate-border p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-xl text-center"
        >
          {/* Header Title */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Realm Entrance</span>
          </div>

          <h2 className="text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500">
            LOG IN TO YOUR HOUSE
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-outfit">
            Enter your credentials to manage your structure.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-amber-400/80 hover:text-amber-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition text-sm"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)] transition duration-300 flex items-center justify-center gap-2 hover:brightness-110"
            >
              <span>{isSubmitting ? 'ENTERING...' : 'ENTER THE CLUB'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secondary Action */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <span className="text-xs text-slate-400">Don't have a house yet? </span>
            <button
              onClick={() => {
                audioService.playClick();
                navigate('/register');
              }}
              className="text-xs font-bold text-amber-300 hover:underline uppercase tracking-wider ml-1"
            >
              CREATE ACCOUNT
            </button>
          </div>
        </motion.div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-amber-500/40 text-center relative"
            >
              <h3 className="text-lg font-bold font-cinzel text-amber-300">RESET PASSWORD</h3>
              <p className="text-xs text-slate-300 mt-1">Enter your registered email address.</p>

              {forgotSuccess ? (
                <div className="my-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300">
                  {forgotSuccess}
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
                  >
                    Send Reset Request
                  </button>
                </form>
              )}

              <button
                onClick={() => setShowForgotModal(false)}
                className="mt-3 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </WorldBackground>
  );
};
