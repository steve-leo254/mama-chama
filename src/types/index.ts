// src/types/index.ts
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'admin' | 'treasurer' | 'secretary' | 'member';
  joinDate: string;
  totalContributed: number;
  totalBorrowed: number;
  status: 'active' | 'inactive' | 'suspended';
  nextOfKin: string;
  nationalId: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  month: string;
  type: 'monthly' | 'special' | 'penalty' | 'merry-go-round';
  status: 'completed' | 'pending' | 'overdue';
  method: 'mpesa' | 'bank' | 'cash';
  reference: string;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  interestRate: number;
  totalRepayable: number;
  amountPaid: number;
  monthlyPayment: number;
  purpose: string;
  applicationDate: string;
  approvalDate?: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'rejected';
  guarantors: string[];
  duration: number; // months
}

export interface LoanRepaymentRecord {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  method: 'mpesa' | 'bank' | 'cash';
  reference: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'monthly' | 'special' | 'agm' | 'emergency';
  agenda: string[];
  attendees: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  minutes?: string;
}

export interface MerryGoRoundCycle {
  id: string;
  cycle: number;
  recipientId: string;
  recipientName: string;
  amount: number;
  date: string;
  status: 'upcoming' | 'completed' | 'current';
}

export interface Transaction {
  id: string;
  type: 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'penalty' | 'interest' | 'merry_go_round';
  amount: number;
  date: string;
  description: string;
  memberId: string;
  memberName: string;
}

export interface ChamaStats {
  totalMembers: number;
  totalContributions: number;
  totalLoansActive: number;
  totalLoansAmount: number;
  availableBalance: number;
  monthlyTarget: number;
  monthlyCollected: number;
  nextMeeting: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}