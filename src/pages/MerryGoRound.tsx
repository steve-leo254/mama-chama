// src/pages/MerryGoRound.tsx
import { useApp } from '../context/AppContext';
import Badge from '../ui/Badge';
import { Gift, CheckCircle, Clock } from 'lucide-react';

export default function MerryGoRound() {
  const { merryGoRoundCycles, members } = useApp();
  const currentCycle = merryGoRoundCycles.find(c => c.status === 'current');

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Merry-Go-Round</h2>
        <p className="text-gray-500 text-sm">Rotating savings payout schedule</p>
      </div>

      {/* Current Cycle Highlight */}
      {currentCycle && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-6 h-6" />
              <span className="text-lg font-semibold">Current Cycle</span>
            </div>
            <h3 className="text-3xl font-bold mb-2">{currentCycle.recipientName}</h3>
            <p className="text-white/80 mb-4">
              Will receive <span className="font-bold text-white">KES {currentCycle.amount.toLocaleString()}</span> on {currentCycle.date}
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
              <p className="text-sm">Each member contributes: <span className="font-bold">KES {(currentCycle.amount / (members.length - 1)).toLocaleString()}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">📋 How Merry-Go-Round Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-700">1</span>
            </div>
            <p className="text-sm text-gray-600">Each member contributes equally every month</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-700">2</span>
            </div>
            <p className="text-sm text-gray-600">One member receives the total pooled amount</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-700">3</span>
            </div>
            <p className="text-sm text-gray-600">Rotation continues until everyone has received</p>
          </div>
        </div>
      </div>

      {/* Cycle Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Payout Schedule</h3>
        <div className="space-y-4">
          {merryGoRoundCycles.map((cycle) => (
            <div
              key={cycle.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                cycle.status === 'current'
                  ? 'border-purple-200 bg-purple-50'
                  : cycle.status === 'completed'
                  ? 'border-gray-100 bg-gray-50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                cycle.status === 'completed'
                  ? 'bg-emerald-100'
                  : cycle.status === 'current'
                  ? 'bg-purple-100'
                  : 'bg-gray-100'
              }`}>
                {cycle.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : cycle.status === 'current' ? (
                  <Gift className="w-5 h-5 text-purple-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${
                    cycle.status === 'completed' ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    Cycle {cycle.cycle}: {cycle.recipientName}
                  </p>
                  <Badge variant={
                    cycle.status === 'completed' ? 'success' :
                    cycle.status === 'current' ? 'purple' : 'neutral'
                  }>
                    {cycle.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{cycle.date}</p>
              </div>

              <div className="text-right">
                <p className={`text-sm font-bold ${
                  cycle.status === 'completed' ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  KES {cycle.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}