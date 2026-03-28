// src/components/loans/LoansList.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import LoanCard from './LoanCard';
import LoanApplication from './LoanApplication';
import LoanRepaymentModal from './LoanRepaymentModal.tsx';
import { Plus, HandCoins, TrendingUp, DollarSign, FileText } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';
import type { Loan } from '../types';

export default function LoansList() {
  const { loans, approveLoan, rejectLoan, addLoanRepayment } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [showStats, setShowStats] = useState(true);

  const filtered: Loan[] = loans.filter((l: Loan) => filter === 'all' || l.status === filter);

  const stats = {
    pending: loans.filter(l => l.status === 'pending'),
    active: loans.filter(l => l.status === 'active'),
    completed: loans.filter(l => l.status === 'completed'),
    totalOutstanding: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.total_repayable - l.amount_paid), 0),
    totalDisbursed: loans.reduce((sum, l) => sum + l.amount, 0),
    totalRepaid: loans.reduce((sum, l) => sum + l.amount_paid, 0)
  };

  const handleRepayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowRepaymentModal(true);
  };

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

      {/* Enhanced Summary Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Loan Overview</h3>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
        
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-amber-700">Pending Applications</p>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-900">{stats.pending.length}</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-primary-700">Active Loans</p>
                <TrendingUp className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-primary-900">{stats.active.length}</p>
            </div>
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-emerald-700">Total Outstanding</p>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900">KES {stats.totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-700">Total Disbursed</p>
                <HandCoins className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">KES {stats.totalDisbursed.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Filter Tabs with Counts */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'pending', 'active', 'completed'] as const).map((f) => {
          const count = f === 'all' ? loans.length : stats[f].length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === f
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
              {count > 0 && (
                <Badge variant={f === 'pending' ? 'warning' : f === 'active' ? 'success' : 'neutral'}>
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="No loans found"
          description={`No loans match the current filter. ${filter === 'pending' ? 'Consider reviewing pending applications.' : filter === 'active' ? 'All loans are currently being serviced.' : 'No completed loans to display.'}`}
        />
      ) : (
        <>
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filtered.length}</span> loan{filtered.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              {stats.pending.length > 0 && (
                <button className="btn-secondary text-sm">Review Applications</button>
              )}
              {stats.active.length > 0 && (
                <button className="btn-secondary text-sm">Send Reminders</button>
              )}
            </div>
          </div>
          
          {/* Loans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filtered.map((loan: Loan, idx: number) => (
              <div key={loan.id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <LoanCard 
                  loan={loan} 
                  onApprove={approveLoan} 
                  onReject={rejectLoan}
                  onRepayment={() => handleRepayment(loan)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <LoanApplication isOpen={showModal} onClose={() => setShowModal(false)} />
      
      {/* Loan Repayment Modal */}
      {selectedLoan && (
        <LoanRepaymentModal
          isOpen={showRepaymentModal}
          onClose={() => {
            setShowRepaymentModal(false);
            setSelectedLoan(null);
          }}
          loan={selectedLoan}
          onRepayment={addLoanRepayment}
        />
      )}
    </>
  );
}