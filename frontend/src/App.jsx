import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import CoffeePage from './pages/CoffeePage';
import Navbar from './components/Navbar';
import { Coffee } from 'lucide-react';

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05140e] flex flex-col items-center justify-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800/50 animate-bounce">
          <Coffee className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="text-xs font-mono font-semibold text-emerald-400/70 tracking-widest uppercase">
          Initializing Daily Commit Club...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#04110C] flex flex-col font-sans w-full">
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/coffee" element={<CoffeePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
