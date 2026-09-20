import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Character } from '../components/Character';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Camera, ArrowRight } from 'lucide-react';

export const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const displayName = user?.displayName || localStorage.getItem('dcc_display_name') || 'Warrior';
  const [imageUrl, setImageUrl] = useState(user?.profileImage || user?.githubAvatar || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (user?._id) {
        await fetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('dcc_token')}`
          },
          body: JSON.stringify({
            displayName,
            profileImage: imageUrl
          })
        });
        await refreshUser();
      }
      navigate('/enter-world');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const previewUser = {
    ...(user || {}),
    displayName,
    name: displayName,
    profileImage: imageUrl || user?.githubAvatar
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen p-6 flex flex-col items-center justify-center select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md ornate-border p-8 rounded-3xl bg-slate-900/90 text-center border border-amber-500/30 shadow-2xl"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            <Sparkles className="w-4 h-4 animate-spin" /> Step 4 of Onboarding
          </div>
          <h2 className="text-3xl font-black font-cinzel text-amber-200 tracking-wider">
            MEET YOUR CHARACTER
          </h2>
          <p className="text-xs text-slate-300 mt-1 italic">
            Upload your profile image to represent {displayName} in the realm.
          </p>

          {/* Character Frame Live Preview */}
          <div className="my-6 flex justify-center">
            <Character user={previewUser} size="lg" speechText={`Hi! I'm ${displayName} 👋`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Profile Image URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://github.com/your-username.png"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition pl-9"
                />
                <Camera className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl hover:from-amber-400 hover:to-amber-600 transition flex items-center justify-center gap-2"
            >
              <span>{saving ? 'PREPARING ENTRANCE...' : 'ENTER THE WORLD'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </WorldBackground>
  );
};
