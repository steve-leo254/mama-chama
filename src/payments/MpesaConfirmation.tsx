// src/components/payments/MpesaConfirmation.tsx
import { CheckCircle, XCircle, Receipt, RefreshCw, X } from 'lucide-react';
import type { PaymentResult } from './MpesaPaymentModal';

interface MpesaConfirmationProps {
  result: PaymentResult;
  onClose: () => void;
  onViewReceipt: () => void;
  onRetry: () => void;
}

export default function MpesaConfirmation({ result, onClose, onViewReceipt, onRetry }: MpesaConfirmationProps) {
  const isSuccess = result.status === 'completed';

  return (
    <div className="text-center py-4 animate-slide-up">
      {/* Status Icon */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        {isSuccess ? (
          <>
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </>
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center shadow-xl shadow-rose-500/30">
            <XCircle className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
      </h2>
      <p className="text-gray-500 mb-6">
        {isSuccess
          ? 'Your M-Pesa payment has been received and confirmed.'
          : result.description || 'The payment could not be completed. Please try again.'}
      </p>

      {/* Transaction Details */}
      <div className={`rounded-2xl p-6 mb-6 text-left ${
        isSuccess ? 'bg-green-50 border border-green-200' : 'bg-rose-50 border border-rose-200'
      }`}>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-lg font-bold text-gray-900">KES {result.amount.toLocaleString()}</span>
          </div>
          {result.receiptNumber && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Receipt No.</span>
              <span className="text-sm font-bold font-mono text-green-600">{result.receiptNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Phone</span>
            <span className="text-sm font-medium text-gray-900">{result.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Payment For</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {result.paymentType.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(result.date).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`text-sm font-bold ${isSuccess ? 'text-green-600' : 'text-rose-600'}`}>
              {isSuccess ? '✅ Confirmed' : '❌ Failed'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {isSuccess ? (
          <>
            <button onClick={onViewReceipt} className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <Receipt className="w-5 h-5" /> View Receipt
            </button>
            <button onClick={onClose} className="btn-secondary w-full">
              Done
            </button>
          </>
        ) : (
          <>
            <button onClick={onRetry} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" /> Try Again
            </button>
            <button onClick={onClose} className="btn-secondary w-full">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}