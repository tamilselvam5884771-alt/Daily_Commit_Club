import React, { useState, useEffect } from 'react';
import { verifyGitHubProfileUrl, registerUser, loginUser } from '../services/authApi';
import { useAuth } from '../context/AuthContext';

export const JoinPage = ({ onNavigate, mode: initialMode = 'join' }) => {
  const [mode, setMode] = useState(initialMode); // 'join' or 'login'
  const [name, setName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [verifying, setVerifying] = useState(false);
  const [verifiedProfile, setVerifiedProfile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { refreshUser } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setVerifiedProfile(null);
    setPassword('');
    setConfirmPassword('');
  }, [initialMode]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!githubUrl || !githubUrl.trim()) {
      setErrorMessage('Please enter your GitHub profile URL.');
      return;
    }

    setVerifying(true);
    setErrorMessage('');
    setVerifiedProfile(null);

    try {
      const res = await verifyGitHubProfileUrl(githubUrl.trim());
      if (res && res.success) {
        setVerifiedProfile({
          username: res.githubUsername || res.github?.username,
          avatar: res.githubAvatar || res.github?.avatar,
          url: res.githubProfileUrl || res.github?.profileUrl
        });
      } else {
        setErrorMessage(res?.error?.message || 'Could not verify GitHub profile URL.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please check the URL format.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'join') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Password and confirm password do not match.');
        return;
      }

      if (!verifiedProfile) {
        setErrorMessage('Please verify your GitHub profile URL first.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'join') {
        const payload = {
          name: name.trim(),
          githubUrl: githubUrl.trim(),
          password,
          confirmPassword
        };
        const res = await registerUser(payload);
        if (res && res.success) {
          await refreshUser();
          onNavigate('dashboard');
        } else {
          setErrorMessage(res?.error?.message || 'Registration failed.');
        }
      } else {
        const res = await loginUser({ name: name.trim(), password });
        if (res && res.success) {
          await refreshUser();
          onNavigate('dashboard');
        } else {
          setErrorMessage(res?.error?.message || 'Invalid name or password.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#071C15] bg-radial-green bg-grain flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full editorial-card p-8 space-y-6 animate-fade-in border border-[#15533D]">
        
        {/* Toggle Mode */}
        <div className="flex items-center justify-between border-b border-[#103D2E] pb-4">
          <h2 className="text-xl font-bold tracking-widest text-[#E2F1E7] uppercase">
            {mode === 'join' ? 'JOIN THE CLUB' : 'LOGIN TO CLUB'}
          </h2>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'join' ? 'login' : 'join');
              setErrorMessage('');
            }}
            className="text-xs font-semibold text-[#8EBDA5] hover:text-[#E2F1E7] transition-colors uppercase tracking-wider"
          >
            {mode === 'join' ? 'Switch to Login' : 'Switch to Join'}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-[#103D2E] border border-[#1C6B4D] text-[#B8D8C2] text-xs p-3 rounded font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Your Name */}
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8EBDA5] uppercase mb-1.5">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hariharasudhan"
              required
              className="w-full bg-[#071C15] border border-[#15533D] focus:border-[#1C6B4D] text-[#E2F1E7] px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder-[#62907A]"
            />
          </div>

          {/* GitHub profile URL (Registration Only) */}
          {mode === 'join' && (
            <div>
              <label className="block text-xs font-bold tracking-widest text-[#8EBDA5] uppercase mb-1.5">
                GitHub profile URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setVerifiedProfile(null);
                  }}
                  placeholder="https://github.com/username"
                  required
                  className="w-full bg-[#071C15] border border-[#15533D] focus:border-[#1C6B4D] text-[#E2F1E7] px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder-[#62907A] font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || !githubUrl.trim()}
                  className="px-4 py-2.5 bg-[#103D2E] hover:bg-[#15533D] text-[#B8D8C2] text-xs font-bold tracking-wider rounded border border-[#15533D] whitespace-nowrap transition-all disabled:opacity-50"
                >
                  {verifying ? 'VERIFYING...' : 'VERIFY GITHUB'}
                </button>
              </div>
            </div>
          )}

          {/* Verification Success Box */}
          {mode === 'join' && verifiedProfile && (
            <div className="bg-[#071C15] border border-[#1C6B4D] p-3 rounded flex items-center gap-3 animate-fade-in">
              <img
                src={verifiedProfile.avatar}
                alt={verifiedProfile.username}
                className="w-10 h-10 rounded-full border border-[#1C6B4D] object-cover"
              />
              <div>
                <div className="text-xs font-bold text-[#B8D8C2] flex items-center gap-1.5">
                  <span className="text-[#238561]">✓</span> GitHub account verified
                </div>
                <div className="text-xs font-mono text-[#8EBDA5] mt-0.5">
                  @{verifiedProfile.username}
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8EBDA5] uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full bg-[#071C15] border border-[#15533D] focus:border-[#1C6B4D] text-[#E2F1E7] px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder-[#62907A]"
            />
          </div>

          {/* Confirm Password (Registration Only) */}
          {mode === 'join' && (
            <div>
              <label className="block text-xs font-bold tracking-widest text-[#8EBDA5] uppercase mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full bg-[#071C15] border border-[#15533D] focus:border-[#1C6B4D] text-[#E2F1E7] px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder-[#62907A]"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitting || (mode === 'join' && (!verifiedProfile || !password || password !== confirmPassword))}
            className="w-full py-3.5 bg-[#15533D] hover:bg-[#1C6B4D] text-[#E2F1E7] font-bold tracking-widest text-sm uppercase rounded border border-[#1C6B4D] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? 'PROCESSING...' : mode === 'join' ? 'JOIN CLUB' : 'LOGIN TO CLUB'}
          </button>
        </form>

      </div>
    </div>
  );
};
