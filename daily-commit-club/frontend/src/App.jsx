import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorldProvider } from './context/WorldContext';

import { LandingPage } from './pages/LandingPage';
import { NameInputPage } from './pages/NameInputPage';
import { LoginPage } from './pages/LoginPage';
import { BuildingSelectionPage } from './pages/BuildingSelectionPage';
import { ConnectGithubPage } from './pages/ConnectGithubPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { WorldEntrancePage } from './pages/WorldEntrancePage';
import { MainWorldPage } from './pages/MainWorldPage';
import { ChallengePage } from './pages/ChallengePage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <WorldProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding/name" element={<NameInputPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/choose-home" element={<BuildingSelectionPage />} />
            <Route path="/connect-github" element={<ConnectGithubPage />} />
            <Route path="/setup-profile" element={<ProfileSetupPage />} />
            <Route path="/enter-world" element={<WorldEntrancePage />} />
            <Route path="/world" element={<MainWorldPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WorldProvider>
    </AuthProvider>
  );
}

export default App;
