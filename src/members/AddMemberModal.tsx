// src/components/members/AddMemberModal.tsx
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import { useApp } from '../context/AppContext';
import { toast } from '../components/ui/Toast';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { addMember } = useApp();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', nationalId: '', nextOfKin: '', password: '',
  });
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const sendWelcomeEmail = async (member: any) => {
    // This would integrate with your email service
    // For now, we'll show a toast with the credentials
    toast.info('Member Added', `${member.name} has been added successfully. Email: ${member.email}, Password: ${member.password}`);
    
    // In a real implementation, you would send an email here:
    // await emailService.sendWelcomeEmail(member.email, member.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.phone || !form.nationalId || !form.nextOfKin) {
      toast.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const generatedPassword = generatePassword();
      const newMember = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        national_id: form.nationalId,
        next_of_kin: form.nextOfKin,
        username: form.email.split('@')[0] + Math.random().toString(36).substr(2, 5), // Generate unique username
        password: generatedPassword,
        avatar: '👩🏾',
        role: 'member',
        status: 'active'
      };
      
      console.log('🔍 Creating member with data:', newMember);
      await addMember(newMember);
      console.log('✅ Member created successfully');
      await sendWelcomeEmail({...newMember, password: generatedPassword});
      
      setForm({ name: '', email: '', phone: '', nationalId: '', nextOfKin: '', password: '' });
      onClose();
      
      toast.success('Member Added Successfully', `${newMember.name} can now login with their credentials`);
    } catch (err) {
      console.error('❌ Error creating member:', err);
      toast.error('Error', 'Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}