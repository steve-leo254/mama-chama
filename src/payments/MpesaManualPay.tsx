// src/components/payments/MpesaManualPay.tsx
import { useState } from 'react';
import { ArrowLeft, FileText, Copy, Check, Loader2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PaymentResult, PaymentType } from './MpesaPaymentModal';

interface MpesaManualPayProps {
  amount: number;
  paymentType: PaymentType;
  description?: string;
  lockedAmount: boolean;
  onBack: () => void;
  onComplete: (result: PaymentResult) => void;
}

export default function MpesaManualPay({
  amount: initialAmount,
  paymentType,
  description,
  lockedAmount,
  onBack,
  onComplete,
}: MpesaManualPayProps) {
  const { currentUser } = useApp();
  const [step, setStep] = useState<'instructions' | 'confirm'>('instructions');
  const [receipt, setReceipt] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone?.replace(/\s/g, '') || '');
  const [amount, setAmount] = useState(initialAmount || 5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const PAYBILL = '174379';
  const ACCOUNT = `MC-${currentUser?.nationalId || currentUser?.id || ''}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!receipt.trim()) {
      setError('Please enter the M-Pesa receipt number');
      return;
    }
    if (receipt.length < 8) {
      setError('Receipt number must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onComplete({
        transactionId: `mpesa-manual-${Date.now()}`,
        receiptNumber: receipt.toUpperCase(),
        amount,
        phone,
        date: new Date().toISOString(),
        paymentType,
        status: 'completed',
        description: description || `Manual ${paymentType.replace('_', ' ')} payment`,
      });
    } catch {
      setError('Failed to verify receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
      title="Copy"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Choose different method
      </button>

      {step === 'instructions' && (
        <>
          {/* Paybill Info Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📱</span>
                <span className="text-green-400 font-bold">M-Pesa Paybill</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                  <div>
                    <p className="text-xs text-gray-400">Business Number</p>
                    <p className="text-2xl font-bold font-mono tracking-wider">{PAYBILL}</p>
                  </div>
                  <CopyButton text={PAYBILL} field="paybill" />
                </div>

                <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                  <div>
                    <p className="text-xs text-gray-400">Account Number</p>
                    <p className="text-lg font-bold font-mono">{ACCOUNT}</p>
                  </div>
                  <CopyButton text={ACCOUNT} field="account" />
                </div>

                <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                  <div>
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="text-lg font-bold">KES {amount.toLocaleString()}</p>
                  </div>
                  <CopyButton text={amount.toString()} field="amount" />
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h4 className="font-bold text-green-800 mb-3">📋 How to Pay via Paybill</h4>
            <ol className="space-y-3">
              {[
                'Open M-Pesa on your phone',
                'Select "Lipa na M-Pesa"',
                'Select "Pay Bill"',
                <>Enter Business Number: <span className="font-bold font-mono bg-white px-2 py-0.5 rounded">{PAYBILL}</span></>,
                <>Enter Account Number: <span className="font-bold font-mono bg-white px-2 py-0.5 rounded">{ACCOUNT}</span></>,
                <>Enter Amount: <span className="font-bold">KES {amount.toLocaleString()}</span></>,
                'Enter your M-Pesa PIN',
                'Confirm the transaction',
              ].map((instruction, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-green-800 pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={() => setStep('confirm')}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
          >
            I've Made the Payment →
          </button>

          <p className="text-center text-xs text-gray-400">
            After paying, you'll enter your M-Pesa receipt number to confirm
          </p>
        </>
      )}

      {step === 'confirm' && (
        <>
          <div className="text-center mb-2">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">Confirm Your Payment</h3>
            <p className="text-sm text-gray-500 mt-1">Enter the M-Pesa receipt number from your SMS</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm flex items-center gap-2 animate-slide-up">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                M-Pesa Receipt Number *
              </label>
              <input
                type="text"
                value={receipt}
                onChange={(e) => { setReceipt(e.target.value.toUpperCase()); setError(''); }}
                className="input-field text-center text-xl font-mono font-bold tracking-widest uppercase"
                placeholder="QK1234567R"
                maxLength={15}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                Found in the M-Pesa confirmation SMS (e.g., QK1234567R)
              </p>
            </div>

            {/* SMS Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">📩 Your SMS looks like this:</p>
              <div className="bg-white rounded-lg p-3 border border-gray-100 text-xs text-gray-600 font-mono leading-relaxed">
                <span className="font-bold text-green-600">{receipt || 'QK1234567R'}</span> Confirmed.
                Ksh{amount.toLocaleString()}.00 sent to Mama Chama for account {ACCOUNT}
                on {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.
                New M-PESA balance is Ksh***
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number Used</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+254 712 345 678"
              />
            </div>

            {!lockedAmount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount Paid (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="input-field"
                  min={10}
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('instructions')} className="btn-secondary flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              <button
                type="submit"
                disabled={loading || !receipt.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}