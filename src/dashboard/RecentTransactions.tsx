// src/components/dashboard/RecentTransactions.tsx
import { ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RecentTransactions() {
  const { transactions, dataLoading } = useApp();
  const navigate = useNavigate();

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
        <button 
          onClick={() => {
            console.log('View All clicked');
            navigate('/deposit-management');
          }}
          className="text-sm text-primary-600 font-medium hover:text-primary-700 cursor-pointer transition-colors"
        >
          View All
        </button>
      </div>
      
      {dataLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-16 mb-1" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowDownLeft className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-1">Transactions will appear here once members start contributing</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.slice(0, 6).map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className={`p-2.5 rounded-xl ${getIconBg(tx.type)}`}>{getIcon(tx.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{tx.member_name}</p>
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
      )}
    </div>
  );
}