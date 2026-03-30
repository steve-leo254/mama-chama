// src/components/member-portal/transactions/TransactionCenter.tsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import Badge from '../../ui/Badge';
import DepositModal from './DepositModal';
import WithdrawRequestModal from './WithdrawRequestModal';
import {
  ArrowDownLeft, ArrowUpRight, Plus, Minus,
  Smartphone, CreditCard, Banknote, Clock
} from 'lucide-react';

export default function TransactionCenter() {
  const { currentUser, getMemberTransactions, getMemberDeposits, getMemberWithdrawals, getMemberContributions, getMemberLoanRepayments, getMemberFines, createMissingTransactions } = useApp();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  if (!currentUser) return null;

  const myTransactions = getMemberTransactions(currentUser.id);
  const myDeposits = getMemberDeposits(currentUser.id);
  const myWithdrawals = getMemberWithdrawals(currentUser.id);

  // Debug logging
  console.log('TRANSACTION CENTER DEBUG:', {
    currentUser: currentUser?.id,
    currentUserObj: currentUser,
    myTransactionsCount: myTransactions?.length || 0,
    myDepositsCount: myDeposits?.length || 0,
    myWithdrawalsCount: myWithdrawals?.length || 0,
    myTransactions: myTransactions,
    sampleDeposit: myDeposits?.[0],
  });

  const depositStatusVariant = {
    completed: 'success' as const,
    pending: 'warning' as const,
    failed: 'danger' as const,
  };

  const withdrawalStatusVariant = {
    completed: 'success' as const,
    pending: 'warning' as const,
    approved: 'info' as const,
    rejected: 'danger' as const,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
          <p className="text-gray-500 text-sm">Deposit, withdraw, and track your money</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDeposit(true)} className="btn-success flex items-center gap-2">
            <Plus className="w-4 h-4" /> Deposit
          </button>
          <button onClick={() => setShowWithdraw(true)} className="btn-primary flex items-center gap-2">
            <Minus className="w-4 h-4" /> Withdraw
          </button>
          <button onClick={async () => await createMissingTransactions()} className="btn-secondary flex items-center gap-2">
            Fix Transactions
          </button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700">Total Deposits (All)</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            KES {(
              // Include all deposit types: generic deposits + specialized payment tables
              (myDeposits || []).reduce((s: number, d: any) => s + d.amount, 0) +
              // Add monthly contributions
              (getMemberContributions(currentUser.id) || []).reduce((s: number, c: any) => s + c.amount, 0) +
              // Add loan repayments  
              (getMemberLoanRepayments(currentUser.id) || []).reduce((s: number, lr: any) => s + lr.amount, 0) +
              // Add fine payments
              (getMemberFines(currentUser.id) || []).filter((f: any) => f.status === 'paid').reduce((s: number, f: any) => s + f.amount, 0) +
              // Add extra savings (we'll need to add this API call)
              0 // Placeholder for extra savings until we add the API
            ).toLocaleString('en-KE')}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight className="w-5 h-5 text-rose-600" />
            <span className="text-sm text-rose-700">Total Withdrawn (Completed)</span>
          </div>
          <p className="text-2xl font-bold text-rose-900">
            KES {(myWithdrawals || []).filter((w: any) => w.status === 'completed').reduce((s: number, w: any) => s + w.amount, 0).toLocaleString('en-KE')}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">
            KES {(
              (myDeposits || []).filter((d: any) => d.status === 'pending').reduce((s: number, d: any) => s + d.amount, 0) +
              (myWithdrawals || []).filter((w: any) => w.status === 'pending').reduce((s: number, w: any) => s + w.amount, 0)
            ).toLocaleString('en-KE')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {([
          { key: 'all', label: 'All Transactions', count: (myTransactions || []).length },
          { key: 'deposits', label: 'My Deposits', count: (myDeposits || []).length },
          { key: 'withdrawals', label: 'My Withdrawals', count: (myWithdrawals || []).length },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Transaction Lists */}
      {activeTab === 'all' && (
        <div className="card overflow-hidden p-0">
          <div className="divide-y divide-gray-50">
            {(myTransactions || []).length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              (myTransactions || []).map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`p-2.5 rounded-xl ${tx.direction === 'in' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {tx.direction === 'in'
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      : <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.date} • {tx.type.replace('_', ' ')}</p>
                  </div>
                  <p className={`text-sm font-bold ${tx.direction === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.direction === 'in' ? '+' : '-'}KES {tx.amount.toLocaleString('en-KE')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'deposits' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Description</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden sm:table-cell">Method</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden md:table-cell">Reference</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(myDeposits || []).map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{d.description}</p>
                    <p className="text-xs text-gray-500 capitalize">{d.type.replace('_', ' ')}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-600">+KES {d.amount.toLocaleString('en-KE')}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-600 capitalize flex items-center gap-1.5">
                      {d.method === 'mpesa' ? <Smartphone className="w-3.5 h-3.5" /> :
                       d.method === 'bank' ? <CreditCard className="w-3.5 h-3.5" /> :
                       <Banknote className="w-3.5 h-3.5" />}
                      {d.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500 font-mono">{d.reference}</td>
                  <td className="px-6 py-4"><Badge variant={depositStatusVariant[d.status as keyof typeof depositStatusVariant]}>{d.status}</Badge></td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Reason</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden sm:table-cell">Method</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(myWithdrawals || []).map((w: any) => (
                <tr key={w.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{w.reason}</p>
                    <p className="text-xs text-gray-500">{(w as any).account_details}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-rose-600">-KES {w.amount.toLocaleString('en-KE')}</td>
                  <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-600 capitalize">{w.method}</td>
                  <td className="px-6 py-4"><Badge variant={withdrawalStatusVariant[w.status as keyof typeof withdrawalStatusVariant]}>{w.status}</Badge></td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">{w.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} />
      <WithdrawRequestModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} />
    </div>
  );
}