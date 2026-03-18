// src/components/member-portal/transactions/WithdrawRequestModal.tsx
import { useState } from 'react';
import Modal from '../../ui/Modal';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Smartphone, CreditCard } from 'lucide-react';

interface WithdrawRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawRequestModal({ isOpen, onClose }: WithdrawRequestModalProps) {
  const { currentUser, addWithdrawRequest, getMemberStats } = useApp();
  const [form, setForm] = useState({
    amount: '',
    reason: '',
    method: 'mpesa' as 'mpesa' | 'bank',
    accountDetails: '',
  });

  if (!currentUser) return null;

  const memberStats = getMemberStats(currentUser.id);
  const maxWithdrawal = memberStats.savingsBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.amount) > maxWithdrawal) return;

    addWithdrawRequest({
      memberId: currentUser.id,
      memberName: currentUser.name,
      amount: Number(form.amount),
      reason: form.reason,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      method: form.method,
      accountDetails: form.accountDetails || currentUser.phone,
    });
    setForm({ amount: '', reason: '', method: 'mpesa', accountDetails: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Withdrawal" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Balance Info */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available Balance</span>
            <span className="text-lg font-bold text-gray-900">KES {maxWithdrawal.toLocaleString()}</span>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Withdrawal Amount (KES)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">KES</span>
            <input
              type="number"
              required
              min="500"
              max={maxWithdrawal}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field pl-14 text-lg font-semibold"
              placeholder="10,000"
            />
          </div>
          {Number(form.amount) > maxWithdrawal && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Exceeds available balance
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Withdrawal</label>
          <textarea
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="input-field min-h-[80px] resize-none"
            placeholder="Please explain why you need this withdrawal..."
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Receive via</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, method: 'mpesa' })}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                form.method === 'mpesa'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">M-Pesa</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, method: 'bank' })}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                form.method === 'bank'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Bank Transfer</span>
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {form.method === 'mpesa' ? 'M-Pesa Number' : 'Bank Account Number'}
          </label>
          <input
            type="text"
            required
            value={form.accountDetails}
            onChange={(e) => setForm({ ...form, accountDetails: e.target.value })}
            className="input-field"
            placeholder={form.method === 'mpesa' ? '+254 7XX XXX XXX' : 'Account number'}
          />
        </div>

        {/* Warning */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Withdrawal Policy</p>
              <p className="text-xs text-amber-700 mt-1">
                Withdrawal requests require approval from the treasurer and chairperson.
                Processing takes 1-3 business days. Early withdrawal penalties may apply.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            type="submit"
            disabled={Number(form.amount) > maxWithdrawal || Number(form.amount) <= 0}
            className="btn-primary flex-1"
          >
            Submit Request
          </button>
        </div>
      </form>
    </Modal>
  );
}