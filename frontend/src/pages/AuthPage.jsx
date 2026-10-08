import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Coffee, Github, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!name || !password) {
          throw new Error('Please enter both your name and password.');
        }
        await login({ name, password });
      } else {
        if (!name || !githubUrl || !password) {
          throw new Error('All registration fields are required.');
        }
        if (!githubUrl.includes('github.com/')) {
          throw new Error('Please enter a valid GitHub profile URL (e.g. https://github.com/yourusername)');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await register({ name, githubUrl, password });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 20%, #0d3023 0%, #05140e 70%)' }}>
      
      {/* Decorative ambient background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800/50 mb-4 shadow-lg shadow-emerald-950/50">
            <Coffee className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-50 font-sans">
            DAILY COMMIT CLUB
          </h1>
          <p className="mt-2 text-sm text-emerald-300/70 max-w-xs mx-auto font-sans">
            Private developer accountability. Miss a daily commit, owe coffee ☕
          </p>
        </div>

        {/* Card Container */}
        <div className="club-card p-8 shadow-2xl backdrop-blur-sm border-emerald-800/40">
          
          {/* Mode Switcher */}
          <div className="flex bg-emerald-950/90 p-1 rounded-lg border border-emerald-800/50 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                isLogin 
                  ? 'bg-emerald-500 text-emerald-950 shadow-md' 
                  : 'text-emerald-300/70 hover:text-emerald-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                !isLogin 
                  ? 'bg-emerald-500 text-emerald-950 shadow-md' 
                  : 'text-emerald-300/70 hover:text-emerald-100'
              }`}
            >
              Join Club
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-300 text-xs font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-1.5">
                Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={isLogin ? "Your Name or Username" : "Tamil Selvam"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="club-input pl-10"
                />
              </div>
            </div>

            {/* GitHub URL (Registration Only) */}
            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-1.5">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="club-input pl-10"
                  />
                </div>
                <p className="mt-1 text-[11px] text-emerald-400/60">
                  Required only during registration to sync your daily commits.
                </p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="club-input pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="club-button-primary w-full mt-2 py-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Authenticating...' : 'Registering...'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {isLogin ? 'Enter Club' : 'Complete Registration'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

          </form>

          {/* Footer note */}
          <div className="mt-6 text-center border-t border-emerald-800/30 pt-4">
            <p className="text-xs text-emerald-400/50">
              🔒 Protected by Supabase Auth & RLS Security
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
