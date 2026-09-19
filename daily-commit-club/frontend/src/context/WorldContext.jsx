import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllBuildings } from '../services/buildingApi';
import { getChallengeStatus } from '../services/challengeApi';

const WorldContext = createContext();

export const WorldProvider = ({ children }) => {
  const [buildings, setBuildings] = useState([]);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState('spring');

  const refreshWorld = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.allSettled([
        getAllBuildings(),
        getChallengeStatus()
      ]);

      if (bRes.status === 'fulfilled' && bRes.value?.data) {
        setBuildings(bRes.value.data);
      }

      if (cRes.status === 'fulfilled' && cRes.value?.data) {
        const info = cRes.value.data;
        setChallengeInfo(info);
        setMembers(info.members || []);

        // Calculate Season state based on group/member streak day count
        const maxStreak = Math.max(...(info.members || []).map(m => m.user?.currentStreak || 0), 0);
        if (maxStreak >= 30) setSeason('legendary');
        else if (maxStreak >= 22) setSeason('winter');
        else if (maxStreak >= 15) setSeason('autumn');
        else if (maxStreak >= 8) setSeason('summer');
        else setSeason('spring');
      }
    } catch (err) {
      console.warn('World fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorld();
  }, []);

  return (
    <WorldContext.Provider
      value={{
        buildings,
        challengeInfo,
        members,
        selectedBuilding,
        setSelectedBuilding,
        activeMember,
        setActiveMember,
        season,
        loading,
        refreshWorld
      }}
    >
      {children}
    </WorldContext.Provider>
  );
};

export const useWorld = () => useContext(WorldContext);
