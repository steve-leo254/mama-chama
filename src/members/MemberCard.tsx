// src/components/members/MemberCard.tsx
import { useState } from 'react';
import { Phone, Mail, MoreVertical, Key } from 'lucide-react';
import type { Member } from '../types';
import Badge from '../ui/Badge';
import { toast } from '../components/ui/Toast';

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const generateNewPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleChangePassword = () => {
    const newPassword = generateNewPassword();
    toast.info('Password Changed', `${member.name}'s new password is: ${newPassword}`);
    
    // In a real implementation, you would update the member's password in the backend
    // await membersAPI.updatePassword(member.id, newPassword);
    
    setShowPasswordModal(false);
    setShowDropdown(false);
  };

  const roleVariant = {
    admin: 'danger' as const,
    treasurer: 'info' as const,
    secretary: 'purple' as const,
    member: 'neutral' as const,
  };

  const statusVariant = {
    active: 'success' as const,
    inactive: 'warning' as const,
    suspended: 'danger' as const,
  };

  return (
    <div className="card-hover group relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
            {member.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={roleVariant[member.role]}>{member.role}</Badge>
              <Badge variant={statusVariant[member.status]}>{member.status}</Badge>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => {
                  setShowPasswordModal(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Contributed</p>
          <p className="text-sm font-bold text-emerald-700">KES {(member.totalContributed || 0).toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Borrowed</p>
          <p className="text-sm font-bold text-amber-700">KES {(member.totalBorrowed || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>{member.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span className="truncate">{member.email}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Joined {member.joinDate ? new Date(member.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : 'Unknown'}</p>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Password for {member.name}</h3>
            <p className="text-sm text-gray-600 mb-4">New password will be shown below</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="text"
                value={generateNewPassword()}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="btn-primary flex-1"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}