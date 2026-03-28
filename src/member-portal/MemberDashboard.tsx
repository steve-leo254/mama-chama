// src/components/member-portal/MemberDashboard.tsx
import { useApp } from '../context/AppContext.tsx';
import { PiggyBank, HandCoins, AlertTriangle, TrendingUp, Calendar, ArrowDownLeft, ArrowUpRight, Wallet, Award, Key } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { useState, useEffect } from 'react';
import { toast } from '../components/ui/Toast';

export default function MemberDashboard() {
  const { currentUser, getMemberStats, getMemberTransactions, getMemberLoans, getMemberFines, meetings } = useApp();
  const [stats, setStats] = useState<any>({
    totalContributed: 0,
    totalFines: 0,
    finesPaid: 0,
    finesUnpaid: 0,
    activeLoanBalance: 0,
    totalLoansTaken: 0,
    savingsBalance: 0,
    contributionStreak: 0,
    lastContributionDate: '',
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    if (currentUser) {
      let stats: any = null;
      try {
        stats = getMemberStats(currentUser.id);
      } catch (err: unknown) {
        console.error('Failed to load member stats:', err);
        stats = {};
      }
      stats.then(setStats).catch((err: unknown) => {
        console.error('Failed to load member stats:', err);
      });
    }
  }, [currentUser, getMemberStats]);

  if (!currentUser) return null;

  const myTransactions = getMemberTransactions(currentUser.id).slice(0, 5);
  const myActiveLoans = getMemberLoans(currentUser.id).filter((l: any) => l.status === 'active');
  const myUnpaidFines = getMemberFines(currentUser.id).filter((f: any) => f.status === 'unpaid');
  const nextMeeting = meetings.find((m: any) => m.status === 'upcoming');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-emerald-100 text-sm">
                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'},
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold mt-1">{currentUser.name} 👋</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <Award className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-medium">{stats.contributionStreak || 0} month streak</span>
            </div>
            <button
              onClick={() => {
                const newPassword = Math.random().toString(36).substring(2, 10);
                toast.info('Password Changed', `Your new password is: ${newPassword}`);
                
                // In a real implementation, you would update the password in backend
                // await membersAPI.updatePassword(currentUser.id, newPassword);
              }}
              className="ml-4 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <p className="text-emerald-100 text-xs">My Savings</p>
              <p className="text-xl font-bold mt-1">KES {(stats?.savingsBalance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <p className="text-emerald-100 text-xs">Total Contributed</p>
              <p className="text-xl font-bold mt-1">KES {(stats?.totalContributed || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <p className="text-emerald-100 text-xs">Loan Balance</p>
              <p className="text-xl font-bold mt-1">KES {(stats?.activeLoanBalance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <p className="text-emerald-100 text-xs">Unpaid Fines</p>
              <p className="text-xl font-bold mt-1">KES {(stats?.finesUnpaid || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <PiggyBank className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">My Contributions</p>
              <p className="text-lg font-bold text-gray-900">KES {(stats.totalContributed || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>Last: {stats.lastContributionDate || 'N/A'}</span>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <HandCoins className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Loans</p>
              <p className="text-lg font-bold text-gray-900">{myActiveLoans.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Balance: KES {(stats.activeLoanBalance || 0).toLocaleString()}
          </p>
        </div>

        <div className="card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-rose-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Unpaid Fines</p>
              <p className="text-lg font-bold text-gray-900">KES {(stats.finesUnpaid || 0).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-rose-600">{myUnpaidFines.length} pending fine{myUnpaidFines.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Withdrawals</p>
              <p className="text-lg font-bold text-gray-900">KES {stats.pendingWithdrawals?.toLocaleString() || 0}</p>
            </div>
          </div>
          <p className="text-xs text-primary-600">Awaiting approval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Loans */}
        <div className="xl:col-span-2">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Active Loans</h3>
            {myActiveLoans.length === 0 ? (
              <div className="text-center py-8">
                <HandCoins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No active loans</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveLoans.map(loan => (
                  <div key={loan.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{loan.purpose}</p>
                        <p className="text-xs text-gray-500">Due: {loan.due_date}</p>
                      </div>
                      <Badge variant="info">Active</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Borrowed</p>
                        <p className="font-semibold">KES {loan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Paid</p>
                        <p className="font-semibold text-emerald-600">KES {loan.amount_paid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Remaining</p>
                        <p className="font-semibold text-rose-600">KES {(loan.total_repayable - loan.amount_paid).toLocaleString()}</p>
                      </div>
                    </div>
                    <ProgressBar value={loan.amount_paid} max={loan.total_repayable} color="emerald" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Upcoming Fines */}
          {myUnpaidFines.length > 0 && (
            <div className="card border-rose-200 bg-rose-50/30">
              <h3 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Unpaid Fines
              </h3>
              <div className="space-y-2">
                {myUnpaidFines.map(fine => (
                  <div key={fine.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fine.reason}</p>
                      <p className="text-xs text-gray-500">{fine.date}</p>
                    </div>
                    <p className="text-sm font-bold text-rose-600">KES {fine.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Meeting */}
          {nextMeeting && (
            <div className="card bg-primary-50/30 border-primary-200">
              <h3 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Next Meeting
              </h3>
              <p className="text-sm font-medium text-gray-900">{nextMeeting.title}</p>
              <p className="text-xs text-gray-600 mt-1">{nextMeeting.date} at {nextMeeting.time}</p>
              <p className="text-xs text-gray-500 mt-1">📍 {nextMeeting.location}</p>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {myTransactions.slice(0, 4).map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.direction === 'in' ? 'bg-emerald-100' : 'bg-rose-100'
                  }`}>
                    {tx.direction === 'in'
                      ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      : <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{tx.description}</p>
                    <p className="text-[10px] text-gray-500">{tx.date}</p>
                  </div>
                  <p className={`text-xs font-semibold ${tx.direction === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.direction === 'in' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}