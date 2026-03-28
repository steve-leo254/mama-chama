// src/components/auth/ForgotPasswordPage.tsx
import { useState } from 'react';
import { ArrowLeft, Mail, Loader2, CheckCircle, Send } from 'lucide-react';
import AuthLayout from './AuthLayout.tsx';
import { authAPI } from '../services/api.ts';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onResetPassword: () => void;
}

export default function ForgotPasswordPage({ onBack, onResetPassword }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      startCountdown();
      console.log('Password reset email sent to:', email);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      startCountdown();
      console.log('Password reset email resent to:', email);
    } catch (err: any) {
      setError(err.message || 'Failed to resend reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Account Recovery"
      heroSubtitle="Don't worry, it happens to the best of us. We'll help you get back into your account."
      heroEmoji="🔐"
      heroFeatures={[
        'Secure password reset via email',
        'Reset link valid for 1 hour',
        'Your data remains safe and encrypted',
      ]}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Sign In
      </button>

      {!sent ? (
        <>
          {/* Request Form */}
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-500 mb-6">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 mb-6 text-sm flex items-center gap-2 animate-slide-up">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="input-field pl-12"
                  placeholder="Enter your registered email"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Can't access your email?</h4>
            <p className="text-xs text-gray-500">
              Contact the chama admin or treasurer to help you reset your account.
              Call: <span className="font-medium text-gray-700">+254 712 345 678</span>
            </p>
          </div>
        </>
      ) : (
        /* Email Sent Confirmation */
        <div className="text-center animate-slide-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-500 mb-2">We've sent a password reset link to:</p>
          <p className="font-semibold text-gray-900 mb-6 bg-gray-100 rounded-xl px-4 py-2 inline-block">
            {email}
          </p>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6 text-left">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">📬 Check your inbox</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• The link will expire in <strong>1 hour</strong></li>
              <li>• Check your spam/junk folder if you don't see the email</li>
              <li>• Make sure <strong>{email}</strong> is your registered email</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Didn't receive the email?
          </p>

          <button
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
              countdown > 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-secondary'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Resending...
              </span>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Reset Link'
            )}
          </button>
        </div>
      )}
    </AuthLayout>
  );
}