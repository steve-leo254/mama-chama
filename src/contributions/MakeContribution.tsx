// src/components/contributions/MakeContribution.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../context/AppContext.tsx';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';

interface MakeContributionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MakeContribution({ isOpen, onClose }: MakeContributionProps) {
  const { members, addContribution } = useApp();
  const [form, setForm] = useState({
    memberId: '',
    amount: '',
    type: 'monthly' as 'monthly' | 'special' | 'penalty' | 'merry_go_round',
    method: 'mpesa' as 'mpesa' | 'bank' | 'cash',
    reference: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find((m: any) => m.id === form.memberId);
    if (!member) return;

    const contributionData = {
      member_id: form.memberId,
      amount: Number(form.amount),
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' }),
      type: form.type,
      status: 'completed',
      method: form.method,
      reference: form.reference || `AUTO${Date.now()}`,
    };

    console.log('DEBUG: Sending contribution data:', contributionData);
    addContribution(contributionData);
    setForm({ memberId: '', amount: '', type: 'monthly', method: 'mpesa', reference: '' });
    onClose();
  };

  const methods = [
    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { value: 'bank', label: 'Bank', icon: CreditCard, color: 'bg-primary-50 border-primary-200 text-primary-700' },
    { value: 'cash', label: 'Cash', icon: Banknote, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Contribution" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Member</label>
          <select
            required
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
            className="input-field"
          >
            <option value="">Select member</option>
            {members.filter((m: any) => m.status === 'active').map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (KES)</label>
          <input
            type="number"
            required
            min="1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="input-field"
            placeholder="5000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
            className="input-field"
          >
            <option value="monthly">Monthly</option>
            <option value="special">Special</option>
            <option value="penalty">Penalty</option>
            <option value="merry_go_round">Merry-Go-Round</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference / Transaction ID</label>
          <input
            type="text"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            className="input-field"
            placeholder="e.g. QWE123456"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-success flex-1">Record Payment</button>
        </div>
      </form>
    </Modal>
  );
}