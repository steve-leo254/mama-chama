// src/context/AppContext.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Member, Contribution, Loan, Meeting, MerryGoRoundCycle, Transaction, Notification } from '../types';
import {
  members as initialMembers,
  contributions as initialContributions,
  loans as initialLoans,
  meetings as initialMeetings,
  merryGoRoundCycles as initialCycles,
  transactions as initialTransactions,
  notifications as initialNotifications,
  chamaStats as initialStats,
} from '../data/mockData';

interface AppContextType {
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  meetings: Meeting[];
  merryGoRoundCycles: MerryGoRoundCycle[];
  transactions: Transaction[];
  notifications: Notification[];
  stats: typeof initialStats;
  isAuthenticated: boolean;
  currentUser: Member | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  addContribution: (contribution: Omit<Contribution, 'id'>) => void;
  applyLoan: (loan: Omit<Loan, 'id'>) => void;
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  unreadNotifications: number;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  const login = (email: string, _password: string) => {
    const user = members.find(m => m.email === email);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      return true;
    }
    // Demo: allow any login
    setIsAuthenticated(true);
    setCurrentUser(members[0]);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addMember = (member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: Date.now().toString() };
    setMembers(prev => [...prev, newMember]);
  };

  const addContribution = (contribution: Omit<Contribution, 'id'>) => {
    const newContribution = { ...contribution, id: `c${Date.now()}` };
    setContributions(prev => [newContribution, ...prev]);
    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      type: 'contribution',
      amount: contribution.amount,
      date: contribution.date,
      description: `${contribution.type} contribution`,
      memberId: contribution.memberId,
      memberName: contribution.memberName,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const applyLoan = (loan: Omit<Loan, 'id'>) => {
    const newLoan = { ...loan, id: `l${Date.now()}` };
    setLoans(prev => [...prev, newLoan]);
  };

  const approveLoan = (loanId: string) => {
    setLoans(prev =>
      prev.map(l =>
        l.id === loanId
          ? { ...l, status: 'approved' as const, approvalDate: new Date().toISOString().split('T')[0] }
          : l
      )
    );
  };

  const rejectLoan = (loanId: string) => {
    setLoans(prev =>
      prev.map(l => (l.id === loanId ? { ...l, status: 'rejected' as const } : l))
    );
  };

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting = { ...meeting, id: `m${Date.now()}` };
    setMeetings(prev => [...prev, newMeeting]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadNotifications = notificationsList.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        members,
        contributions,
        loans,
        meetings,
        merryGoRoundCycles,
        transactions,
        notifications: notificationsList,
        stats: initialStats,
        isAuthenticated,
        currentUser,
        login,
        logout,
        addMember,
        addContribution,
        applyLoan,
        approveLoan,
        rejectLoan,
        addMeeting,
        markNotificationRead,
        unreadNotifications,
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