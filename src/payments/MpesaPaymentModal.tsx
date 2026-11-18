// src/components/payments/MpesaPaymentModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import MpesaSTKPush from './MpesaSTKPush';
import MpesaManualPay from './MpesaManualPay';
import MpesaConfirmation from './MpesaConfirmation';
import MpesaReceipt from './MpesaReceipt';
import { Smartphone, FileText } from 'lucide-react';

export type PaymentType = 'contribution' | 'loan_repayment' | 'fine_payment' | 'savings' | 'registration';

export interface PaymentResult {
  transactionId: string;
  receiptNumber: string;
  amount: number;
  phone: string;
  date: string;
  paymentType: PaymentType;
  status: 'completed' | 'failed';
  description: string;
}

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentType: PaymentType;
  description?: string;
  onSuccess: (result: PaymentResult) => void;
  lockedAmount?: boolean;
}

type Step = 'method' | 'stk' | 'manual' | 'confirmation' | 'receipt';

export default function MpesaPaymentModal({
  isOpen,
  onClose,
  amount,
  paymentType,
  description,
  onSuccess,
  lockedAmount = false,
}: MpesaPaymentModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [isProcessing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const handleComplete = (result: PaymentResult) => {
    setPaymentResult(result);
    setStep('confirmation');
  };

  const handleViewReceipt = () => {
    setStep('receipt');
  };

  const handleRetry = () => {
    setStep('method');
    setPaymentResult(null);
  };

  const handleClose = () => {
    setStep('method');
    setPaymentResult(null);
    setProcessing(false);
    onClose();
  };

  const handleSuccess = () => {
    if (paymentResult) {
      onSuccess(paymentResult);
    }
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="M-Pesa Payment" size="md">
      {step === 'method' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">Choose your preferred M-Pesa payment method</p>
          
          <div className="space-y-3">
            <button
              onClick={() => setStep('stk')}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:border-green-400 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">M-Pesa Express (STK Push)</h3>
                <p className="text-xs text-gray-500 mt-1">Automatic prompt on your phone</p>
              </div>
            </button>

            <button
              onClick={() => setStep('manual')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Paybill Number</h3>
                <p className="text-xs text-gray-500">Manual payment via Paybill</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 'stk' && (
        <MpesaSTKPush
          amount={amount}
          paymentType={paymentType}
          description={description}
          lockedAmount={lockedAmount}
          onBack={() => setStep('method')}
          onComplete={handleComplete}
          isProcessing={isProcessing}
          setProcessing={setProcessing}
        />
      )}

      {step === 'manual' && (
        <MpesaManualPay
          amount={amount}
          paymentType={paymentType}
          description={description}
          lockedAmount={lockedAmount}
          onBack={() => setStep('method')}
          onComplete={handleComplete}
        />
      )}

      {step === 'confirmation' && paymentResult && (
        <MpesaConfirmation
          result={paymentResult}
          onClose={handleClose}
          onViewReceipt={handleViewReceipt}
          onRetry={handleRetry}
        />
      )}

      {step === 'receipt' && paymentResult && (
        <MpesaReceipt
          result={paymentResult}
          onClose={handleSuccess}
          onBack={() => setStep('confirmation')}
        />
      )}
    </Modal>
  );
}