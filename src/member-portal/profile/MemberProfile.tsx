// src/components/member-portal/profile/MemberProfile.tsx
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, Calendar, Shield, CreditCard, Save } from 'lucide-react';
import Badge from '../../ui/Badge';

export default function MemberProfile() {
  const { currentUser, getMemberStats } = useApp();

  if (!currentUser) return null;
  const stats = getMemberStats(currentUser.id);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-gray-500 text-sm">View and update your personal information</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4">
            {currentUser.avatar}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{currentUser.name}</h3>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="success">{currentUser.status}</Badge>
            <Badge variant="info">{currentUser.role}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Member since {new Date(currentUser.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span>ID: {currentUser.nationalId}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span>Next of Kin: {currentUser.nextOfKin}</span>
            </div>
          </div>

          {/* My Stats Summary */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">My Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Contributed</p>
                <p className="text-sm font-bold text-emerald-700">KES {stats.totalContributed.toLocaleString()}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Loan Balance</p>
                <p className="text-sm font-bold text-amber-700">KES {stats.activeLoanBalance.toLocaleString()}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Unpaid Fines</p>
                <p className="text-sm font-bold text-rose-700">KES {stats.finesUnpaid.toLocaleString()}</p>
              </div>
              <div className="bg-primary-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Streak</p>
                <p className="text-sm font-bold text-primary-700">{stats.contributionStreak} months</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" defaultValue={currentUser.name} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" defaultValue={currentUser.email} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" defaultValue={currentUser.phone} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">National ID</label>
                  <input type="text" defaultValue={currentUser.nationalId} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Next of Kin</label>
                <input type="text" defaultValue={currentUser.nextOfKin} className="input-field" />
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Security
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <Shield className="w-4 h-4" /> Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}