// src/context/AppContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Member, Contribution, Loan, Meeting, MerryGoRoundCycle,
  Transaction, Fine, DepositRecord,
  WithdrawRequest, LoanRepaymentRecord, MemberStats, Notification
} from '../types';
import { authAPI, membersAPI, contributionsAPI, loansAPI, finesAPI, depositsAPI } from '../services/api';

// Initial empty state - will be populated from API
const initialState: {
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  meetings: Meeting[];
  merryGoRoundCycles: MerryGoRoundCycle[];
  transactions: Transaction[];
  notifications: Notification[];
  fines: Fine[];
  deposits: DepositRecord[];
  withdrawRequests: WithdrawRequest[];
  loanRepayments: LoanRepaymentRecord[];
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalContributions: number;
    totalLoans: number;
    pendingLoanApplications: number;
    monthlyContributions: number;
    availableFunds: number;
    totalFines: number;
    monthlyCollected: number;
    monthlyTarget: number;
  };
} = {
  members: [],
  contributions: [],
  loans: [],
  meetings: [],
  merryGoRoundCycles: [],
  transactions: [],
  notifications: [],
  fines: [],
  deposits: [],
  withdrawRequests: [],
  loanRepayments: [],
  stats: {
    totalMembers: 0,
    activeMembers: 0,
    totalContributions: 0,
    totalLoans: 0,
    pendingLoanApplications: 0,
    monthlyContributions: 0,
    availableFunds: 0,
    totalFines: 0,
    monthlyCollected: 0,
    monthlyTarget: 10000,
  }
};

interface AppContextType {
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  meetings: Meeting[];
  merryGoRoundCycles: MerryGoRoundCycle[];
  transactions: Transaction[];
  notifications: Notification[];
  fines: Fine[];
  deposits: DepositRecord[];
  withdrawRequests: WithdrawRequest[];
  loanRepayments: LoanRepaymentRecord[];
  stats: typeof initialState.stats;
  isAuthenticated: boolean;
  currentUser: Member | null;
  portalMode: 'admin' | 'member';
  loading: boolean;
  dataLoading: boolean;
  error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
  addMember: (member: any) => Promise<void>;
  addContribution: (contribution: any) => Promise<void>;
  applyLoan: (loan: any) => Promise<void>;
  approveLoan: (loanId: string) => Promise<void>;
  rejectLoan: (loanId: string) => Promise<void>;
  addMeeting: (meeting: any) => Promise<void>;
  markNotificationRead: (id: string) => void;
  unreadNotifications: number;
  addDeposit: (deposit: any) => Promise<void>;
  addWithdrawRequest: (request: any) => Promise<void>;
  getMemberStats: (memberId: string) => Promise<MemberStats>;
  getMemberContributions: (memberId: string) => Contribution[];
  getMemberFines: (memberId: string) => Fine[];
  getMemberLoans: (memberId: string) => Loan[];
  getMemberTransactions: (memberId: string) => Transaction[];
  getMemberDeposits: (memberId: string) => DepositRecord[];
  getMemberWithdrawals: (memberId: string) => WithdrawRequest[];
  getMemberLoanRepayments: (memberId: string) => LoanRepaymentRecord[];
  getMemberNotifications: (memberId: string) => Notification[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [portalMode, setPortalMode] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = authAPI.getToken();
      if (token) {
        try {
          const user = await authAPI.validateToken();
          setCurrentUser(user);
          setIsAuthenticated(true);
          const mode = ['admin', 'treasurer', 'secretary'].includes(user.role) ? 'admin' : 'member';
          setPortalMode(mode);
        } catch (err) {
          // Token is invalid, clear it
          authAPI.setToken('');
        }
      }
    };
    
