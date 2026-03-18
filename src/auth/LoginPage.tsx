// src/components/auth/LoginPage.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, LogIn, Shield, User } from 'lucide-react';

export default function LoginPage({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'admin' | 'member'>('member');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    login(email, password, mode);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-lg">
          <span className="text-6xl mb-6 block">🤝</span>
          <h1 className="text-4xl font-bold mb-4">Mama Chama</h1>
          <p className="text-xl text-white/80 mb-8">
            Empowering women through collective savings, smart investments, and community support.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-white/70">Active Groups</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">KES 50M+</p>
              <p className="text-sm text-white/70">Savings</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">5,000+</p>
              <p className="text-sm text-white/70">Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mama Chama</h1>
              <p className="text-xs text-gray-500">Savings & Investment</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-6">Sign in to your account</p>

          {/* Portal Mode Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMode('member')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                mode === 'member'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <User className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold text-sm">Member</p>
                <p className="text-[10px] opacity-70">Personal portal</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                mode === 'admin'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Shield className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold text-sm">Admin</p>
                <p className="text-[10px] opacity-70">Manage chama</p>
              </div>
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="input-field"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="input-field pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 font-medium hover:text-primary-700">Forgot password?</a>
            </div>

            <button type="submit" className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all shadow-lg active:scale-[0.98] ${
              mode === 'member'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-primary-500/25'
            }`}>
              <LogIn className="w-5 h-5" />
              Sign In as {mode === 'member' ? 'Member' : 'Admin'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button onClick={onSwitch} className="text-primary-600 font-medium hover:text-primary-700">
              Create one
            </button>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-1">
            <p className="text-xs text-gray-500 text-center font-medium">💡 Demo Accounts</p>
            <p className="text-xs text-gray-400 text-center">Admin: mary@email.com | Member: agnes@email.com</p>
            <p className="text-xs text-gray-400 text-center">Any password works</p>
          </div>
        </div>
      </div>
    </div>
  );
}