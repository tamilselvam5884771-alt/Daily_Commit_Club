import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Coffee, Github, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function AuthPage() {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, resetPassword } = useAuth();

  const resetFormState = () => {
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !password) {
      setError('Please enter both your name/username and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ name, password });
    } catch (err) {
      setError(err.message || 'Invalid name or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !githubUrl.trim() || !password || !confirmPassword) {
      setError('All registration fields are required.');
      return;
    }

    if (!githubUrl.toLowerCase().includes('github.com/') && !githubUrl.trim().match(/^[a-zA-Z0-9_-]+$/)) {
      setError('Please enter a valid GitHub profile URL (e.g. https://github.com/yourusername)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, githubUrl, password });
      setSuccess('Account created successfully! Welcome to Daily Commit Club.');
      if (res?.session) {
        // Logged in automatically
      } else {
        // Transition to login mode after brief pause if email confirmation is enabled
        setTimeout(() => {
          setViewMode('login');
          setSuccess('Account created successfully. You can now sign in.');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userIdentifier.trim()) {
      setError('Please enter your Name or GitHub username.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(userIdentifier);
      setSuccess('Password reset link requested. If email delivery is configured in Supabase, a reset link will be sent.');
    } catch (err) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden bg-[#05140e] selection:bg-emerald-500 selection:text-emerald-950">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-700/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md z-10 my-auto animate-fade-in">
        
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-950 border border-emerald-800/60 mb-3 shadow-xl shadow-emerald-950/80">
            <Coffee className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-50 font-mono">
            DAILY COMMIT CLUB
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-emerald-300/70 max-w-xs mx-auto font-sans leading-relaxed">
            Private developer accountability.<br />
            Miss a daily commit, owe coffee.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="club-card p-6 sm:p-8 shadow-2xl backdrop-blur-md border-emerald-800/50">
          
          {/* View Mode Switcher (Login / Register Tabs) */}
          {viewMode !== 'forgot' && (
            <div className="flex bg-emerald-950/90 p-1 rounded-xl border border-emerald-800/60 mb-6">
              <button
                type="button"
                onClick={() => { setViewMode('login'); resetFormState(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all font-mono ${
                  viewMode === 'login' 
                    ? 'bg-emerald-500 text-emerald-950 shadow-md' 
                    : 'text-emerald-400/70 hover:text-emerald-100'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('register'); resetFormState(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all font-mono ${
                  viewMode === 'register' 
                    ? 'bg-emerald-500 text-emerald-950 shadow-md' 
                    : 'text-emerald-400/70 hover:text-emerald-100'
                }`}
              >
                Join Club
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-950/50 border border-red-800/60 flex items-start gap-2.5 text-red-300 text-xs font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2.5 text-emerald-200 text-xs font-medium animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{success}</span>
            </div>
          )}

          {/* VIEW MODE 1: SIGN IN */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-300/80 mb-1.5">
                  Name or GitHub Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamil Selvam or githubuser"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="club-input pl-10 text-xs py-2.5"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-300/80">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setViewMode('forgot'); resetFormState(); }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-200 underline font-mono"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="club-input pl-10 pr-10 text-xs py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/60 hover:text-emerald-300 p-1 rounded focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="club-button-primary w-full mt-3 py-3 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>

              <div className="mt-5 text-center pt-2 border-t border-emerald-900/40">
                <span className="text-xs text-emerald-400/60">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => { setViewMode('register'); resetFormState(); }}
                  className="text-xs text-emerald-400 font-bold hover:text-emerald-200 underline ml-1"
                >
                  Join Club
                </button>
              </div>

            </form>
          )}

          {/* VIEW MODE 2: JOIN CLUB (REGISTRATION) */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-300/80 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Tamil Selvam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="club-input pl-10 text-xs py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-300/80 mb-1">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="club-input pl-10 text-xs py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-300/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="club-input pl-10 pr-10 text-xs py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/60 hover:text-emerald-300 p-1 rounded focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-300/80 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="club-input pl-10 pr-10 text-xs py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/60 hover:text-emerald-300 p-1 rounded focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="club-button-primary w-full mt-3 py-3 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>

              <div className="mt-5 text-center pt-2 border-t border-emerald-900/40">
                <span className="text-xs text-emerald-400/60">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => { setViewMode('login'); resetFormState(); }}
                  className="text-xs text-emerald-400 font-bold hover:text-emerald-200 underline ml-1"
                >
                  Sign In
                </button>
              </div>

            </form>
          )}

          {/* VIEW MODE 3: FORGOT PASSWORD */}
          {viewMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex p-2.5 rounded-full bg-emerald-950 border border-emerald-800/60 mb-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-base font-bold text-emerald-100">Reset Password</h2>
                <p className="text-xs text-emerald-300/70 mt-1">
                  Enter your Name or GitHub username to request a reset.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-300/80 mb-1.5">
                  Name or GitHub Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Name or GitHub username"
                    value={userIdentifier}
                    onChange={(e) => setUserIdentifier(e.target.value)}
                    className="club-input pl-10 text-xs py-2.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="club-button-primary w-full py-3 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? 'Requesting Reset...' : 'Request Password Reset'}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setViewMode('login'); resetFormState(); }}
                  className="text-xs text-emerald-400 hover:text-emerald-200 underline font-mono"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Security Note Footer */}
          <div className="mt-6 text-center border-t border-emerald-900/40 pt-4">
            <p className="text-[11px] text-emerald-500/60 font-mono">
              🔒 Protected by Supabase Auth & Row Level Security
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
