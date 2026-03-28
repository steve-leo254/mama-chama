// src/components/payments/MpesaSTKPush.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, Loader2, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PaymentResult } from './MpesaPaymentModal';
import type { PaymentType } from './MpesaPaymentModal';

interface MpesaSTKPushProps {
  amount: number;
  paymentType: PaymentType;
  description?: string;
  loanId?: string;
  lockedAmount: boolean;
  onBack: () => void;
  onComplete: (result: PaymentResult) => void;
  isProcessing: boolean;
  setProcessing: (p: boolean) => void;
}

export default function MpesaSTKPush({
  amount: initialAmount,
  paymentType,
  description,
  loanId,
  lockedAmount,
  onBack,
  onComplete,
  isProcessing,
  setProcessing,
}: MpesaSTKPushProps) {
  const { currentUser } = useApp();
  const [phone, setPhone] = useState(currentUser?.phone?.replace(/\s/g, '') || '');
  const [amount, setAmount] = useState(initialAmount || 5000);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [dots, setDots] = useState('');

  // Animated dots
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Processing simulation
  useEffect(() => {
    if (!isProcessing) return;
    
    const messages = [
      'Connecting to Safaricom',
      'Sending STK Push to your phone',
      'Waiting for you to enter PIN',
      'Processing your payment',
    ];
    
    let step = 0;
    setStatusText(messages[0]);
    setCountdown(30);
    
    const msgInterval = setInterval(() => {
      step++;
      if (step < messages.length) {
        setStatusText(messages[step]);
      }
    }, 5000);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Simulate success
          const receipt = `QK${Math.random().toString().slice(2, 9)}R`;
          onComplete({
            transactionId: `mpesa-${Date.now()}`,
            receiptNumber: receipt,
            amount,
            phone,
            date: new Date().toISOString(),
            paymentType,
            status: 'completed',
            description: description || `${paymentType.replace('_', ' ')} payment`,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(msgInterval);
      clearInterval(countdownInterval);
    };
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanPhone = phone.replace(/\s/g, '').replace(/-/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (amount < 10) {
      setError('Minimum amount is KES 10');
      return;
    }
    
    setProcessing(true);
  };

  const handleCancel = () => {
    setProcessing(false);
    onComplete({
      transactionId: `mpesa-${Date.now()}`,
      receiptNumber: '',
      amount,
      phone,
      date: new Date().toISOString(),
      paymentType,
      status: 'failed',
      description: 'Payment cancelled by user',
    });
  };

  // Processing State
  if (isProcessing) {
    return (
      <div className="text-center py-8 space-y-6 animate-fade-in">
        {/* Phone Animation */}
        <div className="relative w-28 h-28 mx-auto">
          <div className="absolute inset-0 bg-green-100 rounded-3xl animate-ping opacity-20" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/30">
            <Smartphone className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
            <span className="text-sm">📳</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">Check Your Phone</h3>
          <p className="text-gray-500 text-sm mt-1">
            An M-Pesa prompt has been sent to
          </p>
          <p className="font-mono font-bold text-green-600 text-lg mt-1">{phone}</p>
        </div>

        {/* Status */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">{statusText}{dots}</span>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Time remaining: <span className="font-bold">{countdown}s</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((30 - countdown) / 30) * 100}%` }}
          />
        </div>

        {/* Amount */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500">Amount</p>
          <p className="text-2xl font-bold text-gray-900">KES {amount.toLocaleString()}</p>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-left">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">📱 On your phone:</h4>
          <ol className="text-xs text-amber-700 space-y-1">
            <li>1. You'll see an M-Pesa payment prompt</li>
            <li>2. Confirm the amount: <strong>KES {amount.toLocaleString()}</strong></li>
            <li>3. Enter your <strong>M-Pesa PIN</strong></li>
            <li>4. Wait for confirmation</li>
          </ol>
        </div>

        <button onClick={handleCancel} className="btn-secondary w-full">
          Cancel Payment
        </button>
      </div>
    );
  }

  // Input Form
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Choose different method
      </button>

      {/* M-Pesa Express Header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">M-Pesa Express</h3>
          <p className="text-xs text-gray-500">STK Push • Automatic prompt on your phone</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm flex items-center gap-2 animate-slide-up">
          <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">M-Pesa Phone Number</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500">
              <span className="text-lg">🇰🇪</span>
              <span className="text-sm font-medium">+254</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              className="input-field pl-24"
              placeholder="712 345 678"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">The M-Pesa prompt will be sent to this number</p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (KES)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">KES</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input-field pl-16 text-2xl font-bold"
              min={10}
              disabled={lockedAmount}
              placeholder="5,000"
            />
          </div>
          {paymentType === 'contribution' && !lockedAmount && (
            <div className="flex gap-2 mt-2">
              {[1000, 2000, 5000, 10000].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    amount === a
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment for</span>
            <span className="font-medium text-gray-900 capitalize">
              {paymentType.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-900 font-mono">{phone || '—'}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-700 font-semibold">Total</span>
            <span className="font-bold text-green-600 text-lg">KES {amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Smartphone className="w-6 h-6" />
          Pay KES {amount.toLocaleString()} via M-Pesa
        </button>
      </form>
    </div>
  );
}