    checkAuth();
  }, []);

  // Update functions
  const updateData = (updates: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Load initial data
  const refreshData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [members, contributions, loans, fines, deposits] = await Promise.all([
        membersAPI.list(),
        contributionsAPI.list(),
        loansAPI.list(),
        finesAPI.list(),
        depositsAPI.list(),
      ]);

      updateData({
        members,
        contributions,
        loans,
        fines,
        deposits,
        stats: {
          totalMembers: members.length,
          activeMembers: members.filter(m => m.status === 'active').length,
          totalContributions: contributions.reduce((sum, c) => sum + c.amount, 0),
          totalLoans: loans.length,
          pendingLoanApplications: loans.filter(l => l.status === 'pending').length,
          monthlyContributions: contributions
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + c.amount, 0),
          availableFunds: contributions
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + c.amount, 0) - loans
            .filter(l => l.status === 'active')
            .reduce((sum, l) => sum + (l.totalRepayable - l.amountPaid), 0),
          totalFines: fines.reduce((sum, f) => sum + f.amount, 0),
          monthlyCollected: contributions
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + c.amount, 0),
          monthlyTarget: 10000,
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      authAPI.setToken(response.access_token);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      // Determine mode from user role
      const mode = ['admin', 'treasurer', 'secretary'].includes(response.user.role) ? 'admin' : 'member';
      setPortalMode(mode);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authAPI.setToken('');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setData(initialState);
  };

  // CRUD operations
  const addMember = async (member: any) => {
    try {
      const newMember = await membersAPI.create(member);
      updateData({ members: [...data.members, newMember] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const addContribution = async (contribution: any) => {
    try {
      const newContribution = await contributionsAPI.create(contribution);
      updateData({ contributions: [newContribution, ...data.contributions] });
      await refreshData(); // Refresh to update stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contribution');
    }
  };

  const applyLoan = async (loan: any) => {
    try {
      const newLoan = await loansAPI.create(loan);
      updateData({ loans: [...data.loans, newLoan] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply for loan');
    }
  };

  const approveLoan = async (loanId: string) => {
    try {
      const updatedLoan = await loansAPI.approve(loanId);
      updateData({ 
        loans: data.loans.map(l => l.id === loanId ? updatedLoan : l)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve loan');
    }
  };

  const rejectLoan = async (loanId: string) => {
    try {
      const updatedLoan = await loansAPI.reject(loanId);
      updateData({ 
        loans: data.loans.map(l => l.id === loanId ? updatedLoan : l)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject loan');
    }
  };

  const addMeeting = async (meeting: any) => {
    // Implementation depends on your meetings API
    updateData({ meetings: [...data.meetings, { ...meeting, id: Date.now().toString() }] });
  };

  const addDeposit = async (deposit: any) => {
    try {
      const newDeposit = await depositsAPI.create(deposit);
      updateData({ deposits: [newDeposit, ...data.deposits] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add deposit');
    }
  };

  const addWithdrawRequest = async (request: any) => {
    // Implementation depends on your withdrawal API
    updateData({ withdrawRequests: [...data.withdrawRequests, { ...request, id: Date.now().toString() }] });
  };

  const markNotificationRead = (id: string) => {
    updateData({
      notifications: data.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    });
  };

  const getMemberStats = async (memberId: string): Promise<MemberStats> => {
    try {
      return await membersAPI.getStats(memberId);
    } catch (err) {
      // Fallback to calculated stats
      const memberContribs = data.contributions.filter(c => c.memberId === memberId);
      const memberFines = data.fines.filter(f => f.memberId === memberId);
      const memberLoans = data.loans.filter(l => l.memberId === memberId);

      const totalContributed = memberContribs
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.amount, 0);

      const totalFines = memberFines.reduce((sum, f) => sum + f.amount, 0);
      const finesPaid = memberFines.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      const finesUnpaid = memberFines.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

      const activeLoans = memberLoans.filter(l => l.status === 'active');
      const activeLoanBalance = activeLoans.reduce((sum, l) => sum + (l.totalRepayable - l.amountPaid), 0);
      const totalLoansTaken = memberLoans.length;

      return {
        totalContributed,
        totalFines,
        finesPaid,
        finesUnpaid,
        activeLoanBalance,
        totalLoansTaken,
        savingsBalance: totalContributed,
        contributionStreak: 0,
        lastContributionDate: '',
        pendingWithdrawals: 0,
      };
    }
  };

  // Getter functions
  const getMemberContributions = (memberId: string) =>
    data.contributions.filter(c => c.memberId === memberId);

  const getMemberFines = (memberId: string) =>
    data.fines.filter(f => f.memberId === memberId);

  const getMemberLoans = (memberId: string) =>
    data.loans.filter(l => l.memberId === memberId);

  const getMemberTransactions = (memberId: string) =>
    data.transactions.filter(t => t.memberId === memberId);

  const getMemberDeposits = (memberId: string) =>
    data.deposits.filter(d => d.memberId === memberId);

  const getMemberWithdrawals = (memberId: string) =>
    data.withdrawRequests.filter(w => w.memberId === memberId);

  const getMemberLoanRepayments = (memberId: string) =>
    data.loanRepayments.filter(lr => lr.memberId === memberId);

  const getMemberNotifications = (memberId: string) =>
    data.notifications.filter(n => !n.memberId || n.memberId === memberId);

  const unreadNotifications = data.notifications.filter(n => !n.read).length;

  // Load data when authenticated
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !dataLoading) {
      setDataLoading(true);
      refreshData();
    }
  }, [isAuthenticated]);

  const value: AppContextType = {
    ...data,
    isAuthenticated,
    currentUser,
    portalMode,
    loading,
    dataLoading,
    error,
    login,
    logout,
    refreshData,
    addMember,
    addContribution,
    applyLoan,
    approveLoan,
    rejectLoan,
    addMeeting,
    markNotificationRead,
    unreadNotifications,
    addDeposit,
    addWithdrawRequest,
    getMemberStats,
    getMemberContributions,
    getMemberFines,
    getMemberLoans,
    getMemberTransactions,
    getMemberDeposits,
    getMemberWithdrawals,
    getMemberLoanRepayments,
    getMemberNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
