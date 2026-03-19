// src/components/auth/VerifyEmailPage.tsx
import { useState, useEffect } from 'react';
import { Mail, Loader2, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import AuthLayout from './AuthLayout.tsx';

interface VerifyEmailPageProps {
  email: string;
  onVerified: () => void;
  onResend: () => void;
}

export default function VerifyEmailPage({ email, onVerified, onResend }: VerifyEmailPageProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every(c => c) && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      const newCode = paste.split('');
      setCode(newCode);
      handleVerify(paste);
    }
  };

  const handleVerify = async (fullCode: string) => {
    setLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Demo: accept any 6-digit code
      if (fullCode.length === 6) {
        setVerified(true);
        setTimeout(onVerified, 2000);
      } else {
        setError('Invalid verification code');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    setCode(['', '', '', '', '', '']);
    onResend();
  };

  if (verified) {
    return (
      <AuthLayout heroTitle="Verified!" heroSubtitle="Your email has been verified." heroEmoji="✅">
        <div className="text-center animate-slide-up">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-500 mb-4">Your account is now fully activated.</p>
          <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to dashboard...
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heroTitle="Email Verification"
      heroSubtitle="One last step to secure your account."
      heroEmoji="📧"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-500 mb-2">We sent a 6-digit code to:</p>
        <p className="font-semibold text-gray-900 mb-8 bg-gray-100 rounded-xl px-4 py-2 inline-block">
          {email}
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 mb-6 text-sm animate-slide-up">
            ⚠️ {error}
          </div>
        )}

        {/* Code Input */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              id={`code-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                digit
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : error
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
              } disabled:opacity-50`}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Verifying...</span>
          </div>
        )}

        {/* Resend */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              countdown > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary-600 hover:text-primary-700 hover:underline'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${countdown > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>

        {/* Demo Helper */}
        <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-700 mb-2">🔧 Demo Mode</p>
          <button
            onClick={() => {
              setCode(['1', '2', '3', '4', '5', '6']);
              setTimeout(() => handleVerify('123456'), 500);
            }}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 mx-auto"
          >
            Auto-fill & verify <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}