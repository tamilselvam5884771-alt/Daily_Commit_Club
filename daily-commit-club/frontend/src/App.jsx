import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorldProvider } from './context/WorldContext';
import { CustomCursor } from './components/CustomCursor';

import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
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
          {/* Awwwards Custom Magnetic Cursor */}
          <CustomCursor />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding/name" element={<Navigate to="/register" replace />} />
            <Route path="/login" element={<LoginPage />} />
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
