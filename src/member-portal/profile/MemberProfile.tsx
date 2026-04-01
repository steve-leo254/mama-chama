// src/components/member-portal/profile/MemberProfile.tsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, Shield, CreditCard, Save, Camera } from 'lucide-react';
import Badge from '../../ui/Badge';

export default function MemberProfile() {
  const { currentUser, getMemberStats, setCurrentUser } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return;
      try {
        const memberStats = await getMemberStats(currentUser.id);
        setStats(memberStats);
      } catch (err) {
        console.error('Failed to load member stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [currentUser, getMemberStats]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setPreviewImage(result);
      }
    };
    reader.readAsDataURL(file);

    // Upload to backend
    try {
      setUploadingImage(true);
      const { membersAPI, authAPI } = await import('../../services/api');
      await membersAPI.uploadAvatar(currentUser.id, file);
      
      // Force refresh of current user by calling authAPI.getMe()
      const refreshedUser = await authAPI.getMe();
      
      // Update current user data to show new avatar immediately
      setCurrentUser(refreshedUser);
      
      alert('Profile picture updated successfully!');
      setPreviewImage(null); // Clear preview after successful upload
      
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-gray-500 text-sm">View and update your personal information</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4 overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
              ) : currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-emerald-600" />
              )}
            </div>
            <button
              onClick={() => document.getElementById('profile-image-upload')?.click()}
              className={`absolute bottom-2 right-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Change profile picture"
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{currentUser.name}</h3>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="success">{currentUser.status}</Badge>
            <Badge variant="info">{currentUser.role}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Member since {new Date(currentUser.join_date).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
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
              <span>ID: {currentUser.national_id || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span>Next of Kin: {currentUser.next_of_kin || 'Not provided'}</span>
            </div>
          </div>

          {/* My Stats Summary */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">My Stats</h4>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Loading stats...</p>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Contributed</p>
                  <p className="text-sm font-bold text-emerald-700">KES {(stats.totalContributed || 0).toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Loan Balance</p>
                  <p className="text-sm font-bold text-amber-700">KES {(stats.activeLoanBalance || 0).toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Unpaid Fines</p>
                  <p className="text-sm font-bold text-rose-700">KES {(stats.finesUnpaid || 0).toLocaleString()}</p>
                </div>
                <div className="bg-primary-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Streak</p>
                  <p className="text-sm font-bold text-primary-700">{stats.contributionStreak || 0} months</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Unable to load stats</p>
              </div>
            )}
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
                  <input type="text" defaultValue={currentUser.national_id || ''} className="input-field" placeholder="Enter national ID" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Next of Kin</label>
                <input type="text" defaultValue={currentUser.next_of_kin || ''} className="input-field" placeholder="Enter next of kin" />
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