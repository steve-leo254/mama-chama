import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Users, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface MerryGoRoundCycle {
  id: string;
  cycle: number;
  recipient_id: string;
  recipient_name: string;
  amount: number;
  date: string;
  status: 'upcoming' | 'completed' | 'current';
}

export default function MerryGoRoundPage() {
  const { members } = useApp();
  const [cycles, setCycles] = useState<MerryGoRoundCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/merry-go-round', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCycles(data);
      }
    } catch (error) {
      console.error('Error fetching cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      case 'upcoming': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'current': return <Clock className="w-4 h-4" />;
      case 'upcoming': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const nextCycleNumber = cycles.length > 0 ? Math.max(...cycles.map(c => c.cycle)) + 1 : 1;
  const currentCycle = cycles.find(c => c.status === 'current');
  const upcomingCycle = cycles.find(c => c.status === 'upcoming');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Merry-Go-Round cycles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Merry-Go-Round</h1>
          <p className="text-gray-600">View merry-go-round rotation schedule</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Cycles</p>
                <p className="text-2xl font-bold text-gray-900">{cycles.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Cycle</p>
                <p className="text-2xl font-bold text-gray-900">#{nextCycleNumber}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Distributed</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {cycles.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter((m: any) => m.status === 'active').length}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Current & Upcoming Info */}
        {(currentCycle || upcomingCycle) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentCycle && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Current Cycle
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Cycle:</span> #{currentCycle.cycle}</p>
                  <p><span className="font-medium">Recipient:</span> {currentCycle.recipient_name}</p>
                  <p><span className="font-medium">Amount:</span> KES {currentCycle.amount.toLocaleString()}</p>
                  <p><span className="font-medium">Date:</span> {new Date(currentCycle.date).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {upcomingCycle && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Upcoming Cycle
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Cycle:</span> #{upcomingCycle.cycle}</p>
                  <p><span className="font-medium">Recipient:</span> {upcomingCycle.recipient_name}</p>
                  <p><span className="font-medium">Amount:</span> KES {upcomingCycle.amount.toLocaleString()}</p>
                  <p><span className="font-medium">Date:</span> {new Date(upcomingCycle.date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cycles List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Cycles</h2>
          </div>
          
          {cycles.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cycles yet</h3>
              <p className="text-gray-600">Admin will create merry-go-round cycles soon!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cycles.map((cycle) => (
                    <tr key={cycle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">#{cycle.cycle}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-gray-900">{cycle.recipient_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">KES {cycle.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(cycle.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                          {getStatusIcon(cycle.status)}
                          <span className="ml-1">{cycle.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
