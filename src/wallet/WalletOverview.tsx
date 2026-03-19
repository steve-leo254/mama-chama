// src/components/wallet/WalletOverview.tsx
import { useApp } from '../context/AppContext.tsx';
import type { Transaction } from '../types';
import { Wallet, TrendingUp, PiggyBank, HandCoins, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function WalletOverview() {
  const { stats, transactions }: { stats: any, transactions: Transaction[] } = useApp();

  // Provide default values to prevent undefined errors
  const safeStats = {
    availableFunds: stats?.availableFunds || 0,
    totalContributions: stats?.totalContributions || 0,
    totalLoans: stats?.totalLoans || 0,
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalIn: number = safeTransactions
    .filter((t: Transaction) => ['contribution', 'loan_repayment', 'penalty', 'interest'].includes(t.type))
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalOut: number = safeTransactions
    .filter((t: Transaction) => ['loan_disbursement', 'merry_go_round'].includes(t.type))
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Wallet</h2>
        <p className="text-gray-500 text-sm">Chama financial overview</p>
      </div>

      {/* Main Balance Card */}
      <div className="gradient-hero rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">Available Balance</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            KES {safeStats.availableFunds.toLocaleString()}
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                <span className="text-sm text-white/80">Total In</span>
              </div>
              <p className="text-xl font-bold">KES {totalIn.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="w-4 h-4 text-rose-300" />
                <span className="text-sm text-white/80">Total Out</span>
              </div>
              <p className="text-xl font-bold">KES {totalOut.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Total Contributions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {safeStats.totalContributions.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
            <TrendingUp className="w-4 h-4" /> +8.2% this month
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <HandCoins className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Outstanding Loans</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {safeStats.totalLoans.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">{safeStats.totalLoans} active loans</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Interest Earned</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES 12,500</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
            <TrendingUp className="w-4 h-4" /> From loan interest
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h3>
        <div className="space-y-3">
          {safeTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className={`p-2.5 rounded-xl ${
                tx.type === 'loan_disbursement' || tx.type === 'merry_go_round'
                  ? 'bg-rose-100' : 'bg-emerald-100'
              }`}>
                {tx.type === 'loan_disbursement' || tx.type === 'merry_go_round'
                  ? <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  : <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                <p className="text-xs text-gray-500">{tx.memberName} • {tx.date}</p>
              </div>
              <p className={`text-sm font-semibold ${
                tx.type === 'loan_disbursement' || tx.type === 'merry_go_round'
                  ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {tx.type === 'loan_disbursement' || tx.type === 'merry_go_round' ? '-' : '+'}
                KES {tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}