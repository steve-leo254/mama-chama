// src/components/payments/MpesaReceipt.tsx
import { ArrowLeft, Download, Share2, Printer } from 'lucide-react';
import type { PaymentResult } from './MpesaPaymentModal';

interface MpesaReceiptProps {
  result: PaymentResult;
  onClose: () => void;
  onBack: () => void;
}

export default function MpesaReceipt({ result, onClose, onBack }: MpesaReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mama Chama Payment Receipt',
        text: `Payment of KES ${result.amount.toLocaleString()} confirmed. Receipt: ${result.receiptNumber}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {/* Receipt Card */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden" id="receipt">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🤝</span>
            <h2 className="text-xl font-bold">Mama Chama</h2>
          </div>
          <p className="text-green-100 text-sm">Payment Receipt</p>
        </div>

        {/* Tear Effect */}
        <div className="relative h-4">
          <div className="absolute inset-x-0 top-0 flex justify-between px-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-surface rounded-full -mt-1.5" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Status */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-sm text-green-600 font-semibold">Payment Successful</p>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Amount Paid</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">
              KES {result.amount.toLocaleString()}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-4 border-t border-dashed border-gray-200 pt-4">
            {[
              { label: 'Receipt Number', value: result.receiptNumber, mono: true, highlight: true },
              { label: 'Transaction ID', value: result.transactionId.slice(0, 16), mono: true },
              { label: 'Phone Number', value: result.phone },
              { label: 'Payment For', value: result.paymentType.replace('_', ' '), capitalize: true },
              { label: 'Description', value: result.description },
              {
                label: 'Date & Time',
                value: new Date(result.date).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                }),
              },
              { label: 'Payment Method', value: 'M-Pesa' },
              { label: 'Status', value: 'Confirmed', highlight: true },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</span>
                <span className={`text-sm text-right max-w-[60%] ${
                  item.highlight ? 'font-bold text-green-600' :
                  item.mono ? 'font-mono font-semibold text-gray-900' :
                  item.capitalize ? 'capitalize font-medium text-gray-900' :
                  'font-medium text-gray-700'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Barcode-like decoration */}
          <div className="mt-6 pt-4 border-t border-dashed border-gray-200 text-center">
            <div className="flex justify-center gap-0.5 mb-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800"
                  style={{
                    width: Math.random() > 0.5 ? '2px' : '1px',
                    height: `${20 + Math.random() * 15}px`,
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-mono">{result.receiptNumber}</p>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-gray-400">
              Thank you for your payment! 🎉
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              This is a digital receipt generated by Mama Chama
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={handlePrint} className="btn-secondary flex flex-col items-center gap-1 py-3 text-xs">
          <Printer className="w-4 h-4" /> Print
        </button>
        <button className="btn-secondary flex flex-col items-center gap-1 py-3 text-xs">
          <Download className="w-4 h-4" /> Save PDF
        </button>
        <button onClick={handleShare} className="btn-secondary flex flex-col items-center gap-1 py-3 text-xs">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      <button onClick={onClose} className="btn-primary w-full">
        Done
      </button>
    </div>
  );
}