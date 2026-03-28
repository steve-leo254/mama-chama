// src/components/loans/LoanCard.tsx
import type { Loan } from '../types';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { Calendar, Users, Target } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRepayment?: (loan: Loan) => void;
}

export default function LoanCard({ loan, onApprove, onReject, onRepayment }: LoanCardProps) {
  const statusVariant = {
    pending: 'warning' as const,
    approved: 'info' as const,
    active: 'success' as const,
    completed: 'success' as const,
    defaulted: 'danger' as const,
    rejected: 'danger' as const,
  };

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{loan.member_name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{loan.purpose}</p>
        </div>
        <Badge variant={statusVariant[loan.status]}>{loan.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Loan Amount</p>
          <p className="text-sm font-bold text-gray-900">KES {loan.amount.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Total Repayable</p>
          <p className="text-sm font-bold text-gray-900">KES {loan.total_repayable.toLocaleString()}</p>
        </div>
      </div>

      {(loan.status === 'active' || loan.status === 'completed') && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Repayment Progress</span>
            <span className="font-medium text-gray-900">KES {loan.amount_paid.toLocaleString()}</span>
          </div>
          <ProgressBar
            value={loan.amount_paid}
            max={loan.total_repayable}
            color={loan.status === 'completed' ? 'emerald' : 'primary'}
          />
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span>{loan.interest_rate}% interest • {loan.duration} months</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Due: {new Date(loan.due_date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Guarantors: {loan.guarantors.join(', ')}</span>
        </div>
      </div>

      {loan.status === 'pending' && onApprove && onReject && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => onReject(loan.id)} className="btn-danger flex-1 text-sm">Reject</button>
          <button onClick={() => onApprove(loan.id)} className="btn-success flex-1 text-sm">Approve</button>
        </div>
      )}

      {loan.status === 'active' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">Monthly payment: <span className="font-semibold text-gray-900">KES {loan.monthly_payment.toLocaleString()}</span></p>
          {onRepayment && (
            <button 
              onClick={() => onRepayment(loan)} 
              className="btn-primary w-full mt-2 text-sm"
            >
              Record Repayment
            </button>
          )}
        </div>
      )}
    </div>
  );
}