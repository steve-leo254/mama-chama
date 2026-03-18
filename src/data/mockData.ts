// src/data/mockData.ts
import type { Member, Contribution, Loan, Meeting, MerryGoRoundCycle, Transaction, Notification, ChamaStats } from '../types';

export const members: Member[] = [
  {
    id: '1',
    name: 'Jane Wanjiku',
    email: 'jane@example.com',
    phone: '+254 712 345 678',
    avatar: '👩🏾',
    role: 'admin',
    joinDate: '2023-01-15',
    totalContributed: 45000,
    totalBorrowed: 30000,
    status: 'active',
    nextOfKin: 'John Wanjiku',
    nationalId: '12345678'
  },
  {
    id: '2',
    name: 'Peter Kamau',
    email: 'peter@example.com',
    phone: '+254 723 456 789',
    avatar: '👨🏾',
    role: 'treasurer',
    joinDate: '2023-02-20',
    totalContributed: 42000,
    totalBorrowed: 25000,
    status: 'active',
    nextOfKin: 'Mary Kamau',
    nationalId: '23456789'
  },
  {
    id: '3',
    name: 'Grace Achieng',
    email: 'grace@example.com',
    phone: '+254 734 567 890',
    avatar: '👩🏽',
    role: 'member',
    joinDate: '2023-03-10',
    totalContributed: 38000,
    totalBorrowed: 20000,
    status: 'active',
    nextOfKin: 'Samuel Achieng',
    nationalId: '34567890'
  }
];

export const contributions: Contribution[] = [
  {
    id: 'c1',
    memberId: '1',
    memberName: 'Jane Wanjiku',
    amount: 5000,
    date: '2024-01-15',
    month: 'January 2024',
    type: 'monthly',
    status: 'completed',
    method: 'mpesa',
    reference: 'MP123456'
  },
  {
    id: 'c2',
    memberId: '2',
    memberName: 'Peter Kamau',
    amount: 5000,
    date: '2024-01-16',
    month: 'January 2024',
    type: 'monthly',
    status: 'completed',
    method: 'bank',
    reference: 'BK789012'
  }
];

export const loans: Loan[] = [
  {
    id: 'l1',
    memberId: '1',
    memberName: 'Jane Wanjiku',
    amount: 30000,
    interestRate: 10,
    totalRepayable: 33000,
    amountPaid: 15000,
    monthlyPayment: 5500,
    purpose: 'Business expansion',
    applicationDate: '2024-01-10',
    approvalDate: '2024-01-12',
    dueDate: '2024-07-12',
    status: 'active',
    guarantors: ['2', '3'],
    duration: 6
  }
];

export const meetings: Meeting[] = [
  {
    id: 'm1',
    title: 'Monthly General Meeting',
    date: '2024-02-15',
    time: '10:00 AM',
    location: 'Community Hall',
    type: 'monthly',
    agenda: ['Review financial reports', 'New member applications', 'Loan requests'],
    attendees: ['1', '2', '3'],
    status: 'upcoming'
  }
];

export const merryGoRoundCycles: MerryGoRoundCycle[] = [
  {
    id: 'mgr1',
    cycle: 1,
    recipientId: '1',
    recipientName: 'Jane Wanjiku',
    amount: 15000,
    date: '2024-02-01',
    status: 'current'
  },
  {
    id: 'mgr2',
    cycle: 2,
    recipientId: '2',
    recipientName: 'Peter Kamau',
    amount: 15000,
    date: '2024-03-01',
    status: 'upcoming'
  }
];

export const transactions: Transaction[] = [
  {
    id: 't1',
    type: 'contribution',
    amount: 5000,
    date: '2024-01-15',
    description: 'Monthly contribution',
    memberId: '1',
    memberName: 'Jane Wanjiku'
  },
  {
    id: 't2',
    type: 'loan_disbursement',
    amount: 30000,
    date: '2024-01-12',
    description: 'Business loan',
    memberId: '1',
    memberName: 'Jane Wanjiku'
  }
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'New Loan Application',
    message: 'Peter Kamau has applied for a loan of KES 25,000',
    type: 'info',
    date: '2024-01-20',
    read: false
  },
  {
    id: 'n2',
    title: 'Contribution Reminder',
    message: 'Monthly contributions for February are now due',
    type: 'warning',
    date: '2024-02-01',
    read: false
  }
];

export const chamaStats: ChamaStats = {
  totalMembers: 3,
  totalContributions: 125000,
  totalLoansActive: 1,
  totalLoansAmount: 30000,
  availableBalance: 95000,
  monthlyTarget: 15000,
  monthlyCollected: 10000,
  nextMeeting: '2024-02-15'
};

export const monthlyContributionData = [
  { month: 'Jan', actual: 12000, target: 15000 },
  { month: 'Feb', actual: 14500, target: 15000 },
  { month: 'Mar', actual: 15000, target: 15000 },
  { month: 'Apr', actual: 13500, target: 15000 },
  { month: 'May', actual: 16000, target: 15000 },
  { month: 'Jun', actual: 15000, target: 15000 }
];