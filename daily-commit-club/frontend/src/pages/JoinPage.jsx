import React, { useState, useEffect } from 'react';
import { verifyGitHubProfileUrl, registerUser, loginUser } from '../services/authApi';
import { useAuth } from '../context/AuthContext';

export const JoinPage = ({ onNavigate, mode: initialMode = 'join' }) => {
  const [mode, setMode] = useState(initialMode); // 'join' or 'login'
  const [name, setName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  
  const [verifying, setVerifying] = useState(false);
  const [verifiedProfile, setVerifiedProfile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { refreshUser } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setVerifiedProfile(null);
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
    if (!verifiedProfile) {
      setErrorMessage('Please verify your GitHub profile first.');
      return;
    }

    if (mode === 'join' && (!name || !name.trim())) {
      setErrorMessage('Please enter your name.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      if (mode === 'join') {
        const res = await registerUser(name.trim(), githubUrl.trim());
        if (res && res.success) {
          await refreshUser();
          onNavigate('dashboard');
        } else {
          setErrorMessage(res?.error?.message || 'Registration failed.');
        }
      } else {
        const res = await loginUser(name.trim(), githubUrl.trim());
        if (res && res.success) {
          await refreshUser();
          onNavigate('dashboard');
        } else {
          setErrorMessage(res?.error?.message || 'Login failed. User not found.');
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Your Name */}
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8EBDA5] uppercase mb-2">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hariharasudhan"
              required={mode === 'join'}
              className="w-full bg-[#071C15] border border-[#15533D] focus:border-[#1C6B4D] text-[#E2F1E7] px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder-[#62907A]"
            />
          </div>

          {/* GitHub profile URL */}
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8EBDA5] uppercase mb-2">
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

          {/* Verification Success Box */}
          {verifiedProfile && (
            <div className="bg-[#071C15] border border-[#1C6B4D] p-4 rounded flex items-center gap-3 animate-fade-in">
              <img
                src={verifiedProfile.avatar}
                alt={verifiedProfile.username}
                className="w-10 h-10 rounded-full border border-[#1C6B4D] object-cover"
              />
              <div>
                <div className="text-xs font-bold text-[#B8D8C2] flex items-center gap-1.5">
                  <span className="text-[#238561]">✓</span> GitHub account found
                </div>
                <div className="text-xs font-mono text-[#8EBDA5] mt-0.5">
                  @{verifiedProfile.username}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitting || !verifiedProfile}
            className="w-full py-3.5 bg-[#15533D] hover:bg-[#1C6B4D] text-[#E2F1E7] font-bold tracking-widest text-sm uppercase rounded border border-[#1C6B4D] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? 'PROCESSING...' : mode === 'join' ? 'JOIN CLUB' : 'LOGIN TO CLUB'}
          </button>
        </form>

      </div>
    </div>
  );
};
