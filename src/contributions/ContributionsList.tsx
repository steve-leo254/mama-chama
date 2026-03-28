// src/components/contributions/ContributionsList.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Contribution } from '../types';
import Badge from '../ui/Badge';
import MakeContribution from './MakeContribution';
import { Plus, Download } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

export default function ContributionsList() {
  const { contributions, stats } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all');

  const filtered = contributions.filter((c: Contribution) =>
    filterStatus === 'all' || c.status === filterStatus
  );

  const statusVariant = {
    completed: 'success' as const,
    pending: 'warning' as const,
    overdue: 'danger' as const,
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contributions</h2>
          <p className="text-gray-500 text-sm">Track all member contributions</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">December 2024 Collection</h3>
            <p className="text-sm text-gray-500">
              KES {stats.monthlyCollected.toLocaleString()} of KES {stats.monthlyTarget.toLocaleString()} target
            </p>
          </div>
          <span className="text-2xl font-bold text-primary-600">
            {((stats.monthlyCollected / stats.monthlyTarget) * 100).toFixed(0)}%
          </span>
        </div>
        <ProgressBar value={stats.monthlyCollected} max={stats.monthlyTarget} color="primary" showLabel={false} size="md" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'completed', 'pending', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${
              filterStatus === f
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
            <span className="ml-1.5 text-xs">
              ({f === 'all' ? contributions.length : contributions.filter((c: Contribution) => c.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Contributions Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Member</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Method</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c: Contribution) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{c.member_name}</p>
                    <p className="text-xs text-gray-500">{c.month}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">KES {c.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <Badge variant={c.type === 'monthly' ? 'info' : c.type === 'special' ? 'purple' : 'warning'}>
                      {c.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600 capitalize">{c.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[c.status as keyof typeof statusVariant]}>{c.status}</Badge>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-500">{c.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MakeContribution isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}