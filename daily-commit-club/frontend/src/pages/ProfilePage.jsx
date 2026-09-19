import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Character } from '../components/Character';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ExternalLink, Flame, Coffee, Shield, CheckCircle } from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <WorldBackground season="spring">
        <div className="min-h-screen flex items-center justify-center text-center">
          <p className="text-slate-400">Please authenticate to view your profile.</p>
        </div>
      </WorldBackground>
    );
  }

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen p-6 max-w-2xl mx-auto flex flex-col justify-between select-none">
        <div>
          {/* Back Navigation */}
          <button
            onClick={() => navigate('/world')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Realm
          </button>

          {/* Profile Card */}
          <div className="ornate-border rounded-3xl p-8 bg-slate-900/90 border border-amber-500/30 shadow-2xl text-center">
            <Character user={user} size="lg" speechText="My Realm Statistics" />

            <h1 className="mt-4 text-3xl font-black font-cinzel text-amber-200">
              {user.name || user.githubUsername}
            </h1>
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-400/80 hover:text-amber-300 flex items-center justify-center gap-1 mt-1"
            >
              @{user.githubUsername} <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Statistics Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Current Streak</div>
                <div className="text-lg font-extrabold text-amber-300 mt-1">{user.currentStreak || 0}d</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Longest Streak</div>
                <div className="text-lg font-extrabold text-emerald-400 mt-1">{user.longestStreak || 0}d</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Total Completed</div>
                <div className="text-lg font-extrabold text-blue-400 mt-1">{user.totalCompletedDays || 0}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Coffee Debt</div>
                <div className="text-lg font-extrabold text-amber-400 mt-1 flex items-center justify-center gap-1">
                  <Coffee className="w-4 h-4" /> {user.coffeeDebt || 0}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/setup-profile')}
                className="flex-1 py-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider transition"
              >
                Edit Portrait / Character
              </button>

              <button
                onClick={logout}
                className="flex-1 py-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider transition"
              >
                Logout Session
              </button>
            </div>
          </div>
        </div>

        <div className="text-center py-6 text-xs text-slate-500">
          Daily Commit Club • Member Profile
        </div>
      </div>
    </WorldBackground>
  );
};
