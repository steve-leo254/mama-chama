// src/components/dashboard/StatsCards.tsx
import { Users, PiggyBank, HandCoins, Wallet, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export default function StatsCards() {
  const { stats } = useApp();

  // Provide default values to prevent undefined errors
  const safeStats = {
    availableFunds: stats?.availableBalance || 0,
    totalContributions: stats?.totalContributions || 0,
    totalLoans: stats?.totalLoans || 0,
    pendingLoanApplications: stats?.pendingLoanApplications || 0,
    totalMembers: stats?.totalMembers || 0,
    balanceTrend: stats?.trends?.balanceTrend || 0,
    contributionsTrend: stats?.trends?.contributionsTrend || 0,
    loansTrend: stats?.trends?.loansTrend || 0,
    membersTrend: stats?.trends?.membersTrend || 0,
  };

  const cards = [
    {
      label: 'Total Balance',
      value: `KES ${safeStats.availableFunds.toLocaleString()}`,
      icon: Wallet,
      change: `${safeStats.balanceTrend > 0 ? '+' : ''}${safeStats.balanceTrend}%`,
      positive: safeStats.balanceTrend >= 0,
      gradient: 'from-primary-500 to-primary-600',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      label: 'Total Contributions',
      value: `KES ${safeStats.totalContributions.toLocaleString()}`,
      icon: PiggyBank,
      change: `${safeStats.contributionsTrend > 0 ? '+' : ''}${safeStats.contributionsTrend}%`,
      positive: safeStats.contributionsTrend >= 0,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Active Loans',
      value: safeStats.totalLoans.toString(),
      subtitle: `${safeStats.pendingLoanApplications} pending`,
      icon: HandCoins,
      change: `${safeStats.loansTrend > 0 ? '+' : ''}${safeStats.loansTrend}`,
      positive: safeStats.loansTrend >= 0,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Members',
      value: safeStats.totalMembers.toString(),
      subtitle: 'Active members',
      icon: Users,
      change: `${safeStats.membersTrend > 0 ? '+' : ''}${safeStats.membersTrend}`,
      positive: safeStats.membersTrend >= 0,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className="card-hover animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${card.iconBg}`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${card.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp className={`w-3 h-3 ${!card.positive ? 'rotate-180' : ''}`} />
              {card.change}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.subtitle || card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}