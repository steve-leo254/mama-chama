// src/components/loans/LoansList.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import LoanCard from './LoanCard';
import LoanApplication from './LoanApplication';
import { Plus, HandCoins } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

import type { Loan } from '../types';

export default function LoansList() {
  const { loans, approveLoan, rejectLoan } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const filtered: Loan[] = loans.filter((l: Loan) => filter === 'all' || l.status === filter);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loans</h2>
          <p className="text-gray-500 text-sm">Manage loan applications & repayments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Apply for Loan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <p className="text-sm text-amber-700">Pending Applications</p>
          <p className="text-2xl font-bold text-amber-900">{loans.filter((l: Loan) => l.status === 'pending').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200">
          <p className="text-sm text-primary-700">Active Loans</p>
          <p className="text-2xl font-bold text-primary-900">{loans.filter((l: Loan) => l.status === 'active').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <p className="text-sm text-emerald-700">Total Outstanding</p>
          <p className="text-2xl font-bold text-emerald-900">
            KES {loans.filter((l: Loan) => l.status === 'active').reduce((sum: number, l: Loan) => sum + l.totalRepayable - l.amountPaid, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'pending', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="No loans found"
          description="No loans match the current filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((loan: Loan, idx: number) => (
            <div key={loan.id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <LoanCard loan={loan} onApprove={approveLoan} onReject={rejectLoan} />
            </div>
          ))}
        </div>
      )}

      <LoanApplication isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}