// src/data/mockData.ts
import type {
  Member, Contribution, Loan, Meeting, MerryGoRoundCycle,
  Transaction, ChamaStats, Notification as AppNotification, Fine,
  DepositRecord, WithdrawRequest, LoanRepaymentRecord
} from '../types';

export const members: Member[] = [
  {
    id: '1', name: 'Mary Wanjiku', email: 'mary@email.com', phone: '+254 712 345 678',
    avatar: '👩🏾', role: 'admin', joinDate: '2023-01-15', totalContributed: 120000,
    totalBorrowed: 50000, status: 'active', nextOfKin: 'John Kamau', nationalId: '12345678',
  },
  {
    id: '2', name: 'Grace Akinyi', email: 'grace@email.com', phone: '+254 723 456 789',
    avatar: '👩🏿', role: 'treasurer', joinDate: '2023-01-15', totalContributed: 115000,
    totalBorrowed: 30000, status: 'active', nextOfKin: 'Peter Odhiambo', nationalId: '23456789',
  },
  {
    id: '3', name: 'Faith Muthoni', email: 'faith@email.com', phone: '+254 734 567 890',
    avatar: '👩🏽', role: 'secretary', joinDate: '2023-02-01', totalContributed: 110000,
    totalBorrowed: 0, status: 'active', nextOfKin: 'James Muthoni', nationalId: '34567890',
  },
  {
    id: '4', name: 'Agnes Njeri', email: 'agnes@email.com', phone: '+254 745 678 901',
    avatar: '👩🏾‍🦱', role: 'member', joinDate: '2023-03-01', totalContributed: 95000,
    totalBorrowed: 40000, status: 'active', nextOfKin: 'David Njeru', nationalId: '45678901',
  },
  {
    id: '5', name: 'Esther Wambui', email: 'esther@email.com', phone: '+254 756 789 012',
    avatar: '👩🏿‍🦱', role: 'member', joinDate: '2023-03-15', totalContributed: 90000,
    totalBorrowed: 25000, status: 'active', nextOfKin: 'Samuel Wambui', nationalId: '56789012',
  },
  {
    id: '6', name: 'Joyce Nyambura', email: 'joyce@email.com', phone: '+254 767 890 123',
    avatar: '👩🏽‍🦱', role: 'member', joinDate: '2023-04-01', totalContributed: 85000,
    totalBorrowed: 0, status: 'active', nextOfKin: 'Michael Nyambura', nationalId: '67890123',
  },
  {
    id: '7', name: 'Catherine Auma', email: 'catherine@email.com', phone: '+254 778 901 234',
    avatar: '👩🏾‍🦳', role: 'member', joinDate: '2023-05-01', totalContributed: 75000,
    totalBorrowed: 20000, status: 'active', nextOfKin: 'Robert Auma', nationalId: '78901234',
  },
  {
    id: '8', name: 'Mercy Chebet', email: 'mercy@email.com', phone: '+254 789 012 345',
    avatar: '👩🏿‍🦳', role: 'member', joinDate: '2023-06-01', totalContributed: 60000,
    totalBorrowed: 0, status: 'inactive', nextOfKin: 'Daniel Chebet', nationalId: '89012345',
  },
];

