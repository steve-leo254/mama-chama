import { useState } from 'react';
import Badge from '../ui/Badge';
import { Calculator, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface EligibilityResult {
  eligible: boolean;
  member_id: string;
  member_name: string;
  total_savings: number;
  active_loans_balance: number;
  monthly_income: number;
  multiplier: number;
  limits: {
    savings_based: number;
    income_based: number;
    guarantor_based: number;
    policy_based: number;
  };
  final_eligible_amount: number;
  requested_amount?: number;
  approved_amount: number;
  can_approve_requested: boolean;
  checks: any;
  recommendations: string[];
  reason?: string;
}

interface Member {
  id: string;
  name: string;
  total_contributed: number;
}

interface LoanCalculatorProps {
  currentMember?: Member;
  members?: Member[];
  onLoanApplication?: (loanData: any) => void;
}

export default function LoanCalculator({ currentMember, members = [], onLoanApplication }: LoanCalculatorProps) {
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('12');
  const [purpose, setPurpose] = useState<string>('');
  const [selectedGuarantors, setSelectedGuarantors] = useState<string[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const checkEligibility = async () => {
    if (!currentMember) {
      setError('Please select a member first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (amount) params.append('requested_amount', amount);
      if (duration) params.append('duration_months', duration);
      if (selectedGuarantors.length > 0) params.append('guarantor_ids', selectedGuarantors.join(','));

      const response = await fetch(`${API_BASE}/api/loan/eligibility/${currentMember.id}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const result = await response.json();
      setEligibility(result);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyForLoan = async () => {
    if (!eligibility || !eligibility.eligible) return;

    setLoading(true);
    setError('');

    try {
      const loanData = {
        member_id: currentMember?.id,
        amount: parseFloat(amount),
        duration: parseInt(duration),
        purpose,
        guarantors: selectedGuarantors
      };

      const response = await fetch(`${API_BASE}/api/loan/apply-with-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(loanData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to apply for loan');
      }

      const loan = await response.json();
      onLoanApplication?.(loan);
      
      // Reset form
      setAmount('');
      setPurpose('');
      setSelectedGuarantors([]);
      setShowResults(false);
      setEligibility(null);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateMonthlyPayment = (principal: number, months: number, rate: number = 10) => {
    const totalRepayable = principal + (principal * rate / 100);
    return Math.ceil(totalRepayable / months);
  };

  const availableGuarantors = members.filter(m => m.id !== currentMember?.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5" />
          <h2 className="text-xl font-semibold">SACCO Loan Calculator</h2>
        </div>
        
        <div className="space-y-4">
          {/* Member Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
                Member
              </label>
              <input
                id="member"
                type="text"
                value={currentMember?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              {currentMember && (
                <p className="text-sm text-gray-600 mt-1">
                  Total Savings: {formatCurrency(currentMember.total_contributed)}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount (KES)
              </label>
              <input
                id="amount"
                type="number"
                placeholder="50000"
                value={amount}
                onChange={(e: any) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Months)
              </label>
              <select
                value={duration}
                onChange={(e: any) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
              </select>
            </div>
          </div>

          <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Purpose
              </label>
              <input
                id="purpose"
                type="text"
                placeholder="e.g., School fees, Business expansion, Emergency"
                value={purpose}
                onChange={(e: any) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          {/* Guarantors Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Guarantors (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableGuarantors.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`guarantor-${member.id}`}
                    checked={selectedGuarantors.includes(member.id)}
                    onChange={(e: any) => {
                      if (e.target.checked) {
                        setSelectedGuarantors([...selectedGuarantors, member.id]);
                      } else {
                        setSelectedGuarantors(selectedGuarantors.filter(id => id !== member.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`guarantor-${member.id}`} className="text-sm">
                    {member.name} ({formatCurrency(member.total_contributed)})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={checkEligibility}
              disabled={loading || !amount}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Eligibility'}
            </button>
            
            {eligibility?.eligible && amount && (
              <button
                onClick={applyForLoan}
                disabled={loading || !purpose}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Applying...' : 'Apply for Loan'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Eligibility Results */}
      {showResults && eligibility && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            {eligibility.eligible ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Eligibility Results</h2>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold">Not Eligible</h2>
              </>
            )}
          </div>
          
          <div className="space-y-4">
            {eligibility.eligible ? (
              <>
                {/* Eligible Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Financial Profile
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Savings:</span>
                        <span className="font-medium">{formatCurrency(eligibility.total_savings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Loans:</span>
                        <span className="font-medium">{formatCurrency(eligibility.active_loans_balance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Multiplier:</span>
                        <span className="font-medium">{eligibility.multiplier}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Loan Limits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Savings-Based:</span>
                        <span className="font-medium">{formatCurrency(eligibility.limits.savings_based)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Income-Based:</span>
                        <span className="font-medium">{formatCurrency(eligibility.limits.income_based)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guarantor-Based:</span>
                        <span className="font-medium">{formatCurrency(eligibility.limits.guarantor_based)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Eligibility */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold">Maximum Eligible Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(eligibility.final_eligible_amount)}
                    </span>
                  </div>
                  
                  {amount && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Requested Amount:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Payment:</span>
                        <span className="font-medium">
                          {formatCurrency(calculateMonthlyPayment(parseFloat(amount), parseInt(duration)))}
                        </span>
                      </div>
                      
                      {eligibility.can_approve_requested ? (
                        <Badge variant="success">
                          ✓ Requested amount is eligible
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          ✗ Requested amount exceeds limit
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {eligibility.recommendations.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {eligibility.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    {eligibility.reason || 'You are not currently eligible for a loan.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
