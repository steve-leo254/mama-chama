// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';

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
import AdminDepositManagement from './admin/deposit-management/DepositManagement';

// Member Layout & Pages
import MemberLayout from './member-portal/MemberLayout';
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MemberTransactionsPage from './pages/member/MemberTransactionsPage';
import MemberGroupReportsPage from './pages/member/MemberGroupReportsPage';
import MemberMyReportsPage from './pages/member/MemberMyReportsPage';
import MemberMyLoansPage from './pages/member/MemberMyLoansPage';
import MemberProfilePage from './pages/member/MemberProfilePage';
import MerryGoRoundPage from './member-portal/merry-go-round/MerryGoRoundPage';

// Auth
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import ResetPasswordPage from './auth/ResetPasswordPage';
import TermsPage from './auth/TermsPage';
import VerifyEmailPage from './auth/VerifyEmailPage';

// Notifications
import NotificationsPage from './components/notifications/NotificationsPage';
import MyNotifications from './member-portal/MyNotifications';
import MemberChat from './member-portal/MemberChat';
import ChatList from './components/chat/AdminChatList';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'terms' | 'verify-email';

function AppContent() {
  const { isAuthenticated, portalMode } = useApp();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [registrationState, setRegistrationState] = useState<{
    step: number;
    data: any;
  } | null>(null);

  if (!isAuthenticated) {
    switch (authView) {
      case 'login':
        return (
          <LoginPage
            onSwitch={() => setAuthView('register')}
            onForgotPassword={() => setAuthView('forgot-password')}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onSwitch={() => {
              setRegistrationState(null);
              setAuthView('login');
            }}
            onViewTerms={(step: number, data: any) => {
              setRegistrationState({ step, data });
              setAuthView('terms');
            }}
            initialStep={registrationState?.step || 1}
            initialData={registrationState?.data || null}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onBack={() => setAuthView('login')}
            onResetPassword={() => setAuthView('reset-password')}
          />
        );

      case 'reset-password':
        return (
          <ResetPasswordPage
            onBack={() => setAuthView('forgot-password')}
            onSuccess={() => setAuthView('login')}
          />
        );

      case 'terms':
        return <TermsPage onBack={() => setAuthView('register')} />;

      case 'verify-email':
        return (
          <VerifyEmailPage
            email={pendingEmail || 'user@email.com'}
            onVerified={() => setAuthView('login')}
            onResend={() => console.log('Resend verification')}
          />
        );

      default:
        return (
          <LoginPage
            onSwitch={() => setAuthView('register')}
            onForgotPassword={() => setAuthView('forgot-password')}
          />
        );
    }
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
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/chat" element={<ChatList />} />
            <Route path="/deposit-management" element={<AdminDepositManagement />} />
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
            <Route path="/member/merry-go-round" element={<MerryGoRoundPage />} />
            <Route path="/member/notifications" element={<MyNotifications />} />
            <Route path="/member/chat" element={<MemberChat />} />
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;