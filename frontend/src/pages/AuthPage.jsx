import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Coffee, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck
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
      setError('Passwords do not match.');
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
    <div className="auth-page">
      
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <Coffee className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          DAILY COMMIT CLUB
        </h1>
        <p className="text-xs sm:text-sm text-emerald-400/80 max-w-xs mx-auto leading-relaxed">
          Private developer accountability.<br />
          Miss a daily commit, owe coffee.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="card auth-card space-y-6">
        
        {/* Segmented Tabs (Sign In / Join Club) */}
        {viewMode !== 'forgot' && (
          <div className="tab-segmented">
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
          <div className="flex items-center justify-between border-b border-[#143527] pb-3">
            <h2 className="text-base font-bold text-white font-mono">Reset Password</h2>
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="alert-box alert-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
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
                  placeholder="e.g. HARII or tamilselvam5884771-alt"
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
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Forgot?
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
                  style={{ paddingRight: '48px' }}
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
              className="btn-primary w-full"
              style={{ height: '50px' }}
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-emerald-400/70">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1"
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
                  style={{ paddingRight: '48px' }}
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
                  placeholder="Re-enter your password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '48px' }}
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
              className="btn-primary w-full"
              style={{ height: '50px' }}
            >
              <span>{loading ? 'Creating Account...' : 'Join Club'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-emerald-400/70">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1"
              >
                Sign In
              </button>
            </div>

          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            
            <p className="text-xs text-emerald-400/70 leading-relaxed">
              Enter your Name or GitHub username. A recovery link will be sent to the associated email address.
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
                  placeholder="e.g. HARII or tamilselvam5884771-alt"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ height: '50px' }}
            >
              <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        )}

        {/* Protected by Supabase footer */}
        <div className="pt-2 border-t border-[#143527] flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/60 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected by Supabase Auth</span>
        </div>

      </div>

    </div>
  );
}
