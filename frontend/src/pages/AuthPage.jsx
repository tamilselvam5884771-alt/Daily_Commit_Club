import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Coffee, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  User,
  Lock,
  Github,
  Mail
} from 'lucide-react';

export default function AuthPage() {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
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
    const cleanEmail = regEmail.trim();
    const cleanGithub = regGithubUrl.trim();

    if (!cleanName || !cleanEmail || !cleanGithub || !regPassword || !regConfirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
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
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: cleanName,
        email: cleanEmail,
        githubUrl: cleanGithub,
        password: regPassword
      });

      setSuccess('Account created successfully! Welcome to Daily Commit Club.');
      
      // Clear fields
      setRegName('');
      setRegEmail('');
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
    <div className="auth-page relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header: Perfectly Centered & High Clarity */}
      <div className="text-center mb-8 max-w-lg mx-auto relative z-10 flex flex-col items-center">
        {/* Glow Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)] text-emerald-400 mb-4 transition-transform hover:scale-105 duration-300">
          <Coffee className="w-7 h-7 stroke-[2.2]" />
        </div>
        
        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#ecfdf5] tracking-tight font-display-clean mb-3">
          DAILY COMMIT CLUB
        </h1>

        {/* Clear Subtitle */}
        <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed font-sans-clean max-w-md text-center">
          Developer Accountability Club. Miss a daily commit before 8:00 PM IST, owe coffee ☕
        </p>
      </div>

      {/* Main Auth Card with Polished Spacing */}
      <div className="auth-card relative z-10">
        
        {/* Segmented Switcher (Sign In / Join Club) */}
        {viewMode !== 'forgot' && (
          <div className="tab-segmented mb-6">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`tab-segmented-btn ${viewMode === 'login' ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`tab-segmented-btn ${viewMode === 'register' ? 'active' : ''}`}
            >
              Join Club
            </button>
          </div>
        )}

        {viewMode === 'forgot' && (
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4 mb-6">
            <h2 className="text-sm font-bold text-[#ecfdf5] uppercase tracking-wider font-display-clean">Reset Password</h2>
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="alert-box alert-error mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success mb-5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span className="text-emerald-200">{success}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            
            <div className="form-group">
              <label htmlFor="login-identifier" className="form-label">
                Name or GitHub Username
              </label>
              <div className="input-container">
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. Hari or github_username"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('forgot')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium lowercase"
                >
                  forgot?
                </button>
              </div>
              <div className="input-container">
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="input-icon-btn"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ height: '48px' }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3 text-xs text-emerald-300/80 font-sans-clean">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline ml-1 cursor-pointer"
              >
                Join Club
              </button>
            </div>

          </form>
        )}

        {/* 2. JOIN CLUB FORM */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">
                Full Name
              </label>
              <div className="input-container">
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Hariharasudhan"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="developer@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-github" className="form-label">
                GitHub Profile URL
              </label>
              <div className="input-container">
                <input
                  id="reg-github"
                  type="text"
                  required
                  placeholder="https://github.com/yourusername"
                  value={regGithubUrl}
                  onChange={(e) => setRegGithubUrl(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <input
                  id="reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="input-icon-btn"
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-password" className="form-label">
                Confirm Password
              </label>
              <div className="input-container">
                <input
                  id="reg-confirm-password"
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="input-icon-btn"
                  title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ height: '48px' }}
            >
              <span>{loading ? 'Creating Account...' : 'Join Club'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3 text-xs text-emerald-300/80 font-sans-clean">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>

          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            
            <p className="text-xs text-emerald-200/80 leading-relaxed font-sans-clean">
              Enter your Name or GitHub username to request an account recovery link.
            </p>

            <div className="form-group">
              <label htmlFor="forgot-identifier" className="form-label">
                Name or GitHub Username
              </label>
              <div className="input-container">
                <input
                  id="forgot-identifier"
                  type="text"
                  required
                  placeholder="e.g. Hari or github_username"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ height: '48px' }}
            >
              <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        )}

        {/* Protected by Supabase footer */}
        <div className="mt-6 pt-4 border-t border-emerald-900/50 flex items-center justify-center gap-2 text-xs text-emerald-300/60 font-sans-clean">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted • Supabase Auth</span>
        </div>

      </div>

    </div>
  );
}
