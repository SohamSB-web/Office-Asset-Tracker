import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import AssetsPage from './pages/AssetsPage';
import AddAssetPage from './pages/AddAssetPage';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('assets');
  const [user, setUser] = useState(null);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('oat_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
  }, []);

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('oat_user', JSON.stringify(userData));
    localStorage.setItem('oat_token', token);
    setCurrentPage('assets');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('oat_user');
    localStorage.removeItem('oat_token');
    setCurrentPage('auth');
  };

  return (
    <div className="app-container">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {currentPage === 'auth' && (
          <AuthPage
            apiUrl={API_URL}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {currentPage === 'assets' && (
          <AssetsPage
            apiUrl={API_URL}
            onNavigateToAdd={() => setCurrentPage('add-asset')}
          />
        )}

        {currentPage === 'add-asset' && (
          <AddAssetPage
            apiUrl={API_URL}
            user={user}
            onBack={() => setCurrentPage('assets')}
            onAssetCreated={() => setCurrentPage('assets')}
          />
        )}
      </main>

      <footer className="footer">
        Office Asset Tracker &bull; 45-Minute Workshop Project &bull; Powered by Minimoth OTP API
      </footer>
    </div>
  );
}
