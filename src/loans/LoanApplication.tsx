// src/components/loans/LoanApplication.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../context/AppContext';

interface LoanApplicationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanApplication({ isOpen, onClose }: LoanApplicationProps) {
  const { members, applyLoan } = useApp();
  const [form, setForm] = useState({
    memberId: '',
    amount: '',
    duration: '3',
    purpose: '',
    guarantor1: '',
    guarantor2: '',
  });

  const interestRate = 10;
  const amount = Number(form.amount) || 0;
  const totalRepayable = amount + (amount * interestRate / 100);
  const monthlyPayment = form.duration ? Math.ceil(totalRepayable / Number(form.duration)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === form.memberId);
    if (!member) return;

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + Number(form.duration));

    applyLoan({
      memberId: form.memberId,
      memberName: member.name,
      amount,
      interestRate,
      totalRepayable,
      amountPaid: 0,
      monthlyPayment,
      purpose: form.purpose,
      applicationDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending',
      guarantors: [form.guarantor1, form.guarantor2].filter(Boolean),
      duration: Number(form.duration),
    });
    setForm({ memberId: '', amount: '', duration: '3', purpose: '', guarantor1: '', guarantor2: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Loan Application" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Applicant</label>
          <select
            required
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
            className="input-field"
          >
            <option value="">Select member</option>
            {members.filter(m => m.status === 'active').map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Amount (KES)</label>
            <input
              type="number"
              required
              min="1000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (Months)</label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="input-field"
            >
              {[1, 2, 3, 4, 5, 6, 9, 12].map(m => (
                <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loan Summary */}
        {amount > 0 && (
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <h4 className="text-sm font-semibold text-primary-900 mb-2">Loan Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-primary-600">Interest Rate</p>
                <p className="font-bold text-primary-900">{interestRate}%</p>
              </div>
              <div>
                <p className="text-primary-600">Total Repayable</p>
                <p className="font-bold text-primary-900">KES {totalRepayable.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-primary-600">Monthly Payment</p>
                <p className="font-bold text-primary-900">KES {monthlyPayment.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
          <textarea
            required
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            className="input-field min-h-[80px] resize-none"
            placeholder="Reason for the loan..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Guarantor 1</label>
            <select
              required
              value={form.guarantor1}
              onChange={(e) => setForm({ ...form, guarantor1: e.target.value })}
              className="input-field"
            >
              <option value="">Select guarantor</option>
              {members.filter(m => m.status === 'active' && m.id !== form.memberId).map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Guarantor 2</label>
            <select
              value={form.guarantor2}
              onChange={(e) => setForm({ ...form, guarantor2: e.target.value })}
              className="input-field"
            >
              <option value="">Select guarantor (optional)</option>
              {members.filter(m => m.status === 'active' && m.id !== form.memberId && m.name !== form.guarantor1).map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Submit Application</button>
        </div>
      </form>
    </Modal>
  );
}