import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { useWorld } from '../context/WorldContext';
import { Trophy, ArrowLeft, Shield, Flame, Coffee, Clock, CheckCircle } from 'lucide-react';

export const ChallengePage = () => {
  const navigate = useNavigate();
  const { challengeInfo, members } = useWorld();

  const challenge = challengeInfo?.challenge || {
    name: 'Daily Commit Club',
    description: 'Your GitHub activity keeps your world alive.',
    timezone: 'Asia/Kolkata',
    dailyDeadline: '23:59',
    minimumCommits: 1,
    penaltyType: 'coffee',
    penaltyAmount: 1
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen p-6 max-w-4xl mx-auto flex flex-col justify-between select-none">
        <div>
          {/* Back Navigation */}
          <button
            onClick={() => navigate('/world')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Main Realm
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              <Trophy className="w-5 h-5" /> Realm Code of Conduct
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-cinzel text-amber-200 tracking-wider">
              {challenge.name}
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto italic font-outfit">
              "{challenge.description}"
            </p>
          </div>

          {/* Challenge Rules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Daily Requirement</div>
              <div className="text-xl font-extrabold text-amber-300 mt-1">
                ≥ {challenge.minimumCommits} Commit / Day
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Challenge Timezone</div>
              <div className="text-xl font-extrabold text-amber-300 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> {challenge.timezone} ({challenge.dailyDeadline})
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Missed Penalty</div>
              <div className="text-xl font-extrabold text-rose-400 mt-1 flex items-center justify-center gap-1">
                <Coffee className="w-4 h-4" /> +{challenge.penaltyAmount} Coffee Owed
              </div>
            </div>
          </div>

          {/* Member Roster List */}
          <div className="ornate-border rounded-2xl p-6 bg-slate-900/90 border border-amber-500/30 shadow-2xl">
            <h3 className="text-lg font-bold font-cinzel text-amber-300 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" /> Active Member Roster (10 Maximum)
            </h3>

            <div className="space-y-3">
              {members.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.user?.githubAvatar || `https://github.com/${m.user?.githubUsername}.png`}
                      alt={m.user?.githubUsername}
                      className="w-8 h-8 rounded-full border border-amber-400"
                    />
                    <div>
                      <div className="font-bold text-slate-100">{m.user?.name || m.user?.githubUsername}</div>
                      <div className="text-[11px] text-amber-400/80">@{m.user?.githubUsername}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-amber-300 font-bold">
                      <Flame className="w-4 h-4 text-amber-500" /> {m.user?.currentStreak || 0}d
                    </div>

                    <div className="text-right">
                      <span className={`font-bold ${m.todayStatus === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {m.todayStatus === 'completed' ? '✓ COMMITTED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center py-6 text-xs text-slate-500">
          Daily Commit Club • Standard Challenge Engine v1.0
        </div>
      </div>
    </WorldBackground>
  );
};
