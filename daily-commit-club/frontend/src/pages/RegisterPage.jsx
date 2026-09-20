import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Shield, Home, Lock, Mail, User, Github } from 'lucide-react';
import { verifyGitHubProfileUrl, registerUser } from '../services/authApi';
import { fetchApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { audioService } from '../services/audioService';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3: GitHub Verification
  const [githubUrlInput, setGithubUrlInput] = useState('');
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [githubError, setGithubError] = useState('');

  // Step 4: House Selection
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  // Step 5: Profile Image
  const [customProfileImage, setCustomProfileImage] = useState('');

  // Global Error & Submission
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load buildings for house selection step
    fetchApi('/buildings')
      .then((res) => {
        if (res && res.data) {
          setBuildings(res.data);
          // Preselect first available building
          const available = res.data.find((b) => !b.ownerId);
          if (available) setSelectedBuildingId(available._id);
        }
      })
      .catch(() => {});
  }, []);

  const handleVerifyGithub = async () => {
    setGithubError('');
    setGithubData(null);
    if (!githubUrlInput.trim()) {
      setGithubError('Please enter your full GitHub profile URL.');
      return;
    }

    try {
      setIsVerifyingGithub(true);
      audioService.playClick();
      const res = await verifyGitHubProfileUrl(githubUrlInput);
      if (res && res.success && res.github) {
        setGithubData(res.github);
        audioService.playVictoryFanfare();
      } else {
        setGithubError(res?.error?.message || 'GitHub profile not found.');
      }
    } catch (err) {
      setGithubError(err.message || "Couldn't verify GitHub right now. Try again.");
    } finally {
      setIsVerifyingGithub(false);
    }
  };

  const handleCompleteRegistration = async () => {
    setFormError('');
    if (!name || !email || !password || !githubData || !selectedBuildingId) {
      setFormError('Please complete all registration steps.');
      return;
    }

    try {
      setIsSubmitting(true);
      audioService.playClick();

      const payload = {
        name,
        email,
        password,
        githubUrl: githubData.profileUrl,
        buildingId: selectedBuildingId,
        profileImage: customProfileImage || githubData.avatar
      };

      const res = await registerUser(payload);

      if (res && res.success) {
        await refreshUser();
        audioService.playVictoryFanfare();
        navigate('/world');
      } else {
        setFormError(res?.error?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 z-20">
        {/* Top Header Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Realm Registration</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-md">
            JOIN THE COMMIT CLUB
          </h1>
        </motion.div>

        {/* Multi-Step Registration Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-xl ornate-border p-8 rounded-3xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl"
        >
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-8 px-2 border-b border-slate-800 pb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-1.5 text-xs font-extrabold ${
                  step === s
                    ? 'text-amber-400 scale-110'
                    : step > s
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                    step === s
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : step > s
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-slate-700 bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-amber-300 mb-2">
                    Step 1: Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                <button
                  disabled={!name.trim()}
                  onClick={() => {
                    audioService.playClick();
                    setStep(2);
                  }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Email & Password */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-amber-300 mb-1.5">
                    Step 2: Email & Password
                  </label>

                  <div className="space-y-3 mt-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-sm"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-sm"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-sm"
                      />
                    </div>
                  </div>
                </div>

                {password && confirmPassword && password !== confirmPassword && (
                  <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Passwords do not match.
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-slate-700 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    disabled={!email || !password || password.length < 6 || password !== confirmPassword}
                    onClick={() => {
                      audioService.playClick();
                      setStep(3);
                    }}
                    className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition"
                  >
                    <span>Connect GitHub</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: GitHub Verification */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-amber-300 mb-1">
                    Step 3: Connect your GitHub profile
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Paste your full GitHub profile URL (e.g. <span className="text-amber-300 font-mono">https://github.com/username</span>).
                  </p>

                  <div className="space-y-3">
                    <div className="relative">
                      <Github className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://github.com/yourusername"
                        value={githubUrlInput}
                        onChange={(e) => setGithubUrlInput(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition text-sm font-mono"
                      />
                    </div>

                    <button
                      disabled={isVerifyingGithub || !githubUrlInput.trim()}
                      onClick={handleVerifyGithub}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider transition border border-amber-500/30 flex items-center justify-center gap-2"
                    >
                      {isVerifyingGithub ? (
                        <span>VERIFYING GITHUB PROFILE...</span>
                      ) : (
                        <span>VERIFY GITHUB</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* GitHub Verified Result Badge */}
                {githubData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={githubData.avatar}
                        alt={githubData.username}
                        className="w-12 h-12 rounded-full border-2 border-emerald-400"
                      />
                      <div>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> GitHub profile found
                        </div>
                        <div className="text-sm font-black text-slate-100">@{githubData.username}</div>
                        <div className="text-[11px] text-slate-400">{githubData.name}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {githubError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-300 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{githubError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-slate-700 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    disabled={!githubData}
                    onClick={() => {
                      audioService.playClick();
                      setStep(4);
                    }}
                    className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition"
                  >
                    <span>USE THIS ACCOUNT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: House Selection */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-amber-300 mb-1">
                    Step 4: Claim Your House
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Select 1 of the 10 realm structures to make your official residence.
                  </p>
                </div>

                {/* 10 Houses Selection Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {buildings.map((b) => {
                    const isOccupied = !!b.ownerId;
                    const isSelected = selectedBuildingId === b._id;
                    return (
                      <div
                        key={b._id}
                        onClick={() => {
                          if (!isOccupied) {
                            audioService.playHover();
                            setSelectedBuildingId(b._id);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          isOccupied
                            ? 'opacity-40 border-slate-800 bg-slate-950/60 pointer-events-none'
                            : isSelected
                            ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                            : 'border-slate-800 bg-slate-900/80 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span style={{ color: b.primaryColor || '#f59e0b' }}>
                            House #{b.buildingNumber}
                          </span>
                          {isSelected && <span className="text-amber-400 text-xs">★ SELECTED</span>}
                          {isOccupied && <span className="text-rose-400 text-[10px]">CLAIMED</span>}
                        </div>
                        <div className="text-xs font-black text-slate-200 truncate mt-0.5">{b.name}</div>
                        <div className="text-[10px] text-slate-400 italic">{b.structure}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setStep(3)}
                    className="w-1/3 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-slate-700 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    disabled={!selectedBuildingId}
                    onClick={() => {
                      audioService.playClick();
                      setStep(5);
                    }}
                    className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition"
                  >
                    <span>Final Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Profile Image & Finalize */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-amber-300 mb-1">
                    Step 5: Profile Avatar & Finish
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    Confirm your avatar (defaults to GitHub profile image).
                  </p>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <img
                      src={customProfileImage || githubData?.avatar}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-300 mb-1">Avatar Image URL</div>
                      <input
                        type="url"
                        placeholder="Optional custom image URL"
                        value={customProfileImage}
                        onChange={(e) => setCustomProfileImage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-300 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(4)}
                    className="w-1/3 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-slate-700 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleCompleteRegistration}
                    className="w-2/3 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 hover:brightness-110 transition"
                  >
                    {isSubmitting ? (
                      <span>CREATING ACCOUNT...</span>
                    ) : (
                      <span>CREATE ACCOUNT & ENTER</span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
            <span className="text-xs text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-xs font-bold text-amber-300 hover:underline">
              Log in here
            </Link>
          </div>
        </motion.div>
      </div>
    </WorldBackground>
  );
};
