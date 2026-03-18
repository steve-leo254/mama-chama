// src/context/AppContext.tsx
import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  Member, Contribution, Loan, Meeting, MerryGoRoundCycle,
  Transaction, Fine, DepositRecord,
  WithdrawRequest, LoanRepaymentRecord, MemberStats, Notification
} from '../types';
import {
  members as initialMembers, contributions as initialContributions,
  loans as initialLoans, meetings as initialMeetings,
  merryGoRoundCycles as initialCycles, recentTransactions as initialTransactions,
  notifications as initialNotifications, chamaStats as initialStats,
  fines as initialFines, deposits as initialDeposits,
  withdrawRequests as initialWithdrawals, loanRepayments as initialLoanRepayments,
} from '../data/mockData';

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
  stats: typeof initialStats;
  isAuthenticated: boolean;
  currentUser: Member | null;
  portalMode: 'admin' | 'member';
  login: (email: string, password: string, mode: 'admin' | 'member') => boolean;
  logout: () => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  addContribution: (contribution: Omit<Contribution, 'id'>) => void;
  applyLoan: (loan: Omit<Loan, 'id'>) => void;
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  unreadNotifications: number;
  addDeposit: (deposit: Omit<DepositRecord, 'id'>) => void;
  addWithdrawRequest: (request: Omit<WithdrawRequest, 'id'>) => void;
  getMemberStats: (memberId: string) => MemberStats;
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
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [merryGoRoundCycles] = useState<MerryGoRoundCycle[]>(initialCycles);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [notificationsList, setNotifications] = useState<Notification[]>(initialNotifications);
  const [fines] = useState<Fine[]>(initialFines);
  const [depositsData, setDeposits] = useState<DepositRecord[]>(initialDeposits);
  const [withdrawRequestsData, setWithdrawRequests] = useState<WithdrawRequest[]>(initialWithdrawals);
  const [loanRepayments] = useState<LoanRepaymentRecord[]>(initialLoanRepayments);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [portalMode, setPortalMode] = useState<'admin' | 'member'>('member');

  const login = (email: string, _password: string, mode: 'admin' | 'member') => {
    const user = members.find(m => m.email === email);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setPortalMode(mode);
      return true;
    }
    // Demo mode
    setIsAuthenticated(true);
    setCurrentUser(mode === 'admin' ? members[0] : members[3]); // Agnes for member demo
    setPortalMode(mode);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addMember = (member: Omit<Member, 'id'>) => {
    setMembers(prev => [...prev, { ...member, id: Date.now().toString() }]);
  };

  const addContribution = (contribution: Omit<Contribution, 'id'>) => {
    const newContribution = { ...contribution, id: `c${Date.now()}` };
    setContributions(prev => [newContribution, ...prev]);
    setTransactions(prev => [{
      id: `t${Date.now()}`, type: 'contribution', amount: contribution.amount,
      date: contribution.date, description: `${contribution.type} contribution`,
      memberId: contribution.memberId, memberName: contribution.memberName, direction: 'in',
    }, ...prev]);
  };

  const applyLoan = (loan: Omit<Loan, 'id'>) => {
    setLoans(prev => [...prev, { ...loan, id: `l${Date.now()}` }]);
  };

  const approveLoan = (loanId: string) => {
    setLoans(prev => prev.map(l =>
      l.id === loanId ? { ...l, status: 'approved' as const, approvalDate: new Date().toISOString().split('T')[0] } : l
    ));
  };

  const rejectLoan = (loanId: string) => {
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'rejected' as const } : l));
  };

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    setMeetings(prev => [...prev, { ...meeting, id: `m${Date.now()}` }]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addDeposit = (deposit: Omit<DepositRecord, 'id'>) => {
    const newDeposit = { ...deposit, id: `d${Date.now()}` };
    setDeposits(prev => [newDeposit, ...prev]);
    setTransactions(prev => [{
      id: `t${Date.now()}`, type: 'deposit', amount: deposit.amount,
      date: deposit.date, description: deposit.description,
      memberId: deposit.memberId, memberName: deposit.memberName, direction: 'in',
    }, ...prev]);
  };

  const addWithdrawRequest = (request: Omit<WithdrawRequest, 'id'>) => {
    const newRequest = { ...request, id: `w${Date.now()}` };
    setWithdrawRequests(prev => [newRequest, ...prev]);
  };

  const getMemberContributions = (memberId: string) =>
    contributions.filter(c => c.memberId === memberId);

  const getMemberFines = (memberId: string) =>
    fines.filter(f => f.memberId === memberId);

  const getMemberLoans = (memberId: string) =>
    loans.filter(l => l.memberId === memberId);

  const getMemberTransactions = (memberId: string) =>
    transactions.filter(t => t.memberId === memberId);

  const getMemberDeposits = (memberId: string) =>
    depositsData.filter(d => d.memberId === memberId);

  const getMemberWithdrawals = (memberId: string) =>
    withdrawRequestsData.filter(w => w.memberId === memberId);

  const getMemberLoanRepayments = (memberId: string) =>
    loanRepayments.filter(lr => lr.memberId === memberId);

  const getMemberNotifications = (memberId: string) =>
    notificationsList.filter(n => !n.memberId || n.memberId === memberId);

  const getMemberStats = (memberId: string): MemberStats => {
    const memberContribs = getMemberContributions(memberId);
    const memberFines = getMemberFines(memberId);
    const memberLoans = getMemberLoans(memberId);
    const memberWithdrawals = getMemberWithdrawals(memberId);

    const totalContributed = memberContribs
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalFines = memberFines.reduce((sum, f) => sum + f.amount, 0);
    const finesPaid = memberFines.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const finesUnpaid = memberFines.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

    const activeLoans = memberLoans.filter(l => l.status === 'active');
    const activeLoanBalance = activeLoans.reduce((sum, l) => sum + (l.totalRepayable - l.amountPaid), 0);
    const totalLoansTaken = memberLoans.length;

    const completedContribs = memberContribs.filter(c => c.status === 'completed');
    const lastContrib = completedContribs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const pendingWithdrawals = memberWithdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0);

    const savingsBalance = totalContributed - pendingWithdrawals;

    return {
      totalContributed,
      totalFines,
      finesPaid,
      finesUnpaid,
      activeLoanBalance,
      totalLoansTaken,
      savingsBalance,
      contributionStreak: completedContribs.length,
      lastContributionDate: lastContrib?.date || 'N/A',
      pendingWithdrawals,
    };
  };

  const unreadNotifications = notificationsList.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        members, contributions, loans, meetings, merryGoRoundCycles,
        transactions, notifications: notificationsList, fines,
        deposits: depositsData, withdrawRequests: withdrawRequestsData,
        loanRepayments, stats: initialStats, isAuthenticated,
        currentUser, portalMode, login, logout, addMember, addContribution,
        applyLoan, approveLoan, rejectLoan, addMeeting, markNotificationRead,
        unreadNotifications, addDeposit, addWithdrawRequest, getMemberStats,
        getMemberContributions, getMemberFines, getMemberLoans,
        getMemberTransactions, getMemberDeposits, getMemberWithdrawals,
        getMemberLoanRepayments, getMemberNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}