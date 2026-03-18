// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Admin Layout & Pages
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Contributions from './pages/Contributions';
import Loans from './pages/Loans';
import Meetings from './pages/Meetings';
import WalletPage from './pages/Wallet';
import MerryGoRound from './pages/MerryGoRound';
import Settings from './pages/Settings';

// Member Layout & Pages
import MemberLayout from './member-portal/MemberLayout';
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MemberTransactionsPage from './pages/member/MemberTransactionsPage';
import MemberGroupReportsPage from './pages/member/MemberGroupReportsPage';
import MemberMyReportsPage from './pages/member/MemberMyReportsPage';
import MemberMyLoansPage from './pages/member/MemberMyLoansPage';
import MemberProfilePage from './pages/member/MemberProfilePage';

// Auth
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';

function AppContent() {
  const { isAuthenticated, portalMode } = useApp();
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
        {portalMode === 'admin' ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/contributions" element={<Contributions />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/merry-go-round" element={<MerryGoRound />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        ) : (
          <Route element={<MemberLayout />}>
            <Route path="/" element={<MemberDashboardPage />} />
            <Route path="/member" element={<MemberDashboardPage />} />
            <Route path="/member/transactions" element={<MemberTransactionsPage />} />
            <Route path="/member/group-reports" element={<MemberGroupReportsPage />} />
            <Route path="/member/my-reports" element={<MemberMyReportsPage />} />
            <Route path="/member/my-loans" element={<MemberMyLoansPage />} />
            <Route path="/member/profile" element={<MemberProfilePage />} />
            <Route path="*" element={<MemberDashboardPage />} />
          </Route>
        )}
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