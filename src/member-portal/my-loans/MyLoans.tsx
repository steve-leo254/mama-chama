// src/components/member-portal/my-loans/MyLoans.tsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { type Loan } from '../../types';
import Badge from '../../ui/Badge';
import ProgressBar from '../../ui/ProgressBar';
import Modal from '../../ui/Modal';
import { Plus, HandCoins, Calendar, Users, Target, Clock } from 'lucide-react';

export default function MyLoans() {
  const { currentUser, getMemberLoans, getMemberStats, members, applyLoan } = useApp();
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ amount: '', duration: '3', purpose: '', guarantor1: '', guarantor2: '' });

  if (!currentUser) return null;

  const myLoans: Loan[] = getMemberLoans(currentUser.id);
  const stats = getMemberStats(currentUser.id);
  const maxLoanAmount = stats.totalContributed * 3;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    const dur = Number(form.duration);
    const totalRepayable = amount + (amount * 10 / 100);
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + dur);

    applyLoan({
      memberId: currentUser.id,
      memberName: currentUser.name,
      amount,
      interestRate: 10,
      totalRepayable,
      amountPaid: 0,
      monthlyPayment: Math.ceil(totalRepayable / dur),
      purpose: form.purpose,
      applicationDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending',
      guarantors: [form.guarantor1, form.guarantor2].filter(Boolean),
      duration: dur,
    });
    setForm({ amount: '', duration: '3', purpose: '', guarantor1: '', guarantor2: '' });
    setShowApply(false);
  };

  const statusVariant: Record<Loan['status'], 'warning' | 'info' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'info',
    active: 'success',
    completed: 'success',
    defaulted: 'danger',
    rejected: 'danger',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Loans</h2>
          <p className="text-gray-500 text-sm">View and apply for loans</p>
        </div>
        <button onClick={() => setShowApply(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Apply for Loan
        </button>
      </div>

      {/* Loan Eligibility */}
      <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 border-primary-200 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Your Loan Eligibility</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500">Max Loan Amount</p>
            <p className="text-lg font-bold text-primary-700">KES {maxLoanAmount.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">3x your contributions</p>
          </div>
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-lg font-bold text-rose-700">KES {stats.activeLoanBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500">Available to Borrow</p>
            <p className="text-lg font-bold text-emerald-700">
              KES {Math.max(0, maxLoanAmount - stats.activeLoanBalance).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3">
            <p className="text-xs text-gray-500">Interest Rate</p>
            <p className="text-lg font-bold text-gray-900">10% flat</p>
          </div>
        </div>
      </div>

      {/* Loans List */}
      {myLoans.length === 0 ? (
        <div className="card text-center py-16">
          <HandCoins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No Loans Yet</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">You can apply for a loan up to 3x your contributions</p>
          <button onClick={() => setShowApply(true)} className="btn-primary">Apply Now</button>
        </div>
      ) : (
        <div className="space-y-4">
          {myLoans.map((loan: Loan) => (
            <div key={loan.id} className="card-hover">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg">{loan.purpose}</h3>
                    <Badge variant={statusVariant[loan.status]} size="md">{loan.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Applied: {loan.applicationDate}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Due: {loan.dueDate}</span>
                    <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {loan.duration} months</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Principal</p>
                  <p className="text-sm font-bold">KES {loan.amount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Interest</p>
                  <p className="text-sm font-bold">KES {(loan.totalRepayable - loan.amount).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Total Due</p>
                  <p className="text-sm font-bold">KES {loan.totalRepayable.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-sm font-bold text-emerald-600">KES {loan.amountPaid.toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="text-sm font-bold text-rose-600">KES {(loan.totalRepayable - loan.amountPaid).toLocaleString()}</p>
                </div>
              </div>

              {(loan.status === 'active' || loan.status === 'completed') && (
                <ProgressBar value={loan.amountPaid} max={loan.totalRepayable} color={loan.status === 'completed' ? 'emerald' : 'primary'} />
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5" />
                Guarantors: {loan.guarantors.join(', ')} • Monthly: KES {loan.monthlyPayment.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title="Apply for a Loan" size="lg">
        <form onSubmit={handleApply} className="space-y-4">
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <p className="text-sm text-primary-700">
              You can borrow up to <span className="font-bold">KES {Math.max(0, maxLoanAmount - stats.activeLoanBalance).toLocaleString()}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (KES)</label>
              <input
                type="number" required min="1000"
                max={Math.max(0, maxLoanAmount - stats.activeLoanBalance)}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-field" placeholder="30000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field">
                {[1, 2, 3, 4, 5, 6, 9, 12].map(m => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          {Number(form.amount) > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Loan Preview</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-amber-600">Interest</p><p className="font-bold">KES {(Number(form.amount) * 0.1).toLocaleString()}</p></div>
                <div><p className="text-amber-600">Total Repayable</p><p className="font-bold">KES {(Number(form.amount) * 1.1).toLocaleString()}</p></div>
                <div><p className="text-amber-600">Monthly</p><p className="font-bold">KES {Math.ceil(Number(form.amount) * 1.1 / Number(form.duration)).toLocaleString()}</p></div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
            <textarea required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="input-field min-h-[80px] resize-none" placeholder="Why do you need this loan?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Guarantor 1</label>
              <select required value={form.guarantor1} onChange={(e) => setForm({ ...form, guarantor1: e.target.value })} className="input-field">
                <option value="">Select</option>
                {members.filter(m => m.id !== currentUser.id && m.status === 'active').map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Guarantor 2</label>
              <select value={form.guarantor2} onChange={(e) => setForm({ ...form, guarantor2: e.target.value })} className="input-field">
                <option value="">Select (optional)</option>
                {members.filter(m => m.id !== currentUser.id && m.status === 'active' && m.name !== form.guarantor1).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowApply(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Submit Application</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}