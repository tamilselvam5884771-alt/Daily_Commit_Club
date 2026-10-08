import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Coffee, 
  Github, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck,
  Zap,
  Users,
  Code2,
  TrendingUp,
  Trophy
} from 'lucide-react';

export default function AuthPage() {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regGithubUrl, setRegGithubUrl] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot password field
  const [forgotIdentifier, setForgotIdentifier] = useState('');

  // Status feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, resetPassword } = useAuth();

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSwitchMode = (mode) => {
    resetMessages();
    setViewMode(mode);
  };

  // Sign In Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please enter your Name or GitHub username and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ name: loginIdentifier.trim(), password: loginPassword });
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  // Join Club (Register) Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const cleanName = regName.trim();
    const cleanGithub = regGithubUrl.trim();

    if (!cleanName || !cleanGithub || !regPassword || !regConfirmPassword) {
      setError('All fields are required.');
      return;
    }

    const hasGithubDomain = cleanGithub.toLowerCase().includes('github.com/');
    const isValidUsername = cleanGithub.match(/^[a-zA-Z0-9_-]+$/);
    
    if (!hasGithubDomain && !isValidUsername) {
      setError('Enter a valid GitHub profile URL (e.g. https://github.com/yourusername)');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Password does not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: cleanName,
        githubUrl: cleanGithub,
        password: regPassword
      });

      setSuccess('Account created successfully! Welcome to Daily Commit Club.');
      
      // Clear fields
      setRegName('');
      setRegGithubUrl('');
      setRegPassword('');
      setRegConfirmPassword('');
      
    } catch (err) {
      setError(err.message || 'Unable to create your account. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!forgotIdentifier.trim()) {
      setError('Please enter your Name or GitHub username.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(forgotIdentifier.trim());
      setSuccess('Password reset link requested. If configured, a reset link will be sent to your account.');
    } catch (err) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 sm:py-12 bg-[#04110C] text-emerald-50 selection:bg-emerald-500 selection:text-emerald-950 relative overflow-hidden">
      
      {/* Background Depth Accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1200px] z-10 flex items-center justify-center my-auto">
        
        {/* Left Feature Badges (Desktop) */}
        <div className="hidden xl:flex flex-col gap-8 w-64 pr-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#071A12] border border-[#16382A] text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Track</h3>
              <p className="text-xs text-emerald-400/70 mt-0.5 leading-relaxed">Your daily GitHub commit activity</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#071A12] border border-[#16382A] text-emerald-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Stay Accountable</h3>
              <p className="text-xs text-emerald-400/70 mt-0.5 leading-relaxed">Together with club developers</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#071A12] border border-[#16382A] text-amber-400 shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Owe Coffee</h3>
              <p className="text-xs text-emerald-400/70 mt-0.5 leading-relaxed">Miss a commit, owe the club</p>
            </div>
          </div>
        </div>

        {/* Center Main Card & Branding */}
        <div className="w-full max-w-[440px] flex flex-col items-center animate-fade-in">
          
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#071A12] border border-[#16382A] shadow-lg shadow-emerald-950/70 mb-3.5 text-emerald-400">
              <Coffee className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase font-sans">
              DAILY COMMIT CLUB
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-300/80 font-sans">
              Private developer accountability.
            </p>
            <p className="mt-0.5 text-xs text-emerald-400/60 font-sans">
              Miss a daily commit, owe coffee.
            </p>
          </div>

          {/* Main Authentication Card */}
          <div className="w-full bg-[#071A12] border border-[#16382A] rounded-2xl shadow-2xl shadow-emerald-950/60 overflow-hidden">
            
            {/* Top Tabs */}
            {viewMode !== 'forgot' && (
              <div className="grid grid-cols-2 border-b border-[#16382A]">
                <button
                  type="button"
                  id="tab-signin"
                  onClick={() => handleSwitchMode('login')}
                  className={`h-13 flex items-center justify-center text-sm font-bold transition-all relative cursor-pointer ${
                    viewMode === 'login'
                      ? 'text-emerald-100'
                      : 'text-emerald-400/60 hover:text-emerald-200'
                  }`}
                >
                  <span>Sign In</span>
                  {viewMode === 'login' && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  id="tab-join"
                  onClick={() => handleSwitchMode('register')}
                  className={`h-13 flex items-center justify-center text-sm font-bold transition-all relative cursor-pointer ${
                    viewMode === 'register'
                      ? 'text-emerald-100'
                      : 'text-emerald-400/60 hover:text-emerald-200'
                  }`}
                >
                  <span>Join Club</span>
                  {viewMode === 'register' && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              </div>
            )}

            {/* Form Body */}
            <div className="p-6 sm:p-8">
              
              {/* Feedback Alerts */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-300 text-xs font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-600/40 flex items-start gap-3 text-emerald-200 text-xs font-medium animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{success}</span>
                </div>
              )}

              {/* MODE 1: SIGN IN */}
              {viewMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  <div>
                    <label htmlFor="login-identifier" className="block text-xs font-medium text-emerald-300/90 mb-2">
                      Name or GitHub username
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-emerald-500/50 absolute left-4 pointer-events-none" />
                      <input
                        id="login-identifier"
                        type="text"
                        required
                        placeholder="e.g. HARI"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full h-[52px] bg-[#05170f] border border-[#16382A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-700/60 text-sm rounded-xl pl-11 pr-4 transition-all outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className="block text-xs font-medium text-emerald-300/90">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('forgot')}
                        className="text-xs text-emerald-400 hover:text-emerald-200 hover:underline font-sans cursor-pointer transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-emerald-500/50 absolute left-4 pointer-events-none" />
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full h-[52px] bg-[#05170f] border border-[#16382A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-700/60 text-sm rounded-xl pl-11 pr-11 transition-all outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 p-1 text-emerald-500/60 hover:text-emerald-300 rounded transition-colors focus:outline-none cursor-pointer"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] mt-6 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>

                  <div className="mt-5 text-center">
                    <span className="text-xs text-emerald-400/70 font-sans">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('register')}
                      className="text-xs text-emerald-400 font-bold hover:text-emerald-200 underline ml-1 cursor-pointer transition-colors font-sans"
                    >
                      Join Club
                    </button>
                  </div>

                </form>
              )}

              {/* MODE 2: JOIN CLUB (REGISTER) */}
              {viewMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-medium text-emerald-300/90 mb-2">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-emerald-500/50 absolute left-4 pointer-events-none" />
                      <input
                        id="reg-name"
                        type="text"
                        required
                        placeholder="e.g. HARI"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full h-[52px] bg-[#05170f] border border-[#16382A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-700/60 text-sm rounded-xl pl-11 pr-4 transition-all outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-github" className="block text-xs font-medium text-emerald-300/90 mb-2">
                      GitHub Profile URL
                    </label>
                    <div className="relative flex items-center">
                      <Github className="w-4 h-4 text-emerald-500/50 absolute left-4 pointer-events-none" />
                      <input
                        id="reg-github"
                        type="text"
                        required
                        placeholder="https://github.com/tamilselvam5884771-alt"
                        value={regGithubUrl}
                        onChange={(e) => setRegGithubUrl(e.target.value)}
                        className="w-full h-[52px] bg-[#05170f] border border-[#16382A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-700/60 text-sm rounded-xl pl-11 pr-4 transition-all outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-medium text-emerald-300/90 mb-2">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-emerald-500/50 absolute left-4 pointer-events-none" />
                      <input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full h-[52px] bg-[#05170f] border border-[#16382A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-700/60 text-sm rounded-xl pl-11 pr-11 transition-all outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-4 p-1 text-emerald-500/60 hover:text-emerald-300 rounded transition-colors focus:outline-none cursor-pointer"
                        aria-label={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-confirm-password" className="block text-xs font-medium text-emerald-300/90 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-emerald-500/50 absolute left-4 pointer-events-none" />
                      <input
                        id="reg-confirm-password"
                        type={showRegConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full h-[52px] bg-[#05170f] border border-[#16382A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-700/60 text-sm rounded-xl pl-11 pr-11 transition-all outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-4 p-1 text-emerald-500/60 hover:text-emerald-300 rounded transition-colors focus:outline-none cursor-pointer"
                        aria-label={showRegConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] mt-6 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>

                  <div className="mt-5 text-center">
                    <span className="text-xs text-emerald-400/70 font-sans">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="text-xs text-emerald-400 font-bold hover:text-emerald-200 underline ml-1 cursor-pointer transition-colors font-sans"
                    >
                      Sign In
                    </button>
                  </div>

                </form>
              )}

              {/* MODE 3: FORGOT PASSWORD */}
              {viewMode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#05170f] border border-[#16382A] mb-3 text-emerald-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-white font-sans">Reset Password</h2>
                    <p className="text-xs text-emerald-300/70 mt-1 font-sans">
                      Enter your Name or GitHub username to request a reset link.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="forgot-identifier" className="block text-xs font-medium text-emerald-300/90 mb-2">
                      Name or GitHub username
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-emerald-500/50 absolute left-4 pointer-events-none" />
                      <input
                        id="forgot-identifier"
                        type="text"
                        required
                        placeholder="e.g. HARI"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full h-[52px] bg-[#05170f] border border-[#16382A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100 placeholder-emerald-700/60 text-sm rounded-xl pl-11 pr-4 transition-all outline-none font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] mt-6 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? 'Requesting Reset...' : 'Request Password Reset'}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="text-xs text-emerald-400/80 hover:text-emerald-200 underline cursor-pointer transition-colors font-sans"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Security Note Footer */}
              <div className="mt-6 pt-4 border-t border-[#16382A]/70 flex items-center justify-center gap-2 text-xs font-mono text-emerald-500/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by Supabase Auth</span>
              </div>

            </div>

          </div>

          {/* Bottom Branding Tagline */}
          <div className="mt-8 text-center text-[11px] font-mono tracking-widest text-emerald-500/40 uppercase">
            ── FOR DEVELOPERS • BY DEVELOPERS ──
          </div>

        </div>

        {/* Right Feature Badges (Desktop) */}
        <div className="hidden xl:flex flex-col gap-8 w-64 pl-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#071A12] border border-[#16382A] text-emerald-400 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Build Habit</h3>
              <p className="text-xs text-emerald-400/70 mt-0.5 leading-relaxed">Small commits create big progress</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#071A12] border border-[#16382A] text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Track Growth</h3>
              <p className="text-xs text-emerald-400/70 mt-0.5 leading-relaxed">See your streak and activity</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#071A12] border border-[#16382A] text-emerald-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Join the Club</h3>
              <p className="text-xs text-emerald-400/70 mt-0.5 leading-relaxed">Be part of a supportive community</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
