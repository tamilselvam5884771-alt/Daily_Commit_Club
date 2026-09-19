import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WorldBackground } from '../components/WorldBackground';
import { Building } from '../components/Building';
import { getAllBuildings, claimBuildingApi } from '../services/buildingApi';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Check, ArrowRight } from 'lucide-react';

export const BuildingSelectionPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await getAllBuildings();
        if (res?.data) {
          setBuildings(res.data);
        }
      } catch (err) {
        console.error('Failed to load buildings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  const handleClaim = async () => {
    if (!selected) return;
    try {
      setClaiming(true);
      setErrorMsg('');
      await claimBuildingApi(selected._id || selected.buildingNumber);
      await refreshUser();
      navigate('/setup-profile');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to claim building. It may already be owned.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <WorldBackground season="spring">
      <div className="relative min-h-screen p-6 flex flex-col items-center justify-between select-none">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 animate-spin" /> Realm Territory Selection
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-cinzel text-amber-200 tracking-wider">
            CHOOSE YOUR HOME
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Select one of the 10 realm structures to anchor your daily GitHub commit streak.
          </p>
        </motion.div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="my-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs text-center max-w-md">
            {errorMsg}
          </div>
        )}

        {/* 10 Buildings Interactive Grid */}
        <div className="my-8 w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
          {buildings.map((b) => {
            const isOwned = !!b.ownerId;
            const isCurrentSelected = selected?._id === b._id;

            return (
              <div
                key={b.buildingNumber}
                onClick={() => !isOwned && setSelected(b)}
                className={`relative rounded-2xl p-3 transition-all duration-300 ${
                  isCurrentSelected ? 'ring-2 ring-amber-400 bg-amber-950/30 scale-105' : ''
                } ${isOwned ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                <Building
                  building={b}
                  owner={b.ownerId}
                  isSelected={isCurrentSelected}
                />

                {isOwned && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/90 text-[10px] font-bold text-slate-400 border border-slate-700">
                    OWNED
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Claim Action Bar */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mb-6 p-5 ornate-border rounded-2xl bg-slate-900/90 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border border-amber-500/40 shadow-2xl"
            >
              <div>
                <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold">
                  Selected Structure #{selected.buildingNumber}
                </div>
                <div className="text-xl font-bold text-slate-100 font-cinzel">
                  {selected.name} ({selected.theme} Realm)
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={claiming}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-widest hover:from-amber-400 hover:to-amber-600 transition shadow-lg flex items-center gap-2"
              >
                <span>{claiming ? 'CLAIMING...' : 'CHOOSE THIS HOME'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WorldBackground>
  );
};
