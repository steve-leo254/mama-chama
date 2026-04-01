// src/auth/RegisterAdminPage.tsx
import { useState } from 'react';
import { Eye, EyeOff, UserPlus, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { toast } from '../components/ui/Toast';
import AuthLayout from './AuthLayout';

interface RegisterAdminPageProps {
  onBack: () => void;
}

interface AdminFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  national_id: string;
  next_of_kin: string;
}

export default function RegisterAdminPage({ onBack }: RegisterAdminPageProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminFormData, string>>>({});
  const [form, setForm] = useState<AdminFormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    national_id: '',
    next_of_kin: '',
  });

  const updateField = (field: keyof AdminFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AdminFormData, string>> = {};

    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'At least 6 characters';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.national_id.trim()) newErrors.national_id = 'National ID is required';
    if (!form.next_of_kin.trim()) newErrors.next_of_kin = 'Next of kin is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Admin registration failed');
      }

      await response.json();
      
      toast.success('Admin Registration Successful!', 'Admin account has been created successfully.');
      
      // Clear form
      setForm({
        name: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        national_id: '',
        next_of_kin: '',
      });
      
      // Go back to login after successful registration
      setTimeout(() => {
        onBack();
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Admin registration failed. Please try again.';
      toast.error('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Admin Registration"
      heroSubtitle="Create a new administrator account for Mama Chama management system."
      heroEmoji="👨‍💼"
      heroFeatures={[
        'Full system administration access',
        'Member management capabilities',
        'Financial oversight tools',
        'Meeting and loan management',
      ]}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Admin Account</h2>
          <p className="text-gray-500">Register a new system administrator</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`input-field ${errors.name ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="e.g. John Doe"
              disabled={loading}
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`input-field ${errors.email ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="admin@example.com"
              disabled={loading}
            />
            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className={`input-field pl-9 ${errors.username ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                placeholder="johndoe"
                disabled={loading}
              />
            </div>
            {errors.username && <p className="text-xs text-rose-600 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className={`input-field pr-12 ${errors.password ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                placeholder="Min. 6 characters"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`input-field ${errors.phone ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="+254 712 345 678"
              disabled={loading}
            />
            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">National ID Number *</label>
            <input
              type="text"
              value={form.national_id}
              onChange={(e) => updateField('national_id', e.target.value)}
              className={`input-field ${errors.national_id ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="12345678"
              disabled={loading}
            />
            {errors.national_id && <p className="text-xs text-rose-600 mt-1">{errors.national_id}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Next of Kin *</label>
            <input
              type="text"
              value={form.next_of_kin}
              onChange={(e) => updateField('next_of_kin', e.target.value)}
              className={`input-field ${errors.next_of_kin ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="Full name of next of kin"
              disabled={loading}
            />
            {errors.next_of_kin && <p className="text-xs text-rose-600 mt-1">{errors.next_of_kin}</p>}
          </div>
        </div>

        {/* Admin Privileges Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Administrator Privileges</h4>
              <p className="text-xs text-amber-700 mt-1">
                This account will have full administrative access to the Mama Chama system, including member management, 
                financial oversight, and system configuration. Please ensure this information is accurate.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-medium py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creating Admin Account...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" /> Create Admin Account
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
