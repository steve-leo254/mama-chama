// src/components/dashboard/ContributionChart.tsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { reportsAPI } from '../services/api';

export default function ContributionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyContributions = async () => {
      try {
        setLoading(true);
        const response = await reportsAPI.monthlyContributions(6);
        setData(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch monthly contributions:', err);
        setError('Failed to load contribution data');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyContributions();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Monthly Contributions</h3>
            <p className="text-sm text-gray-500">Actual vs Target</p>
          </div>
          <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <option>Last 6 months</option>
            <option>Last 12 months</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Monthly Contributions</h3>
            <p className="text-sm text-gray-500">Actual vs Target</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Monthly Contributions</h3>
          <p className="text-sm text-gray-500">Actual vs Target</p>
        </div>
        <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
        </select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`KES ${(value as number).toLocaleString()}`, '']}
            />
            <Legend />
            <Bar dataKey="amount" name="Collected" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}