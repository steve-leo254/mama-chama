// src/components/member-portal/group-reports/GroupReports.tsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../ui/Badge';
import ProgressBar from '../../ui/ProgressBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Users, PiggyBank, HandCoins, AlertTriangle, Download } from 'lucide-react';

export default function GroupReports() {
  const { stats, members, contributions, fines } = useApp();
  const [activeTab, setActiveTab] = useState<'balances' | 'contributions' | 'fines'>('balances');

  const activeMembers = members.filter(m => m.status === 'active');
  const totalFines = fines.reduce((s, f) => s + f.amount, 0);
  const paidFines = fines.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const unpaidFines = fines.filter(f => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);

  // Contribution per member
  const memberContribData = activeMembers.map(m => ({
    name: m.name.split(' ')[0],
    amount: contributions.filter(c => c.member_id === m.id && c.status === 'completed').reduce((s, c) => s + c.amount, 0),
  })).sort((a, b) => b.amount - a.amount);

  // Balance breakdown
  const balanceData = [
    { name: 'Savings', value: stats.totalContributions, color: '#10b981' },
    { name: 'Loans Out', value: stats.totalLoans, color: '#f59e0b' },
    { name: 'Available', value: stats.availableBalance, color: '#3b82f6' },
  ];

  // Monthly collection data
  const monthlyData = [
    { month: 'Jul', collected: 38000, target: 40000 },
    { month: 'Aug', collected: 40000, target: 40000 },
    { month: 'Sep', collected: 37000, target: 40000 },
    { month: 'Oct', collected: 40000, target: 40000 },
    { month: 'Nov', collected: 39000, target: 40000 },
    { month: 'Dec', collected: 30000, target: 40000 },
  ];

  const tabs = [
    { key: 'balances' as const, label: 'Account Balances', icon: Wallet },
    { key: 'contributions' as const, label: 'Contribution Report', icon: PiggyBank },
    { key: 'fines' as const, label: 'Fine Summary', icon: AlertTriangle },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Reports</h2>
          <p className="text-gray-500 text-sm">View chama financial reports & summaries</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Balances */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-700">Total Savings</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">KES {stats.totalContributions.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-primary-700">Available Balance</span>
              </div>
              <p className="text-2xl font-bold text-primary-900">KES {stats.availableBalance.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <HandCoins className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-700">Loans Outstanding</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">KES {stats.totalLoans.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-700">Active Members</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{activeMembers.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Balance Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={balanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {balanceData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value ? `KES ${Number(value).toLocaleString()}` : ''} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {balanceData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Member Contributions Ranking</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberContribData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v) => `${v / 1000}k`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12 }} width={70} />
                    <Tooltip formatter={(value) => value ? `KES ${Number(value).toLocaleString()}` : ''} />
                    <Bar dataKey="amount" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Member Balances Table */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">All Members Account Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Member</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Contributed</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Borrowed</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Fines</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(m => {
                    const memberFines = fines.filter(f => f.member_id === m.id);
                    const unpaidAmt = memberFines.filter(f => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{m.avatar}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{m.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-600">
                          KES {(m.totalContributed || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-amber-600 hidden sm:table-cell">
                          KES {(m.totalBorrowed || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm hidden md:table-cell">
                          {unpaidAmt > 0 ? (
                            <span className="text-rose-600 font-semibold">KES {unpaidAmt}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={m.status === 'active' ? 'success' : 'warning'}>{m.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Report */}
      {activeTab === 'contributions' && (
        <div className="space-y-6">
          {/* Monthly Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Collection Progress</h3>
                <p className="text-sm text-gray-500">December 2024</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  {((stats.monthlyCollected / stats.monthlyTarget) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500">
                  KES {stats.monthlyCollected.toLocaleString()} / {stats.monthlyTarget.toLocaleString()}
                </p>
              </div>
            </div>
            <ProgressBar value={stats.monthlyCollected} max={stats.monthlyTarget} color="emerald" showLabel={false} size="md" />
          </div>

          {/* Monthly Trend */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Monthly Collection Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(value) => value ? `KES ${Number(value).toLocaleString()}` : ''} />
                  <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual Status */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">December 2024 — Member Status</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {members.filter(m => m.status === 'active').map(m => {
                const decContrib = contributions.find(
                  c => c.member_id === m.id && c.month === 'December 2024' && c.type === 'monthly'
                );
                return (
                  <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{m.avatar}</span>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900">
                        KES {decContrib ? decContrib.amount.toLocaleString() : '0'}
                      </span>
                      <Badge variant={
                        decContrib?.status === 'completed' ? 'success' :
                        decContrib?.status === 'pending' ? 'warning' :
                        decContrib?.status === 'overdue' ? 'danger' : 'neutral'
                      }>
                        {decContrib?.status || 'not paid'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fine Summary */}
      {activeTab === 'fines' && (
        <div className="space-y-6">
          {/* Fine Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100/50">
              <p className="text-sm text-gray-600">Total Fines Issued</p>
              <p className="text-2xl font-bold text-gray-900">KES {totalFines.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{fines.length} fines total</p>
            </div>
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
              <p className="text-sm text-emerald-700">Fines Paid</p>
              <p className="text-2xl font-bold text-emerald-900">KES {paidFines.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-1">{fines.filter(f => f.status === 'paid').length} paid</p>
            </div>
            <div className="card bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200">
              <p className="text-sm text-rose-700">Fines Unpaid</p>
              <p className="text-2xl font-bold text-rose-900">KES {unpaidFines.toLocaleString()}</p>
              <p className="text-xs text-rose-600 mt-1">{fines.filter(f => f.status === 'unpaid').length} outstanding</p>
            </div>
          </div>

          {/* All Fines */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">All Fines Record</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Member</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Reason</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Amount</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fines.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{f.member_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{f.reason}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">KES {f.amount}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={f.status === 'paid' ? 'success' : 'danger'}>{f.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{f.month}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}