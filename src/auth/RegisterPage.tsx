// src/components/auth/RegisterPage.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage({ onSwitch }: { onSwitch: () => void }) {
  const { login, addMember } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    addMember({
      name: form.name,
      email: form.email,
      phone: form.phone,
      avatar: '👩🏾',
      role: 'member',
      joinDate: new Date().toISOString().split('T')[0],
      totalContributed: 0,
      totalBorrowed: 0,
      status: 'active',
      nextOfKin: '',
      nationalId: '',
    });
    login(form.email, form.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-lg">
          <span className="text-6xl mb-6 block">💪🏾</span>
          <h1 className="text-4xl font-bold mb-4">Join Mama Chama</h1>
          <p className="text-xl text-white/80 mb-8">
            Start your journey towards financial freedom. Save together, grow together.
          </p>
          <div className="space-y-4">
            {['Save consistently every month', 'Access affordable loans', 'Grow through merry-go-round', 'Build lasting friendships'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</div>
                <span className="text-white/90">{item}</span>
              </div>
            ))}
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

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">Join our chama community today</p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Jane Wanjiku"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="jane@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+254 7XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setError(''); }}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <UserPlus className="w-5 h-5" /> Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <button onClick={onSwitch} className="text-primary-600 font-medium hover:text-primary-700">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}