// src/components/auth/ResetPasswordPage.tsx
import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, Circle, Lock, KeyRound } from 'lucide-react';
import AuthLayout from './AuthLayout.tsx';

interface ResetPasswordPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordPage({ onBack, onSuccess }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-primary-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must include an uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must include a number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        heroTitle="Password Reset"
        heroSubtitle="Your account is now secure with your new password."
        heroEmoji="🔒"
      >
        <div className="text-center animate-slide-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
            <Lock className="w-10 h-10 text-emerald-600" />
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
          <p className="text-gray-500 mb-8">
            Your password has been updated. You can now sign in with your new password.
          </p>

          <button
            onClick={onSuccess}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <KeyRound className="w-5 h-5" /> Go to Sign In
          </button>

          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <h4 className="text-sm font-semibold text-emerald-800 mb-1">🛡️ Security Tips</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• Don't share your password with anyone</li>
              <li>• Use a unique password for Mama Chama</li>
              <li>• Change your password regularly</li>
            </ul>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heroTitle="New Password"
      heroSubtitle="Choose a strong password to keep your account secure."
      heroEmoji="🔑"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
        <KeyRound className="w-8 h-8 text-primary-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
      <p className="text-gray-500 mb-6">
        Create a strong password that you haven't used before.
      </p>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 mb-6 text-sm flex items-center gap-2 animate-slide-up">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="input-field pl-12 pr-12"
              placeholder="Min. 6 characters"
              autoFocus
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

          {/* Strength Meter */}
          {password && (
            <div className="mt-3">
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength.level ? strength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                strength.level <= 1 ? 'text-rose-600' : strength.level <= 2 ? 'text-amber-600' :
                strength.level <= 3 ? 'text-primary-600' : 'text-emerald-600'
              }`}>{strength.label}</p>
            </div>
          )}

          {/* Requirements */}
          <div className="mt-3 space-y-1.5">
            {[
              { check: password.length >= 6, label: 'At least 6 characters' },
              { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
              { check: /[0-9]/.test(password), label: 'One number' },
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                {req.check ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-300" />
                )}
                <span className={`text-xs ${req.check ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className="input-field pl-12 pr-12"
              placeholder="Re-enter new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && password === confirmPassword && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Resetting...
            </>
          ) : (
            <>
              <KeyRound className="w-5 h-5" /> Reset Password
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}