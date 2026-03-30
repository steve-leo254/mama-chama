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
  member_id: string;
  member_name: string;
  amount: number;
  date: string;
  month: string;
  type: 'monthly' | 'special' | 'penalty' | 'merry_go_round';
  status: 'completed' | 'pending' | 'overdue';
  method: 'mpesa' | 'bank' | 'cash';
  reference: string;
}

export interface Loan {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  interest_rate: number;
  total_repayable: number;
  amount_paid: number;
  monthly_payment: number;
  purpose: string;
  application_date: string;
  approval_date?: string;
  due_date: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'rejected';
  guarantors: string[];
  duration: number;
}

export interface LoanRepaymentRecord {
  id: string;
  loan_id: string;
  member_id: string;
  amount: number;
  date: string;
  method: 'mpesa' | 'bank' | 'cash';
  reference: string;
  balance_after: number;
}

export interface Fine {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  reason: string;
  date: string;
  status: 'paid' | 'unpaid';
  paid_date?: string;
  month: string;
}

export interface WithdrawRequest {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: string;
  approved_date?: string;
  method: 'mpesa' | 'bank';
  account_details: string;
}

export interface DepositRecord {
  id: string;
  member_id: string;
  member_name: string;
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
  recipient_id: string;
  recipient_name: string;
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
  member_id: string;
  member_name: string;
  direction: 'in' | 'out';
  balance?: number;
}

export interface ChamaStats {
  total_members: number;
  total_contributions: number;
  total_loans_active: number;
  total_loans_amount: number;
  available_balance: number;
  monthly_target: number;
  monthly_collected: number;
  next_meeting: string;
  total_fines_collected: number;
  total_savings: number;
  totalLoansAmount: number;
  availableBalance: number;
  monthlyTarget: number;
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
  monthlyCollected: number;
  monthlyTarget: number;
}

export interface LoanRepayment {
  id: string;
  loan_id: string;
  member_id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  created_at: string;
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

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export type MessageFolder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'starred' | 'archive';

export interface Message {
  id: string;
  from_user?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  from?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  to_users?: Array<{
    id: string;
    name: string;
  }>;
  to?: Array<{
    id: string;
    name: string;
  }>;
  subject: string;
  body: string;
  date: string;
  time: string;
  preview: string;
  folder: MessageFolder;
  labels: string[];
  attachments: MessageAttachment[];
  category: 'personal' | 'official' | 'announcement' | 'reminder';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read?: boolean;
  starred?: boolean;
  replies: Array<{
    id: string;
    from: {
      id: string;
      name: string;
      avatar: string;
    };
    body: string;
    date: string;
    time: string;
    attachments: MessageAttachment[];
  }>;
}