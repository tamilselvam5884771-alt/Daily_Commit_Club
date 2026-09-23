import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { WorldBackground } from '../components/WorldBackground';
import { Building } from '../components/Building';
import { MemberCard } from '../components/MemberCard';
import { MeteorSequence } from '../components/MeteorSequence';
import { SuccessSequence } from '../components/SuccessSequence';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { useWorld } from '../context/WorldContext';
import { useAuth } from '../context/AuthContext';
import { simulateSuccess, simulateMiss } from '../services/devApi';
import { audioService } from '../services/audioService';
import { Flame, Shield, Trophy, LogOut, Wrench, RefreshCw, Sparkles, Bell, Volume2, VolumeX, User as UserIcon } from 'lucide-react';

export const MainWorldPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { buildings, members, season, refreshWorld } = useWorld();
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSequence, setActiveSequence] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(!audioService.isEnabled);

  // Organic positions for 10 houses across illustrated terrain
  const ORGANIC_POSITIONS = [
    { top: '22%', left: '15%' },
    { top: '18%', left: '38%' },
    { top: '25%', left: '62%' },
    { top: '20%', left: '82%' },
    { top: '48%', left: '12%' },
    { top: '45%', left: '35%' },
    { top: '50%', left: '60%' },
    { top: '46%', left: '84%' },
    { top: '72%', left: '25%' },
    { top: '70%', left: '68%' }
  ];

  // Refresh world state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWorld();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const state = audioService.toggleAudio();
    setIsAudioMuted(!state);
  };

  const handleBuildingClick = (building, index) => {
    const pos = ORGANIC_POSITIONS[index] || { top: '50%', left: '50%' };
    
    // GSAP Camera Zoom & Pan to house property
    gsap.to('#world-camera', {
      scale: 1.25,
      x: (50 - parseFloat(pos.left)) * 5,
      y: (50 - parseFloat(pos.top)) * 5,
      duration: 0.8,
      ease: 'power2.out'
    });

    const member = members.find((m) => m.building?.number === building.buildingNumber) || {
      building: {
        number: building.buildingNumber,
        name: building.name,
        health: building.health,
        destroyed: building.destroyed
      },
      user: building.ownerId || {
        githubUsername: 'Unclaimed',
        name: 'Unclaimed Residence',
        currentStreak: 0,
        coffeeDebt: 0
      }
    };
    setSelectedMember(member);
  };

  const handleCloseMemberCard = () => {
    setSelectedMember(null);
    // Reset Camera Zoom
    gsap.to('#world-camera', {
      scale: 1,
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  };

  const handleSimulateSuccess = async () => {
    if (!user?._id) return;
    try {
      await simulateSuccess(user._id);
      await refreshWorld();
      audioService.playVictoryFanfare();
      setActiveSequence('success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateMiss = async () => {
    if (!user?._id) return;
    try {
      await simulateMiss(user._id);
      await refreshWorld();
      audioService.playImpactRumble();
      setActiveSequence('meteor');
    } catch (err) {
      console.error(err);
    }
  };

  const aliveCount = buildings.filter((b) => !b.destroyed && b.health > 0).length;
  const dangerCount = buildings.filter((b) => b.health > 0 && b.health <= 40).length;
  const maxStreak = Math.max(...members.map((m) => m.user?.currentStreak || 0), 0);

  return (
    <WorldBackground season={season}>
      <div className="relative min-h-screen w-full select-none overflow-hidden flex flex-col justify-between">
        {/* Minimal Persistent Top HUD */}
        <div className="relative z-30 p-6 flex items-center justify-between pointer-events-auto">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span className="text-xl font-black font-cinzel text-amber-200 tracking-wider">
              DAILY COMMIT CLUB
            </span>
          </div>

          {/* User & System Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 border border-amber-500/40 cursor-pointer hover:border-amber-400 transition"
              >
                <img
                  src={user.githubAvatar || user.profileImage || `https://github.com/${user.githubUsername}.png`}
                  alt={user.githubUsername}
                  className="w-6 h-6 rounded-full border border-amber-400"
                />
                <span className="text-xs font-bold text-amber-200">@{user.githubUsername}</span>
                <span className="text-xs text-amber-400 font-black flex items-center gap-0.5 ml-1">
                  <Flame className="w-3.5 h-3.5" /> {user.currentStreak || 0}d
                </span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase"
              >
                Login
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 transition"
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 transition relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            </button>

            {/* Challenge Overview */}
            <button
              onClick={() => navigate('/challenge')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 transition"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Dev Panel */}
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 transition"
            >
              <Wrench className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Viewport with 4-Layer Parallax & House Grid */}
        <div id="world-camera" className="relative flex-1 w-full max-w-7xl mx-auto my-auto min-h-[520px]">
          {buildings.map((b, index) => {
            const pos = ORGANIC_POSITIONS[index] || { top: '50%', left: '50%' };
            const memberObj = members.find((m) => m.building?.number === b.buildingNumber);
            const ownerObj = memberObj?.user || b.ownerId;
            const isSelected = selectedMember?.building?.number === b.buildingNumber;

            return (
              <div
                key={b.buildingNumber}
                style={{ top: pos.top, left: pos.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
              >
                <Building
                  building={b}
                  owner={ownerObj}
                  health={b.health}
                  destroyed={b.destroyed}
                  isSelected={isSelected}
                  isDoorOpen={isSelected}
                  onClick={() => handleBuildingClick(b, index)}
                />
              </div>
            );
          })}
        </div>

        {/* Minimal Persistent Bottom Dashboard Bar */}
        <div className="relative z-30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
          <div className="px-4 py-2 rounded-xl bg-slate-900/85 border border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-3">
            <span>10 HOUSES</span>
            <span>•</span>
            <span className="text-emerald-400">{aliveCount} ALIVE</span>
            {dangerCount > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-400 animate-pulse">{dangerCount} IN DANGER</span>
              </>
            )}
          </div>

          <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-amber-950/80 border border-amber-500/40 text-center shadow-xl">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CHALLENGE STATUS • GROUP STREAK</div>
            <div className="text-lg font-black text-amber-300 font-cinzel flex items-center justify-center gap-1.5">
              <Flame className="w-5 h-5 text-amber-500 animate-bounce" /> GROUP STREAK {maxStreak} DAYS
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-900/85 border border-slate-800 text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>SEASON: {season.toUpperCase()}</span>
          </div>
        </div>

        {/* Notification Drawer */}
        <NotificationDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        {/* Dev Panel */}
        {showDevPanel && (
          <div className="fixed top-20 right-6 z-40 p-4 ornate-border rounded-xl bg-slate-900/95 border border-amber-500/40 shadow-2xl text-xs space-y-3 w-64">
            <div className="font-bold text-amber-300 uppercase tracking-widest flex items-center justify-between">
              <span>Dev Simulation Panel</span>
              <button onClick={() => setShowDevPanel(false)}>✕</button>
            </div>
            <p className="text-[11px] text-slate-400">Trigger live business logic & cinematic sequences.</p>

            <button
              onClick={handleSimulateSuccess}
              className="w-full py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold transition flex items-center justify-center gap-1"
            >
              <Flame className="w-3.5 h-3.5" /> SIMULATE SUCCESS
            </button>

            <button
              onClick={handleSimulateMiss}
              className="w-full py-2 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 font-bold transition flex items-center justify-center gap-1"
            >
              <span>☄️ SIMULATE MISSED METEOR</span>
            </button>

            <button
              onClick={refreshWorld}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh World State
            </button>
          </div>
        )}

        {/* Member Profile Information Card */}
        <AnimatePresence>
          {selectedMember && (
            <MemberCard member={selectedMember} onClose={handleCloseMemberCard} />
          )}
        </AnimatePresence>

        {/* Sequences */}
        {activeSequence === 'meteor' && (
          <MeteorSequence
            memberName={user?.githubUsername || 'Warrior'}
            buildingName={user?.buildingId?.name || 'Your Building'}
            onClose={() => setActiveSequence(null)}
          />
        )}

        {activeSequence === 'success' && (
          <SuccessSequence
            memberName={user?.githubUsername || 'Warrior'}
            streak={user?.currentStreak || 1}
            onClose={() => setActiveSequence(null)}
          />
        )}
      </div>
    </WorldBackground>
  );
};
