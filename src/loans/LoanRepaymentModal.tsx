// src/components/loans/LoanRepaymentModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../context/AppContext';
import { toast } from '../components/ui/Toast';
import { DollarSign } from 'lucide-react';
import type { Loan } from '../types';

interface LoanRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onRepayment: (repayment: any) => Promise<void>;
}

export default function LoanRepaymentModal({ isOpen, onClose, loan, onRepayment }: LoanRepaymentModalProps) {
  const { addLoanRepayment } = useApp();
  const [form, setForm] = useState({
    amount: '',
    method: 'mpesa',
    reference: '',
  });
  const [loading, setLoading] = useState(false);

  const remainingBalance = loan.total_repayable - loan.amount_paid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Validation Error', 'Please enter a valid repayment amount');
      return;
    }

    if (Number(form.amount) > remainingBalance) {
      toast.error('Validation Error', 'Repayment amount exceeds remaining balance');
      return;
    }

    setLoading(true);
    try {
      const repayment = {
        loan_id: loan.id,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference,
        date: new Date().toISOString().split('T')[0],
        member_id: loan.member_id,
      };

      await onRepayment(repayment);
      
      toast.success(
        'Repayment Recorded', 
        `KES ${form.amount} has been recorded for ${loan.member_name}'s loan`
      );
      
      setForm({ amount: '', method: 'mpesa', reference: '' });
      onClose();
    } catch (err) {
      toast.error('Error', 'Failed to record repayment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Loan Repayment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Loan Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Loan Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Original Amount</p>
              <p className="font-bold text-gray-900">KES {loan.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Repayable</p>
              <p className="font-bold text-gray-900">KES {loan.total_repayable.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Amount Paid</p>
              <p className="font-bold text-green-600">KES {loan.amount_paid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Remaining Balance</p>
              <p className="font-bold text-orange-600">KES {remainingBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Repayment Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Repayment Amount (KES)</label>
            <input
              type="number"
              required
              min="1"
              max={remainingBalance}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="input-field"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference Number (Optional)</label>
          <input
            type="text"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            className="input-field"
            placeholder="Transaction reference"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <DollarSign className="w-4 h-4" />
            )}
            {loading ? 'Recording...' : 'Record Repayment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
