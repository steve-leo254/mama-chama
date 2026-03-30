// src/components/member-portal/transactions/DepositModal.tsx
import { useState } from 'react';
import Modal from '../../ui/Modal';
import MpesaPaymentModal, { type PaymentType } from '../../payments/MpesaPaymentModal';
import { useApp } from '../../context/AppContext';
import { Smartphone, CreditCard, Banknote, ArrowRight } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { currentUser, addDeposit, refreshData } = useApp();
  const [showMpesa, setShowMpesa] = useState(false);
  const [selectedType, setSelectedType] = useState<PaymentType>('contribution');
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [fineReason, setFineReason] = useState('');
  const [step, setStep] = useState<'type' | 'method'>('type');

  const depositTypes = [
    { value: 'contribution' as PaymentType, label: 'Monthly Contribution', desc: 'Regular monthly savings', amount: 5000, emoji: '💰', color: 'from-emerald-50 to-emerald-100 border-emerald-200' },
    { value: 'loan_repayment' as PaymentType, label: 'Loan Repayment', desc: 'Pay towards your loan', amount: 0, emoji: '🏦', color: 'from-amber-50 to-amber-100 border-amber-200' },
    { value: 'fine_payment' as PaymentType, label: 'Fine Payment', desc: 'Pay outstanding fines', amount: 0, emoji: '⚠️', color: 'from-rose-50 to-rose-100 border-rose-200' },
    { value: 'savings' as PaymentType, label: 'Extra Savings', desc: 'Additional savings deposit', amount: 0, emoji: '🐷', color: 'from-purple-50 to-purple-100 border-purple-200' },
  ];

  const handleSelectType = (type: PaymentType, defaultAmount: number) => {
    setSelectedType(type);
    setSelectedAmount(defaultAmount || 5000);
    setStep('method');
  };

  const handleMpesaSuccess = async (result: any) => {
    if (currentUser) {
      await addDeposit({
        memberId: currentUser.id,
        memberName: currentUser.name,
        amount: result.amount,
        date: new Date().toISOString().split('T')[0],
        type: selectedType,
        method: 'mpesa',
        reference: result.receiptNumber,
        status: 'completed',
        description: selectedType === 'fine_payment' && fineReason 
          ? `M-Pesa fine payment - ${fineReason} - ${result.receiptNumber}`
          : `M-Pesa ${selectedType.replace('_', ' ')} - ${result.receiptNumber}`,
      });
      await refreshData();
    }
    setShowMpesa(false);
    handleClose();
  };

  const handleBankDeposit = () => {
    if (currentUser) {
      addDeposit({
        memberId: currentUser.id,
        memberName: currentUser.name,
        amount: selectedAmount,
        date: new Date().toISOString().split('T')[0],
        type: selectedType,
        method: 'bank',
        reference: `BNK${Date.now().toString().slice(-8)}`,
        status: 'pending',
        description: selectedType === 'fine_payment' && fineReason
          ? `Bank fine payment - ${fineReason}`
          : `Bank ${selectedType.replace('_', ' ')}`,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setStep('type');
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !showMpesa} onClose={handleClose} title="Make a Deposit" size="md">
        {step === 'type' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">What are you depositing for?</p>
            <div className="space-y-3">
              {depositTypes.map((dt) => (
                <button
                  key={dt.value}
                  onClick={() => handleSelectType(dt.value, dt.amount)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 bg-gradient-to-r ${dt.color} hover:shadow-md transition-all text-left group`}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{dt.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{dt.label}</h3>
                    <p className="text-xs text-gray-500">{dt.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'method' && (
          <div className="space-y-5">
            <button onClick={() => setStep('type')} className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to deposit type
            </button>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Deposit For</p>
              <p className="font-bold text-gray-900 capitalize mt-1">{selectedType.replace('_', ' ')}</p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (KES)</label>
              <input
                type="number"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="input-field text-center text-2xl font-bold"
                min={100}
                placeholder="5,000"
              />
              {selectedType === 'contribution' && (
                <p className="text-xs text-gray-400 mt-1 text-center">💡 Monthly contribution is KES 5,000</p>
              )}
            </div>

            {/* Fine Reason - Only show for fine payments */}
            {selectedType === 'fine_payment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fine Reason</label>
                <textarea
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="e.g., Late payment of monthly contribution, Absence from meeting, etc."
                />
                <p className="text-xs text-gray-400 mt-1">💡 Please specify the reason for this fine</p>
              </div>
            )}

            {/* Payment Method */}
            <p className="text-sm font-medium text-gray-700">Choose payment method</p>
            <div className="space-y-3">
              {/* M-Pesa - Primary */}
              <button
                onClick={() => setShowMpesa(true)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/10 transition-all text-left group"
              >
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Pay with M-Pesa</h3>
                    <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">STK Push or Paybill payment</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Bank Transfer */}
              <button
                onClick={handleBankDeposit}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Bank Transfer</h3>
                  <p className="text-xs text-gray-500">Requires admin confirmation</p>
                </div>
              </button>

              {/* Cash */}
              <button
                onClick={() => {
                  if (currentUser) {
                    addDeposit({
                      memberId: currentUser.id,
                      memberName: currentUser.name,
                      amount: selectedAmount,
                      date: new Date().toISOString().split('T')[0],
                      type: selectedType,
                      method: 'cash',
                      reference: `CSH${Date.now().toString().slice(-8)}`,
                      status: 'pending',
                      description: selectedType === 'fine_payment' && fineReason
                        ? `Cash fine payment - ${fineReason}`
                        : `Cash ${selectedType.replace('_', ' ')}`,
                    });
                  }
                  handleClose();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Cash Payment</h3>
                  <p className="text-xs text-gray-500">Pay during meeting • Needs confirmation</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* M-Pesa Modal */}
      <MpesaPaymentModal
        isOpen={showMpesa}
        onClose={() => setShowMpesa(false)}
        amount={selectedAmount}
        paymentType={selectedType}
        description={`${selectedType.replace('_', ' ')} deposit`}
        onSuccess={handleMpesaSuccess}
        lockedAmount={selectedType === 'contribution'}
      />
    </>
  );
}