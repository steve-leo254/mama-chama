// src/pages/Dashboard.tsx
import StatsCards from '../dashboard/StatsCards';
import ContributionChart from '../dashboard/ContributionChart';
import RecentTransactions from '../dashboard/RecentTransactions';
import UpcomingEvents from '../dashboard/UpcomingEvents';
import { useApp } from '../context/AppContext.tsx';

export default function Dashboard() {
  const { stats, currentUser, dataLoading } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <p className="text-white/80 text-sm">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</p>
          <h1 className="text-2xl lg:text-3xl font-bold mt-1">{currentUser?.name || 'Welcome'} 👋</h1>
          <p className="text-white/70 mt-2 text-sm">Here's what's happening with your chama today</p>
          {dataLoading ? (
            <div className="text-white/80 text-sm mt-2">Loading your data...</div>
          ) : currentUser ? (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Monthly Collection Progress</span>
                <span className="text-sm font-semibold">
                  {((stats.monthlyCollected / stats.monthlyTarget) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.monthlyCollected / stats.monthlyTarget) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-2">
                KES {stats.monthlyCollected.toLocaleString()} of KES {stats.monthlyTarget.toLocaleString()} collected
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ContributionChart />
        </div>
        <div>
          <UpcomingEvents />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}