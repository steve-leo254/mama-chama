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
  password?: string;
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
  duration: number;
}

export interface LoanRepaymentRecord {
  id: string;
  loanId: string;
  memberId: string;
  amount: number;
  date: string;
  method: 'mpesa' | 'bank' | 'cash';
  reference: string;
  balanceAfter: number;
}

export interface Fine {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  reason: string;
  date: string;
  status: 'paid' | 'unpaid';
  paidDate?: string;
  month: string;
}

export interface WithdrawRequest {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedDate?: string;
  method: 'mpesa' | 'bank';
  accountDetails: string;
}

export interface DepositRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  type: 'contribution' | 'loan_repayment' | 'fine_payment' | 'savings';
  method: 'mpesa' | 'bank' | 'cash';
  reference: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
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
  type: 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'penalty' | 'interest' | 'merry_go_round' | 'deposit' | 'withdrawal' | 'fine_payment';
  amount: number;
  date: string;
  description: string;
  memberId: string;
  memberName: string;
  direction: 'in' | 'out';
  balance?: number;
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
  totalFinesCollected: number;
  totalSavings: number;
}

export interface MemberStats {
  totalContributed: number;
  totalFines: number;
  finesPaid: number;
  finesUnpaid: number;
  activeLoanBalance: number;
  totalLoansTaken: number;
  savingsBalance: number;
  contributionStreak: number;
  lastContributionDate: string;
  pendingWithdrawals: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
  memberId?: string;
}