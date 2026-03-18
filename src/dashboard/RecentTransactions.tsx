// src/components/dashboard/RecentTransactions.tsx
import { ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RecentTransactions() {
  const { transactions } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'contribution': return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'loan_disbursement': return <ArrowUpRight className="w-4 h-4 text-rose-600" />;
      case 'loan_repayment': return <ArrowDownLeft className="w-4 h-4 text-primary-600" />;
      case 'merry_go_round': return <RefreshCw className="w-4 h-4 text-purple-600" />;
      case 'penalty': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <ArrowDownLeft className="w-4 h-4 text-gray-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'contribution': return 'bg-emerald-100';
      case 'loan_disbursement': return 'bg-rose-100';
      case 'loan_repayment': return 'bg-primary-100';
      case 'merry_go_round': return 'bg-purple-100';
      case 'penalty': return 'bg-amber-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        <button className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</button>
      </div>
      <div className="space-y-3">
        {transactions.slice(0, 6).map((tx) => (
          <div key={tx.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className={`p-2.5 rounded-xl ${getIconBg(tx.type)}`}>{getIcon(tx.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{tx.memberName}</p>
              <p className="text-xs text-gray-500">{tx.description}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                tx.type === 'loan_disbursement' ? 'text-rose-600' : 'text-gray-900'
              }`}>
                {tx.type === 'loan_disbursement' ? '-' : '+'}KES {tx.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">{tx.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}