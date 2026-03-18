// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Contributions from './pages/Contributions';
import Loans from './pages/Loans';
import Meetings from './pages/Meetings';
import WalletPage from './pages/Wallet';
import MerryGoRound from './pages/MerryGoRound';
import Settings from './pages/Settings';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';

function AppContent() {
  const { isAuthenticated } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginPage onSwitch={() => setAuthMode('register')} />
    ) : (
      <RegisterPage onSwitch={() => setAuthMode('login')} />
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/merry-go-round" element={<MerryGoRound />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;