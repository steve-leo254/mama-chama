// src/components/auth/RegisterPage.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Eye, EyeOff, UserPlus, ArrowRight, ArrowLeft,
  Check, User, Phone, Shield, FileText, Loader2,
  CheckCircle, Circle
} from 'lucide-react';
import { toast } from '../components/ui/Toast';
import AuthLayout from './AuthLayout.tsx';
import MpesaPaymentModal, { type PaymentResult } from '../payments/MpesaPaymentModal';

interface RegisterPageProps {
  onSwitch: () => void;
  onViewTerms: (step: number, data: FormData) => void;
  initialStep?: number;
  initialData?: FormData | null;
}

interface FormData {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  nationalId: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  acceptedTerms: boolean;
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Your basic details' },
  { id: 2, title: 'Contact & ID', icon: Phone, description: 'Phone & identification' },
  { id: 3, title: 'Security', icon: Shield, description: 'Create your password' },
  { id: 4, title: 'Terms', icon: FileText, description: 'Review & accept' },
];

export default function RegisterPage({ onSwitch, onViewTerms, initialStep = 1, initialData = null }: RegisterPageProps) {
  const { login } = useApp();
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [form, setForm] = useState<FormData>(initialData || {
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nationalId: '',
    nextOfKin: '',
    nextOfKinPhone: '',
    acceptedTerms: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (currentStep) {
      case 1:
        if (!form.name.trim()) newErrors.name = 'Full name is required';
        else if (form.name.trim().split(' ').length < 2) newErrors.name = 'Please enter first and last name';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email';
        if (!form.username.trim()) newErrors.username = 'Username is required';
        else if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) newErrors.username = 'Only letters, numbers, and underscores';
        break;
      case 2:
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^(\+254|0)\d{9}/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter a valid Kenyan phone number';
        if (!form.nationalId.trim()) newErrors.nationalId = 'National ID is required';
        if (!form.nextOfKin.trim()) newErrors.nextOfKin = 'Next of kin name is required';
        break;
      case 3:
        if (!form.password) newErrors.password = 'Password is required';
        else if (form.password.length < 6) newErrors.password = 'At least 6 characters';
        else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Include at least one uppercase letter';
        else if (!/[0-9]/.test(form.password)) newErrors.password = 'Include at least one number';
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
      case 4:
        if (!form.acceptedTerms) newErrors.acceptedTerms = 'You must accept the terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step) && step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getPasswordStrength = (): { level: number; label: string; color: string } => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-primary-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username,
          password: form.password,
          phone: form.phone,
          national_id: form.nationalId,
          next_of_kin: form.nextOfKin,
          next_of_kin_phone: form.nextOfKinPhone,
          accepted_terms: form.acceptedTerms,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      await login(form.email, form.password);
      
      setRegistrationComplete(true);
      setShowPaymentModal(true);
      
      toast.success('Registration Successful!', 'Welcome to Mama Chama! Your account has been created.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.error('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment Complete!', 'Registration fee paid successfully. Welcome to Mama Chama!');
    setShowPaymentModal(false);
    // Optionally redirect to dashboard or show welcome screen
  };

  const handlePaymentCancel = () => {
    toast.info('Payment Skipped', 'You can pay the registration fee later from your dashboard.');
    setShowPaymentModal(false);
    // Optionally redirect to dashboard
  };

  const strength = getPasswordStrength();

  return (
    <AuthLayout
      heroTitle="Join Mama Chama"
      heroSubtitle="Start your journey towards financial freedom. Save together, grow together."
      heroEmoji="💪🏾"
      heroFeatures={[
        'Save consistently every month',
        'Access affordable loans at 10% interest',
        'Grow through merry-go-round payouts',
        'Build lasting friendships & networks',
      ]}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
      <p className="text-gray-500 mb-6">Join our chama community today</p>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step > s.id
                      ? 'bg-emerald-500 text-white'
                      : step === s.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
                  step >= s.id ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-full h-0.5 mx-2 mt-[-18px] sm:mt-[-8px] transition-colors duration-300 ${
                  step > s.id ? 'bg-emerald-500' : 'bg-gray-200'
                }`} style={{ minWidth: '20px' }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center">
          Step {step} of 4: {STEPS[step - 1].description}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ====== STEP 1: Personal Info ====== */}
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`input-field ${errors.name ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                placeholder="e.g. Stella Wanjiku Kananu"
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
                placeholder="jane@email.com"
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
                  placeholder="janewanjiku"
                />
              </div>
              {errors.username && <p className="text-xs text-rose-600 mt-1">{errors.username}</p>}
              {form.username && !errors.username && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> @{form.username} looks good!
                </p>
              )}
            </div>
          </div>
        )}

        {/* ====== STEP 2: Contact & ID ====== */}
        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`input-field ${errors.phone ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                placeholder="+254 712 345 678"
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              <p className="text-xs text-gray-400 mt-1">This will be used for M-Pesa transactions</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">National ID Number *</label>
              <input
                type="text"
                value={form.nationalId}
                onChange={(e) => updateField('nationalId', e.target.value)}
                className={`input-field ${errors.nationalId ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                placeholder="12345678"
              />
              {errors.nationalId && <p className="text-xs text-rose-600 mt-1">{errors.nationalId}</p>}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Next of Kin Details</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Next of Kin Name *</label>
                  <input
                    type="text"
                    value={form.nextOfKin}
                    onChange={(e) => updateField('nextOfKin', e.target.value)}
                    className={`input-field ${errors.nextOfKin ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                    placeholder="Full name"
                  />
                  {errors.nextOfKin && <p className="text-xs text-rose-600 mt-1">{errors.nextOfKin}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Next of Kin Phone</label>
                  <input
                    type="tel"
                    value={form.nextOfKinPhone}
                    onChange={(e) => updateField('nextOfKinPhone', e.target.value)}
                    className="input-field"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== STEP 3: Security ====== */}
        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Create Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className={`input-field pr-12 ${errors.password ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  placeholder="Min. 6 characters"
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

              {/* Password Strength Meter */}
              {form.password && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength.level ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.level <= 1 ? 'text-rose-600' :
                    strength.level <= 2 ? 'text-amber-600' :
                    strength.level <= 3 ? 'text-primary-600' : 'text-emerald-600'
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1.5">
                {[
                  { check: form.password.length >= 6, label: 'At least 6 characters' },
                  { check: /[A-Z]/.test(form.password), label: 'One uppercase letter' },
                  { check: /[0-9]/.test(form.password), label: 'One number' },
                  { check: /[^A-Za-z0-9]/.test(form.password), label: 'One special character (optional)' },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {req.check ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-gray-300" />
                    )}
                    <span className={`text-xs ${req.check ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className={`input-field pr-12 ${errors.confirmPassword ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>
          </div>
        )}

        {/* ====== STEP 4: Terms & Conditions ====== */}
        {step === 4 && (
          <div className="space-y-4 animate-slide-up">
            {/* Registration Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">📋 Registration Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Name</p>
                  <p className="font-medium text-gray-900">{form.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Username</p>
                  <p className="font-medium text-gray-900">@{form.username}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-medium text-gray-900">{form.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="font-medium text-gray-900">{form.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">National ID</p>
                  <p className="font-medium text-gray-900">{form.nationalId}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Next of Kin</p>
                  <p className="font-medium text-gray-900">{form.nextOfKin}</p>
                </div>
              </div>
            </div>

            {/* Terms Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-48 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Terms & Conditions (Summary)</h4>
              <div className="text-xs text-gray-600 space-y-2">
                <p>By joining Mama Chama, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Pay a one-time <strong>registration fee of KES 1,000</strong></li>
                  <li>Pay monthly contributions of <strong>KES 5,000</strong> by the 5th of each month</li>
                  <li>Late contributions attract a penalty of <strong>KES 500</strong></li>
                  <li>Absence from meetings attracts a fine of <strong>KES 200</strong></li>
                  <li>Loans are available up to <strong>3x</strong> your total contributions</li>
                  <li>Loan interest rate is <strong>10% flat</strong></li>
                  <li>At least <strong>2 guarantors</strong> required for each loan</li>
                  <li>Contribute for <strong>3 months</strong> minimum before loan eligibility</li>
                  <li>Maximum loan duration is <strong>12 months</strong></li>
                  <li>Merry-go-round participation is mandatory</li>
                  <li>Your personal data will be kept confidential</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewTerms(step, form)}
              className="w-full text-center text-sm text-primary-600 font-medium hover:text-primary-700 hover:underline"
            >
              📄 Read Full Terms & Conditions
            </button>

            {/* Accept Checkbox */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              form.acceptedTerms
                ? 'border-emerald-500 bg-emerald-50'
                : errors.acceptedTerms
                ? 'border-rose-300 bg-rose-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={(e) => updateField('acceptedTerms', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className={`text-sm font-medium ${form.acceptedTerms ? 'text-emerald-800' : 'text-gray-900'}`}>
                  I accept the Terms & Conditions
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  I have read and agree to the Mama Chama constitution, rules, and privacy policy
                </p>
              </div>
            </label>
            {errors.acceptedTerms && <p className="text-xs text-rose-600 -mt-2">{errors.acceptedTerms}</p>}

            {/* Privacy Note */}
            <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
              <p className="text-xs text-primary-800">
                🔒 Your personal information is encrypted and will never be shared with third parties.
                You can request data deletion at any time.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 flex-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center justify-center gap-2 flex-1"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !form.acceptedTerms}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium py-3 px-4 flex items-center justify-center gap-2 flex-1 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Create Account
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
          Sign in
        </button>
      </p>

      {/* M-Pesa Payment Modal for Registration Fee */}
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancel}
        amount={1000}
        paymentType="registration_fee"
        description="One-time registration fee"
        onSuccess={handlePaymentSuccess}
        lockedAmount={true}
      />
    </AuthLayout>
  );
}