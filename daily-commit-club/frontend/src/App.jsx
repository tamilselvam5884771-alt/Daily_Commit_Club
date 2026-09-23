import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { JoinPage } from './pages/JoinPage';
import { DashboardPage } from './pages/DashboardPage';
import { getChallengeStatus } from './services/challengeApi';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [pageMode, setPageMode] = useState('join');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentPage('dashboard');
      }
    }
  }, [user, loading]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getChallengeStatus();
        if (res && res.success && res.data) {
          setStats({
            totalMembers: res.data.totalMembers,
            committedTodayCount: res.data.committedTodayCount,
            daysCount: res.data.daysCount || 1
          });
        }
      } catch (err) {
        // Fallback stats
      }
    };
    loadStats();
  }, []);

  const handleNavigate = (page, options = {}) => {
    if (options.mode) {
      setPageMode(options.mode);
    }
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071C15] flex items-center justify-center text-[#62907A] font-mono text-sm">
        Loading Daily Commit Club...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071C15] text-[#B8D8C2] flex flex-col font-sans selection:bg-[#1C6B4D] selection:text-[#E2F1E7]">
      <Navbar onNavigate={handleNavigate} />
      
      <main className="flex-1">
        {currentPage === 'dashboard' && user ? (
          <DashboardPage onNavigate={handleNavigate} />
        ) : currentPage === 'join' ? (
          <JoinPage onNavigate={handleNavigate} mode={pageMode} />
        ) : (
          <LandingPage onNavigate={handleNavigate} stats={stats} />
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
