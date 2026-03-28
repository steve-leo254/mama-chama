// src/components/payments/MpesaPaymentModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import MpesaSTKPush from './MpesaSTKPush';
import MpesaManualPay from './MpesaManualPay';
import MpesaConfirmation from './MpesaConfirmation';
import MpesaReceipt from './MpesaReceipt';
import { Smartphone, FileText, ArrowLeft } from 'lucide-react';

export type PaymentType = 'contribution' | 'loan_repayment' | 'fine_payment' | 'savings' | 'registration_fee';
export type MpesaFlow = 'select' | 'stk_push' | 'manual' | 'processing' | 'success' | 'failed' | 'receipt';

export interface PaymentResult {
  transactionId: string;
  receiptNumber: string;
  amount: number;
  phone: string;
  date: string;
  paymentType: string;
  status: 'completed' | 'failed';
  description: string;
}

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  paymentType?: PaymentType;
  description?: string;
  loanId?: string;
  onSuccess?: (result: PaymentResult) => void;
  lockedAmount?: boolean;
}

export default function MpesaPaymentModal({
  isOpen,
  onClose,
  amount: initialAmount,
  paymentType = 'contribution',
  description,
  loanId,
  onSuccess,
  lockedAmount = false,
}: MpesaPaymentModalProps) {
  const [flow, setFlow] = useState<MpesaFlow>('select');
  const [amount, setAmount] = useState(initialAmount || 0);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const handleClose = () => {
    setFlow('select');
    setResult(null);
    onClose();
  };

  const handlePaymentComplete = (paymentResult: PaymentResult) => {
    setResult(paymentResult);
    if (paymentResult.status === 'completed') {
      setFlow('success');
      onSuccess?.(paymentResult);
    } else {
      setFlow('failed');
    }
  };

  const getTitle = () => {
    switch (flow) {
      case 'select': return 'M-Pesa Payment';
      case 'stk_push': return 'M-Pesa Express';
      case 'manual': return 'Paybill Payment';
      case 'processing': return 'Processing Payment';
      case 'success': return 'Payment Successful';
      case 'failed': return 'Payment Failed';
      case 'receipt': return 'Payment Receipt';
      default: return 'M-Pesa Payment';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} size={flow === 'receipt' ? 'md' : 'md'}>
      {/* Method Selection */}
      {flow === 'select' && (
        <div className="space-y-6">
          {/* M-Pesa Logo Area */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <span className="text-4xl">📱</span>
            </div>
            <p className="text-gray-500 text-sm">Choose how you want to pay</p>
          </div>

          {/* Amount Display */}
          {initialAmount && initialAmount > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Amount to Pay</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                KES {initialAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1 capitalize">
                {paymentType.replace('_', ' ')} {description ? `• ${description}` : ''}
              </p>
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* STK Push - Recommended */}
            <button
              onClick={() => setFlow('stk_push')}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 text-left group"
            >
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">M-Pesa Express (STK Push)</h3>
                  <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Get a payment prompt directly on your phone. Quick, easy, and automatic.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                  <span>⚡ Instant</span>
                  <span>🔒 Secure</span>
                  <span>✨ Auto-confirm</span>
                </div>
              </div>
            </button>

            {/* Manual Paybill */}
            <button
              onClick={() => setFlow('manual')}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300 text-left group"
            >
              <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Pay via Paybill</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Already paid? Enter your M-Pesa receipt number to confirm.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>📋 Manual entry</span>
                  <span>🧾 Receipt required</span>
                </div>
              </div>
            </button>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-lg">🔐</span>
            <p className="text-xs text-blue-700">
              All M-Pesa transactions are encrypted and processed securely through Safaricom's M-Pesa API.
              Your PIN is never stored or transmitted by Mama Chama.
            </p>
          </div>
        </div>
      )}

      {/* STK Push Flow */}
      {(flow === 'stk_push' || flow === 'processing') && (
        <MpesaSTKPush
          amount={initialAmount || amount}
          paymentType={paymentType}
          description={description}
          loanId={loanId}
          lockedAmount={lockedAmount}
          onBack={() => setFlow('select')}
          onComplete={handlePaymentComplete}
          isProcessing={flow === 'processing'}
          setProcessing={(p) => setFlow(p ? 'processing' : 'stk_push')}
        />
      )}

      {/* Manual Pay Flow */}
      {flow === 'manual' && (
        <MpesaManualPay
          amount={initialAmount || amount}
          paymentType={paymentType}
          description={description}
          lockedAmount={lockedAmount}
          onBack={() => setFlow('select')}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Success / Failed */}
      {(flow === 'success' || flow === 'failed') && result && (
        <MpesaConfirmation
          result={result}
          onClose={handleClose}
          onViewReceipt={() => setFlow('receipt')}
          onRetry={() => setFlow('select')}
        />
      )}

      {/* Receipt */}
      {flow === 'receipt' && result && (
        <MpesaReceipt
          result={result}
          onClose={handleClose}
          onBack={() => setFlow('success')}
        />
      )}
    </Modal>
  );
}