export const contributions: Contribution[] = [
  { id: 'c1', memberId: '1', memberName: 'Mary Wanjiku', amount: 5000, date: '2024-12-01', month: 'December 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE123456' },
  { id: 'c2', memberId: '2', memberName: 'Grace Akinyi', amount: 5000, date: '2024-12-02', month: 'December 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE234567' },
  { id: 'c3', memberId: '3', memberName: 'Faith Muthoni', amount: 5000, date: '2024-12-03', month: 'December 2024', type: 'monthly', status: 'completed', method: 'bank', reference: 'BNK345678' },
  { id: 'c4', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-12-05', month: 'December 2024', type: 'monthly', status: 'pending', method: 'mpesa', reference: '' },
  { id: 'c5', memberId: '5', memberName: 'Esther Wambui', amount: 5000, date: '2024-12-04', month: 'December 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE456789' },
  { id: 'c6', memberId: '6', memberName: 'Joyce Nyambura', amount: 5000, date: '2024-12-05', month: 'December 2024', type: 'monthly', status: 'overdue', method: 'mpesa', reference: '' },
  { id: 'c7', memberId: '7', memberName: 'Catherine Auma', amount: 5000, date: '2024-12-01', month: 'December 2024', type: 'monthly', status: 'completed', method: 'cash', reference: 'CSH567890' },
  { id: 'c8', memberId: '1', memberName: 'Mary Wanjiku', amount: 10000, date: '2024-12-10', month: 'December 2024', type: 'special', status: 'completed', method: 'mpesa', reference: 'QWE678901' },
  { id: 'c9', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-11-03', month: 'November 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE111222' },
  { id: 'c10', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-10-02', month: 'October 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE333444' },
  { id: 'c11', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-09-01', month: 'September 2024', type: 'monthly', status: 'completed', method: 'bank', reference: 'BNK555666' },
  { id: 'c12', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-08-03', month: 'August 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE777888' },
  { id: 'c13', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-07-05', month: 'July 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE999000' },
  { id: 'c14', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-06-01', month: 'June 2024', type: 'monthly', status: 'completed', method: 'cash', reference: 'CSH112233' },
  { id: 'c15', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-05-02', month: 'May 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE445566' },
  { id: 'c16', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-04-04', month: 'April 2024', type: 'monthly', status: 'completed', method: 'mpesa', reference: 'QWE778899' },
  { id: 'c17', memberId: '4', memberName: 'Agnes Njeri', amount: 10000, date: '2024-08-15', month: 'August 2024', type: 'special', status: 'completed', method: 'mpesa', reference: 'QWE_SP_01' },
];

export const fines: Fine[] = [
  { id: 'f1', memberId: '4', memberName: 'Agnes Njeri', amount: 500, reason: 'Late contribution - November', date: '2024-11-10', status: 'paid', paidDate: '2024-11-15', month: 'November 2024' },
  { id: 'f2', memberId: '4', memberName: 'Agnes Njeri', amount: 200, reason: 'Absent from October meeting', date: '2024-10-20', status: 'paid', paidDate: '2024-10-25', month: 'October 2024' },
  { id: 'f3', memberId: '4', memberName: 'Agnes Njeri', amount: 500, reason: 'Late contribution - December', date: '2024-12-08', status: 'unpaid', month: 'December 2024' },
  { id: 'f4', memberId: '6', memberName: 'Joyce Nyambura', amount: 500, reason: 'Late contribution - December', date: '2024-12-08', status: 'unpaid', month: 'December 2024' },
  { id: 'f5', memberId: '6', memberName: 'Joyce Nyambura', amount: 500, reason: 'Late contribution - November', date: '2024-11-08', status: 'paid', paidDate: '2024-11-20', month: 'November 2024' },
  { id: 'f6', memberId: '8', memberName: 'Mercy Chebet', amount: 500, reason: 'Late contribution - October', date: '2024-10-10', status: 'unpaid', month: 'October 2024' },
  { id: 'f7', memberId: '1', memberName: 'Mary Wanjiku', amount: 200, reason: 'Late to September meeting', date: '2024-09-15', status: 'paid', paidDate: '2024-09-16', month: 'September 2024' },
];

export const loans: Loan[] = [
  {
    id: 'l1', memberId: '1', memberName: 'Mary Wanjiku', amount: 50000, interestRate: 10,
    totalRepayable: 55000, amountPaid: 30000, monthlyPayment: 9167, purpose: 'School fees',
    applicationDate: '2024-09-01', approvalDate: '2024-09-05', dueDate: '2025-03-01',
    status: 'active', guarantors: ['Grace Akinyi', 'Faith Muthoni'], duration: 6,
  },
  {
    id: 'l2', memberId: '4', memberName: 'Agnes Njeri', amount: 40000, interestRate: 10,
    totalRepayable: 44000, amountPaid: 44000, monthlyPayment: 11000, purpose: 'Business stock',
    applicationDate: '2024-06-01', approvalDate: '2024-06-03', dueDate: '2024-10-01',
    status: 'completed', guarantors: ['Mary Wanjiku', 'Esther Wambui'], duration: 4,
  },
  {
    id: 'l3', memberId: '5', memberName: 'Esther Wambui', amount: 25000, interestRate: 10,
    totalRepayable: 27500, amountPaid: 10000, monthlyPayment: 6875, purpose: 'Medical emergency',
    applicationDate: '2024-11-01', approvalDate: '2024-11-03', dueDate: '2025-03-01',
    status: 'active', guarantors: ['Agnes Njeri', 'Joyce Nyambura'], duration: 4,
  },
  {
    id: 'l4', memberId: '7', memberName: 'Catherine Auma', amount: 20000, interestRate: 10,
    totalRepayable: 22000, amountPaid: 0, monthlyPayment: 7334, purpose: 'Home improvement',
    applicationDate: '2024-12-10', dueDate: '2025-03-10',
    status: 'pending', guarantors: ['Grace Akinyi'], duration: 3,
  },
  {
    id: 'l5', memberId: '4', memberName: 'Agnes Njeri', amount: 30000, interestRate: 10,
    totalRepayable: 33000, amountPaid: 8250, monthlyPayment: 8250, purpose: 'Shop renovation',
    applicationDate: '2024-11-15', approvalDate: '2024-11-18', dueDate: '2025-03-15',
    status: 'active', guarantors: ['Mary Wanjiku', 'Grace Akinyi'], duration: 4,
  },
];

export const loanRepayments: LoanRepaymentRecord[] = [
  { id: 'lr1', loanId: 'l2', memberId: '4', amount: 11000, date: '2024-07-01', method: 'mpesa', reference: 'LR_001', balanceAfter: 33000 },
  { id: 'lr2', loanId: 'l2', memberId: '4', amount: 11000, date: '2024-08-01', method: 'mpesa', reference: 'LR_002', balanceAfter: 22000 },
  { id: 'lr3', loanId: 'l2', memberId: '4', amount: 11000, date: '2024-09-01', method: 'bank', reference: 'LR_003', balanceAfter: 11000 },
  { id: 'lr4', loanId: 'l2', memberId: '4', amount: 11000, date: '2024-10-01', method: 'mpesa', reference: 'LR_004', balanceAfter: 0 },
  { id: 'lr5', loanId: 'l5', memberId: '4', amount: 8250, date: '2024-12-15', method: 'mpesa', reference: 'LR_005', balanceAfter: 24750 },
];

export const deposits: DepositRecord[] = [
  { id: 'd1', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-12-05', type: 'contribution', method: 'mpesa', reference: 'DEP_001', status: 'pending', description: 'Monthly contribution - December' },
  { id: 'd2', memberId: '4', memberName: 'Agnes Njeri', amount: 5000, date: '2024-11-03', type: 'contribution', method: 'mpesa', reference: 'DEP_002', status: 'completed', description: 'Monthly contribution - November' },
  { id: 'd3', memberId: '4', memberName: 'Agnes Njeri', amount: 8250, date: '2024-12-15', type: 'loan_repayment', method: 'mpesa', reference: 'DEP_003', status: 'completed', description: 'Loan repayment - Shop renovation' },
  { id: 'd4', memberId: '4', memberName: 'Agnes Njeri', amount: 700, date: '2024-11-15', type: 'fine_payment', method: 'mpesa', reference: 'DEP_004', status: 'completed', description: 'Fine payment - Late contribution & absence' },
  { id: 'd5', memberId: '4', memberName: 'Agnes Njeri', amount: 10000, date: '2024-08-15', type: 'savings', method: 'mpesa', reference: 'DEP_005', status: 'completed', description: 'Extra savings deposit' },
];

export const withdrawRequests: WithdrawRequest[] = [
  { id: 'w1', memberId: '4', memberName: 'Agnes Njeri', amount: 15000, reason: 'Emergency medical bills', date: '2024-11-20', status: 'completed', approvedBy: 'Mary Wanjiku', approvedDate: '2024-11-21', method: 'mpesa', accountDetails: '+254 745 678 901' },
  { id: 'w2', memberId: '4', memberName: 'Agnes Njeri', amount: 10000, reason: 'School fees top up', date: '2024-12-18', status: 'pending', method: 'mpesa', accountDetails: '+254 745 678 901' },
];

export const meetings: Meeting[] = [
  {
    id: 'm1', title: 'December Monthly Meeting', date: '2024-12-21', time: '2:00 PM',
    location: "Mary's Home, Westlands", type: 'monthly',
    agenda: ['Review November finances', 'Loan applications review', 'Christmas party planning', 'Merry-go-round disbursement'],
    attendees: ['1', '2', '3', '4', '5', '6', '7'], status: 'upcoming',
  },
  {
    id: 'm2', title: 'November Monthly Meeting', date: '2024-11-16', time: '2:00 PM',
    location: "Grace's Home, Karen", type: 'monthly',
    agenda: ['Review October finances', 'New member proposal', 'Investment discussion'],
    attendees: ['1', '2', '3', '4', '5', '6', '7', '8'], status: 'completed',
    minutes: 'All agenda items discussed. Investment in treasury bonds approved.',
  },
  {
    id: 'm3', title: 'Year End AGM', date: '2025-01-11', time: '10:00 AM',
    location: 'Serena Hotel, Conference Room B', type: 'agm',
    agenda: ['Annual financial report', 'Election of officials', '2025 goals and budget', 'Constitution amendments'],
    attendees: [], status: 'upcoming',
  },
];

export const merryGoRoundCycles: MerryGoRoundCycle[] = [
  { id: 'mgr1', cycle: 1, recipientId: '1', recipientName: 'Mary Wanjiku', amount: 35000, date: '2024-07-15', status: 'completed' },
  { id: 'mgr2', cycle: 2, recipientId: '2', recipientName: 'Grace Akinyi', amount: 35000, date: '2024-08-15', status: 'completed' },
  { id: 'mgr3', cycle: 3, recipientId: '3', recipientName: 'Faith Muthoni', amount: 35000, date: '2024-09-15', status: 'completed' },
  { id: 'mgr4', cycle: 4, recipientId: '4', recipientName: 'Agnes Njeri', amount: 35000, date: '2024-10-15', status: 'completed' },
  { id: 'mgr5', cycle: 5, recipientId: '5', recipientName: 'Esther Wambui', amount: 35000, date: '2024-11-15', status: 'completed' },
  { id: 'mgr6', cycle: 6, recipientId: '6', recipientName: 'Joyce Nyambura', amount: 35000, date: '2024-12-21', status: 'current' },
  { id: 'mgr7', cycle: 7, recipientId: '7', recipientName: 'Catherine Auma', amount: 35000, date: '2025-01-15', status: 'upcoming' },
  { id: 'mgr8', cycle: 8, recipientId: '8', recipientName: 'Mercy Chebet', amount: 35000, date: '2025-02-15', status: 'upcoming' },
];

export const recentTransactions: Transaction[] = [
  { id: 't1', type: 'contribution', amount: 5000, date: '2024-12-04', description: 'Monthly contribution - Dec', memberId: '5', memberName: 'Esther Wambui', direction: 'in' },
  { id: 't2', type: 'contribution', amount: 5000, date: '2024-12-03', description: 'Monthly contribution - Dec', memberId: '3', memberName: 'Faith Muthoni', direction: 'in' },
  { id: 't3', type: 'loan_repayment', amount: 9167, date: '2024-12-03', description: 'Loan repayment', memberId: '1', memberName: 'Mary Wanjiku', direction: 'in' },
  { id: 't4', type: 'contribution', amount: 5000, date: '2024-12-02', description: 'Monthly contribution - Dec', memberId: '2', memberName: 'Grace Akinyi', direction: 'in' },
  { id: 't5', type: 'contribution', amount: 10000, date: '2024-12-02', description: 'Special contribution', memberId: '1', memberName: 'Mary Wanjiku', direction: 'in' },
  { id: 't6', type: 'loan_disbursement', amount: 25000, date: '2024-11-03', description: 'Loan disbursement', memberId: '5', memberName: 'Esther Wambui', direction: 'out' },
  { id: 't7', type: 'merry_go_round', amount: 35000, date: '2024-11-15', description: 'Merry-go-round payout', memberId: '5', memberName: 'Esther Wambui', direction: 'out' },
  { id: 't8', type: 'penalty', amount: 500, date: '2024-11-10', description: 'Late contribution penalty', memberId: '8', memberName: 'Mercy Chebet', direction: 'in' },
  { id: 't9', type: 'deposit', amount: 8250, date: '2024-12-15', description: 'Loan repayment deposit', memberId: '4', memberName: 'Agnes Njeri', direction: 'in' },
  { id: 't10', type: 'withdrawal', amount: 15000, date: '2024-11-20', description: 'Emergency withdrawal', memberId: '4', memberName: 'Agnes Njeri', direction: 'out' },
  { id: 't11', type: 'fine_payment', amount: 700, date: '2024-11-15', description: 'Fine payment', memberId: '4', memberName: 'Agnes Njeri', direction: 'in' },
  { id: 't12', type: 'deposit', amount: 10000, date: '2024-08-15', description: 'Extra savings deposit', memberId: '4', memberName: 'Agnes Njeri', direction: 'in' },
];

export const chamaStats: ChamaStats = {
  totalMembers: 8,
  totalContributions: 750000,
  totalLoansActive: 3,
  totalLoansAmount: 105000,
  availableBalance: 520000,
  monthlyTarget: 40000,
  monthlyCollected: 30000,
  nextMeeting: '2024-12-21',
  totalFinesCollected: 3600,
  totalSavings: 850000,
};

export const notifications: AppNotification[] = [
  { id: 'n1', title: 'Contribution Received', message: "Your December contribution of KES 5,000 is pending confirmation", type: 'warning', date: '2024-12-05', read: false, memberId: '4' },
  { id: 'n2', title: 'Fine Issued', message: 'Late contribution fine of KES 500 for December', type: 'error', date: '2024-12-08', read: false, memberId: '4' },
  { id: 'n3', title: 'Loan Repayment Confirmed', message: 'Loan repayment of KES 8,250 received successfully', type: 'success', date: '2024-12-15', read: false, memberId: '4' },
  { id: 'n4', title: 'Withdrawal Request', message: 'Your withdrawal request of KES 10,000 is pending approval', type: 'info', date: '2024-12-18', read: false, memberId: '4' },
  { id: 'n5', title: 'Meeting Reminder', message: 'Monthly meeting on Dec 21st at 2:00 PM', type: 'info', date: '2024-12-14', read: true, memberId: '4' },
  { id: 'n6', title: 'Contribution Received', message: "Esther Wambui's December contribution received", type: 'success', date: '2024-12-04', read: false },
  { id: 'n7', title: 'Loan Application', message: 'Catherine Auma has applied for a loan of KES 20,000', type: 'info', date: '2024-12-10', read: false },
];

export const monthlyContributionData = [
  { month: 'Jul', amount: 38000, target: 40000 },
  { month: 'Aug', amount: 40000, target: 40000 },
  { month: 'Sep', amount: 37000, target: 40000 },
  { month: 'Oct', amount: 40000, target: 40000 },
  { month: 'Nov', amount: 39000, target: 40000 },
  { month: 'Dec', amount: 30000, target: 40000 },
];