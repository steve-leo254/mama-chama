// src/components/members/AddMemberModal.tsx
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import { useApp } from '../context/AppContext';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { addMember } = useApp();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', nationalId: '', nextOfKin: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMember({
      ...form,
      avatar: '👩🏾',
      role: 'member',
      joinDate: new Date().toISOString().split('T')[0],
      totalContributed: 0,
      totalBorrowed: 0,
      status: 'active',
    });
    setForm({ name: '', email: '', phone: '', nationalId: '', nextOfKin: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Member" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="e.g. Jane Wanjiku"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="jane@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              placeholder="+254 7XX XXX XXX"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">National ID</label>
            <input
              type="text"
              required
              value={form.nationalId}
              onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
              className="input-field"
              placeholder="12345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Next of Kin</label>
            <input
              type="text"
              required
              value={form.nextOfKin}
              onChange={(e) => setForm({ ...form, nextOfKin: e.target.value })}
              className="input-field"
              placeholder="Full name"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </form>
    </Modal>
  );
}