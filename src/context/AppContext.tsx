// src/context/AppContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Member, Contribution, Loan, Meeting, MerryGoRoundCycle,
  Transaction, Fine, DepositRecord,
  WithdrawRequest, LoanRepaymentRecord, MemberStats, Notification
} from '../types';
import { authAPI, membersAPI, contributionsAPI, loansAPI, finesAPI, depositsAPI, transactionsAPI, withdrawRequestsAPI, loanRepaymentsAPI, merryGoRoundAPI, meetingsAPI, notificationsAPI } from '../services/api';

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
    transactions: Transaction[];
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
    transactions: [],
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
  addLoanRepayment: (repayment: any) => Promise<void>;
  addMeeting: (meeting: any) => Promise<void>;
  markNotificationRead: (id: string) => void;
  unreadNotifications: number;
  addDeposit: (deposit: any) => Promise<void>;
  addWithdrawRequest: (request: any) => Promise<void>;
  createMissingTransactions: () => Promise<void>;
  getMemberStats: (memberId: string) => Promise<MemberStats>;
  getMemberContributions: (memberId: string) => Contribution[];
  getMemberFines: (memberId: string) => Fine[];
  getMemberLoans: (memberId: string) => Loan[];
  getMemberTransactions: (memberId: string) => Transaction[];
  getMemberDeposits: (memberId: string) => DepositRecord[];
  getMemberWithdrawals: (memberId: string) => WithdrawRequest[];
  getMemberLoanRepayments: (memberId: string) => LoanRepaymentRecord[];
  getMemberNotifications: (memberId: string) => Notification[];
  setCurrentUser: (user: Member | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [portalMode, setPortalMode] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
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
      const [members, contributions, loans, fines, deposits, transactions, withdrawRequests, merryGoRoundCycles, meetings, notifications] = await Promise.all([
        membersAPI.list(),
        contributionsAPI.list(),
        loansAPI.list(),
        finesAPI.list(),
        depositsAPI.list(),
        transactionsAPI.list(),
        withdrawRequestsAPI.list(),
        merryGoRoundAPI.list(),
        meetingsAPI.list(),
        notificationsAPI.list(),
      ]);

      updateData({
        members,
        contributions,
        loans,
        fines,
        deposits,
        transactions,
        withdrawRequests,
        merryGoRoundCycles,
        meetings,
        notifications,
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
            .reduce((sum, l) => sum + (l.total_repayable - l.amount_paid), 0),
          totalFines: fines.reduce((sum, f) => sum + f.amount, 0),
          monthlyCollected: contributions
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + c.amount, 0),
          monthlyTarget: 10000,
          transactions,
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      setDataLoading(false);
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
      console.log('🔍 AppContext: Adding member with data:', member);
      const newMember = await membersAPI.create(member);
      console.log('✅ AppContext: Member created:', newMember);
      updateData({ members: [...data.members, newMember] });
      console.log('📋 AppContext: Updated members list:', [...data.members, newMember]);
      await refreshData(); // Refresh to update stats and ensure data consistency
      console.log('🔄 AppContext: Data refreshed');
    } catch (err) {
      console.error('❌ AppContext: Error adding member:', err);
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

  const addLoanRepayment = async (repayment: any) => {
    try {
      const newRepayment = await loanRepaymentsAPI.create(repayment);
      // Calculate balance after repayment
      const targetLoan = data.loans.find(loan => loan.id === repayment.loan_id);
      const balanceAfter = targetLoan ? targetLoan.total_repayable - (targetLoan.amount_paid + repayment.amount) : 0;
      
      // Create a complete repayment record with balance_after
      const { created_at, ...repaymentData } = newRepayment;
      const completeRepayment: LoanRepaymentRecord = {
        ...repaymentData,
        balance_after: balanceAfter,
        method: newRepayment.method as 'mpesa' | 'bank' | 'cash',
        reference: newRepayment.reference || ''
      };
      
      // Update the loan with new repayment amount
      const updatedLoans = data.loans.map(loan => {
        if (loan.id === repayment.loan_id) {
          return {
            ...loan,
            amount_paid: loan.amount_paid + repayment.amount
          };
        }
        return loan;
      });
      updateData({ loans: updatedLoans, loanRepayments: [...data.loanRepayments, completeRepayment] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add repayment');
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
    try {
      const newMeeting = await meetingsAPI.create(meeting);
      updateData({ meetings: [...data.meetings, newMeeting] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    }
  };

  const addDeposit = async (deposit: any) => {
    try {
      // Create deposit via API (backend will create transaction automatically)
      const newDeposit = await depositsAPI.create(deposit);
      
      // Update local state with the deposit only
      updateData({ 
        deposits: [newDeposit, ...data.deposits]
      });
      
      console.log('Deposit saved to database:', newDeposit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add deposit');
    }
  };

  // Function to create transactions for existing deposits that don't have them
  const createMissingTransactions = async () => {
    console.log('Creating missing transactions for existing deposits');
    
    for (const deposit of data.deposits) {
      const hasTransaction = data.transactions.some((tx: any) => 
        tx.member_id === deposit.member_id && 
        tx.amount === deposit.amount && 
        tx.date === deposit.date
      );
      
      if (!hasTransaction) {
        console.log('Creating missing transaction for deposit:', deposit);
        const transaction = {
          type: deposit.type === 'savings' ? 'deposit' : deposit.type as 'contribution' | 'loan_repayment' | 'fine_payment' | 'deposit',
          amount: deposit.amount,
          date: deposit.date,
          description: deposit.description,
          member_id: deposit.member_id,
          member_name: deposit.member_name,
          direction: 'in' as const,
        };
        
        try {
          // Save transaction to database
          const newTransaction = await transactionsAPI.create(transaction);
          // Update local state
          updateData({ 
            transactions: [newTransaction, ...data.transactions]
          });
          console.log('Transaction saved to database:', newTransaction);
        } catch (error) {
          console.error('Failed to save transaction to database:', error);
        }
      }
    }
  };

  const addWithdrawRequest = async (request: any) => {
    // Create corresponding transaction
    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'withdrawal' as const,
      amount: request.amount,
      date: request.date,
      description: request.reason,
      member_id: request.memberId,
      member_name: request.memberName,
      direction: 'out' as const,
    };
    
    // Update state with both withdrawal and transaction
    updateData({ 
      withdrawRequests: [...data.withdrawRequests, { 
        ...request, 
        id: Date.now().toString(),
        account_details: request.accountDetails // Map accountDetails to account_details
      }],
      transactions: [transaction, ...data.transactions]
    });
    
    console.log('Withdrawal request and transaction created:', { request, transaction });
  };

  const markNotificationRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      updateData({
        notifications: data.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getMemberStats = async (memberId: string): Promise<MemberStats> => {
    try {
      return await membersAPI.getStats(memberId);
    } catch (err) {
      // Fallback to calculated stats
      const memberContribs = data.contributions.filter(c => c.member_id === memberId);
      const memberFines = data.fines.filter(f => f.member_id === memberId);
      const memberLoans = data.loans.filter(l => l.member_id === memberId);

      const totalContributed = memberContribs
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.amount, 0);

      const totalFines = memberFines.reduce((sum, f) => sum + f.amount, 0);
      const finesPaid = memberFines.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      const finesUnpaid = memberFines.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

      const activeLoans = memberLoans.filter(l => l.status === 'active');
      const activeLoanBalance = activeLoans.reduce((sum, l) => sum + (l.total_repayable - l.amount_paid), 0);
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
    data.contributions.filter(c => c.member_id === memberId);

  const getMemberFines = (memberId: string) =>
    data.fines.filter(f => f.member_id === memberId);

  const getMemberLoans = (memberId: string) =>
    data.loans.filter(l => l.member_id === memberId);

  const getMemberTransactions = (memberId: string) =>
    data.transactions.filter(t => t.member_id === memberId);

  const getMemberDeposits = (memberId: string) =>
    data.deposits.filter(d => d.member_id === memberId);

  const getMemberWithdrawals = (memberId: string) =>
    data.withdrawRequests.filter(w => w.member_id === memberId);

  const getMemberLoanRepayments = (memberId: string) =>
    data.loanRepayments.filter(lr => lr.member_id === memberId);

  const getMemberNotifications = (memberId: string) =>
    data.notifications.filter(n => !n.memberId || n.memberId === memberId);

  const unreadNotifications = data.notifications.filter(n => !n.read).length;

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && !dataLoading) {
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
    addLoanRepayment,
    addMeeting,
    markNotificationRead,
    unreadNotifications,
    addDeposit,
    addWithdrawRequest,
    createMissingTransactions,
    getMemberStats,
    getMemberContributions,
    getMemberFines,
    getMemberLoans,
    getMemberTransactions,
    getMemberDeposits,
    getMemberWithdrawals,
    getMemberLoanRepayments,
    getMemberNotifications,
    setCurrentUser,
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
