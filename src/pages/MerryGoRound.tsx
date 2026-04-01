// src/pages/MerryGoRound.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Badge from '../ui/Badge';
import { Gift, CheckCircle, Clock, Plus, Calendar, User, DollarSign } from 'lucide-react';

export default function MerryGoRound() {
  const { merryGoRoundCycles, members, currentUser } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    cycle: 1,
    recipient_id: '',
    amount: '',
    date: '',
    status: 'upcoming'
  });
  
  const currentCycle = merryGoRoundCycles.find(c => c.status === 'current');
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  const handleCreateCycle = async () => {
    try {
      // Validate form data
      if (!formData.recipient_id || !formData.amount || !formData.date) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/merry-go-round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cycle: formData.cycle,
          recipient_id: formData.recipient_id,
          recipient_name: members.find(m => m.id === formData.recipient_id)?.name || '',
          amount: parseFloat(formData.amount),
          date: formData.date,
          status: formData.status
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Cycle created successfully:', result);
        
        // Reset form and refresh data
        setFormData({
          cycle: 1,
          recipient_id: '',
          amount: '',
          date: '',
          status: 'upcoming'
        });
        setShowCreateForm(false);
        // Refresh the page data
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Failed to create cycle:', errorData);
        alert(`Failed to create cycle: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating cycle:', error);
      alert('Error creating cycle. Please check your connection and try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Merry-Go-Round</h2>
        <p className="text-gray-500 text-sm">Rotating savings payout schedule</p>
      </div>

      {/* Admin Section - Create New Cycle */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Admin Controls</h3>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Cycle
            </button>
          </div>

          {showCreateForm && (
            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle Number
                  </label>
                  <input
                    type="number"
                    value={formData.cycle}
                    onChange={(e) => setFormData({...formData, cycle: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., 1, 2, 3..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient
                  </label>
                  <select
                    value={formData.recipient_id}
                    onChange={(e) => setFormData({...formData, recipient_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select a member</option>
                    {members.filter(m => m.role === 'member').map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payout Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payout Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="current">Current</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateCycle}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Cycle
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Cycle Highlight */}
      {currentCycle && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-6 h-6" />
              <span className="text-lg font-semibold">Current Cycle</span>
            </div>
            <h3 className="text-3xl font-bold mb-2">{currentCycle.recipient_name}</h3>
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
                    Cycle {cycle.cycle}: {cycle.recipient_name}
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