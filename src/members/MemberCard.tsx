// src/components/members/MemberCard.tsx
import { Phone, Mail, MoreVertical } from 'lucide-react';
import type { Member } from '../types';
import Badge from '../ui/Badge';

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
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
    <div className="card-hover group">
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
        <button className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
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
    </div>
  );
}