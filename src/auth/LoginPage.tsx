// src/components/auth/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { toast } from '../components/ui/Toast';
import AuthLayout from './AuthLayout.tsx';

interface LoginPageProps {
  onSwitch: () => void;
  onForgotPassword: () => void;
  onRegisterAdmin?: () => void;
}

export default function LoginPage({ onSwitch, onForgotPassword, onRegisterAdmin }: LoginPageProps) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [showAdminRegister, setShowAdminRegister] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if any admins exist
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/check-admin-exists');
        const data = await response.json();
        setShowAdminRegister(!data.has_admins);
      } catch (error) {
        console.error('Failed to check admin existence:', error);
        setShowAdminRegister(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminExists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading || loginAttempted) {
      return;
    }

    if (!email.trim()) {
      toast.error('Validation Error', 'Please enter your email address');
      return;
    }
    if (!password) {
      toast.error('Validation Error', 'Please enter your password');
      return;
    }

    setLoginAttempted(true);
    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        toast.error('Login Failed', 'Invalid email or password');
      } else {
        toast.success('Login Successful', 'Welcome back to Mama Chama!');
      }
    } catch (err) {
      toast.error('Login Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setLoginAttempted(false), 1000); // Reset after 1 second
    }
  };

  return (
    <AuthLayout
      heroTitle="Mama Chama"
      heroSubtitle="Empowering women through collective savings, smart investments, and community support."
      heroEmoji="🤝"
      heroStats={[
        { value: '500+', label: 'Active Groups' },
        { value: 'KES 50M+', label: 'Savings' },
        { value: '5,000+', label: 'Members' },
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
      <p className="text-gray-500 mb-6">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Username</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@email.com"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-12"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary-600 font-medium hover:text-primary-700 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-primary-500/25"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-xs text-gray-500">OR</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
          Create Account
        </button>
      </p>

      {onRegisterAdmin && showAdminRegister && (
        <p className="text-center text-xs text-gray-400 mt-2">
          <button onClick={onRegisterAdmin} className="text-amber-600 font-medium hover:text-amber-700 hover:underline">
            Register Admin Account
          </button>
        </p>
      )}
    </AuthLayout>
  );
}