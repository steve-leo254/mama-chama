// src/components/member-portal/transactions/DepositModal.tsx
import { useState } from 'react';
import Modal from '../../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Smartphone, CreditCard, Banknote } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { currentUser, addDeposit } = useApp();
  const [form, setForm] = useState({
    amount: '',
    type: 'contribution' as 'contribution' | 'loan_repayment' | 'fine_payment' | 'savings',
    method: 'mpesa' as 'mpesa' | 'bank' | 'cash',
    reference: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addDeposit({
      memberId: currentUser.id,
      memberName: currentUser.name,
      amount: Number(form.amount),
      date: new Date().toISOString().split('T')[0],
      type: form.type,
      method: form.method,
      reference: form.reference || `MP${Date.now().toString().slice(-8)}`,
      status: 'pending',
      description: form.description || `${form.type.replace('_', ' ')} deposit`,
    });
    setForm({ amount: '', type: 'contribution', method: 'mpesa', reference: '', description: '' });
    onClose();
  };

  const depositTypes = [
    { value: 'contribution', label: 'Monthly Contribution', desc: 'Regular monthly savings' },
    { value: 'loan_repayment', label: 'Loan Repayment', desc: 'Pay towards your loan' },
    { value: 'fine_payment', label: 'Fine Payment', desc: 'Pay outstanding fines' },
    { value: 'savings', label: 'Extra Savings', desc: 'Additional savings deposit' },
  ];

  const methods = [
    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { value: 'bank', label: 'Bank Transfer', icon: CreditCard, color: 'bg-primary-50 border-primary-200 text-primary-700' },
    { value: 'cash', label: 'Cash', icon: Banknote, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make a Deposit" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Deposit Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What are you depositing for?</label>
          <div className="grid grid-cols-2 gap-2">
            {depositTypes.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => setForm({ ...form, type: dt.value as any })}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  form.type === dt.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <p className={`text-sm font-medium ${form.type === dt.value ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {dt.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{dt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (KES)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">KES</span>
            <input
              type="number"
              required
              min="100"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field pl-14 text-lg font-semibold"
              placeholder="5,000"
            />
          </div>
          {form.type === 'contribution' && (
            <p className="text-xs text-gray-500 mt-1">💡 Monthly contribution is KES 5,000</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-3">
            {methods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setForm({ ...form, method: m.value as any })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  form.method === m.value ? m.color : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <m.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* M-Pesa Instructions */}
        {form.method === 'mpesa' && (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">📱 M-Pesa Payment Instructions</h4>
            <ol className="text-xs text-emerald-700 space-y-1">
              <li>1. Go to M-Pesa → Lipa na M-Pesa</li>
              <li>2. Select Pay Bill</li>
              <li>3. Business No: <span className="font-bold">123456</span></li>
              <li>4. Account: <span className="font-bold">{currentUser?.nationalId}</span></li>
              <li>5. Amount: KES {form.amount || '0'}</li>
              <li>6. Enter your M-Pesa PIN</li>
            </ol>
          </div>
        )}

        {/* Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">M-Pesa/Bank Reference</label>
          <input
            type="text"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })}
            className="input-field"
            placeholder="e.g. QWE1234ABC"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
            placeholder="e.g. December contribution"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-success flex-1">
            Submit Deposit
          </button>
        </div>
      </form>
    </Modal>
  );
}