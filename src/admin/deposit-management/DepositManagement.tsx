import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, ArrowUpDown, Printer, Download } from 'lucide-react';
import { depositsAPI, transactionsAPI, withdrawRequestsAPI, loansAPI, finesAPI } from '../../services/api';
import type { DepositRecord, Transaction } from '../../types';
import './DepositManagement.css';

interface TransactionStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  total_amount: number;
}

interface AllTransaction {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  date: string;
  type: string;
  method: string;
  reference: string | null;
  status: string;
  description: string | null;
  category: 'deposit' | 'withdrawal' | 'loan' | 'fine' | 'transaction';
}

const DepositManagement: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<AllTransaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    total_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTransactions();
  }, [statusFilter, typeFilter]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      
      const allData: AllTransaction[] = [];
      
      try {
        // Get deposits
        const deposits = await depositsAPI.listAll(statusFilter, typeFilter);
        console.log('Admin deposits API response:', deposits);
        const depositTransactions = deposits.map(d => ({
          ...d,
          category: 'deposit' as const
        }));
        allData.push(...depositTransactions);
      } catch (adminError) {
        console.log('Admin deposits endpoint failed, trying regular endpoint:', adminError);
        const deposits = await depositsAPI.list();
        console.log('Regular deposits API response:', deposits);
        const depositTransactions = deposits.map(d => ({
          ...d,
          category: 'deposit' as const
        }));
        allData.push(...depositTransactions);
      }
      
      try {
        // Get transactions
        const transactions = await transactionsAPI.list();
        console.log('Transactions API response:', transactions);
        const transactionData = transactions.map(t => ({
          id: t.id,
          member_id: t.member_id,
          member_name: t.member_name,
          amount: t.amount,
          date: t.date,
          type: t.type,
          method: (t as any).method || 'unknown',
          reference: (t as any).reference || null,
          status: (t as any).status || 'completed',
          description: t.description,
          category: 'transaction' as const
        }));
        allData.push(...transactionData);
      } catch (transError) {
        console.log('Transactions endpoint failed:', transError);
      }
      
      try {
        // Get withdrawal requests
        const withdrawals = await withdrawRequestsAPI.list();
        console.log('Withdrawals API response:', withdrawals);
        const withdrawalData = withdrawals.map(w => ({
          id: w.id,
          member_id: w.member_id,
          member_name: w.member_name,
          amount: w.amount,
          date: w.date,
          type: 'withdrawal',
          method: w.method,
          reference: (w as any).reference || null,
          status: w.status,
          description: `Withdrawal - ${w.reason || 'Unknown reason'}`,
          category: 'withdrawal' as const
        }));
        allData.push(...withdrawalData);
      } catch (withdrawError) {
        console.log('Withdrawals endpoint failed:', withdrawError);
      }
      
      try {
        // Get loans
        const loans = await loansAPI.list();
        console.log('Loans API response:', loans);
        const loanData = loans.map(l => ({
          id: l.id,
          member_id: l.member_id,
          member_name: l.member_name,
          amount: l.amount,
          date: (l as any).date || new Date().toISOString().split('T')[0],
          type: 'loan_disbursement',
          method: (l as any).method || 'bank',
          reference: (l as any).reference || null,
          status: l.status,
          description: `Loan - ${(l as any).purpose || 'Unknown purpose'}`,
          category: 'loan' as const
        }));
        allData.push(...loanData);
      } catch (loanError) {
        console.log('Loans endpoint failed:', loanError);
      }
      
      try {
        // Get fines
        const fines = await finesAPI.list();
        console.log('Fines API response:', fines);
        const fineData = fines.map(f => ({
          id: f.id,
          member_id: f.member_id,
          member_name: f.member_name,
          amount: f.amount,
          date: (f as any).date || new Date().toISOString().split('T')[0],
          type: 'fine_payment',
          method: (f as any).method || 'cash',
          reference: (f as any).reference || null,
          status: f.status,
          description: `Fine - ${(f as any).reason || 'Unknown reason'}`,
          category: 'fine' as const
        }));
        allData.push(...fineData);
      } catch (fineError) {
        console.log('Fines endpoint failed:', fineError);
      }
      
      // Sort by date (newest first)
      allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAllTransactions(allData);
      
      // Calculate stats
      const transactionStats = allData.reduce((acc: TransactionStats, transaction: AllTransaction) => {
        acc.total++;
        acc.total_amount += transaction.amount;
        
        if (transaction.status === 'pending') acc.pending++;
        else if (transaction.status === 'completed') acc.completed++;
        else if (transaction.status === 'failed') acc.failed++;
        
        return acc;
      }, { total: 0, pending: 0, completed: 0, failed: 0, total_amount: 0 });
      
      setStats(transactionStats);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDepositStatus = async (transactionId: string, newStatus: string, category: string) => {
    try {
      setUpdatingId(transactionId);
      
      // Check if user has admin role
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userRole = payload.role;
          
          if (!['admin', 'treasurer', 'secretary'].includes(userRole)) {
            console.error('Access denied: Admin privileges required for this action');
            alert('You need admin privileges to approve/reject transactions. Please contact an administrator.');
            return;
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      
      let endpoint = '';
      let payload: any = {};
      
      // Determine the correct endpoint based on transaction category
      switch (category) {
        case 'deposit':
          endpoint = `http://localhost:8000/api/deposits/${transactionId}`;
          payload = { status: newStatus };
          break;
        case 'withdrawal':
          if (newStatus === 'completed') {
            endpoint = `http://localhost:8000/api/withdrawals/${transactionId}/approve`;
            payload = {};
          } else if (newStatus === 'failed') {
            endpoint = `http://localhost:8000/api/withdrawals/${transactionId}/reject`;
            payload = {};
          } else if (newStatus === 'pending') {
            console.log('Cannot reset withdrawal to pending status');
            return;
          }
          break;
        case 'loan':
          if (newStatus === 'completed') {
            endpoint = `http://localhost:8000/api/loans/${transactionId}/approve`;
            payload = {};
          } else if (newStatus === 'failed') {
            endpoint = `http://localhost:8000/api/loans/${transactionId}/reject`;
            payload = {};
          } else if (newStatus === 'pending') {
            console.log('Cannot reset loan to pending status');
            return;
          }
          break;
        case 'fine':
          endpoint = `http://localhost:8000/api/fines/${transactionId}/pay`;
          payload = {};
          break;
        case 'transaction':
          // For general transactions, try the deposits endpoint as fallback
          endpoint = `http://localhost:8000/api/deposits/${transactionId}`;
          payload = { status: newStatus };
          break;
        default:
          console.error('Unknown transaction category:', category);
          return;
      }
      
      console.log(`Updating ${category} transaction ${transactionId} to status ${newStatus} via ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        fetchAllTransactions(); // Refresh the list
        console.log(`Successfully updated ${category} transaction status`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          console.error('Authentication failed: Invalid or expired token');
          alert('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          console.error('Access denied: Insufficient permissions');
          alert('Access denied. You need higher privileges to perform this action.');
        } else {
          console.error(`Error updating ${category} transaction status:`, response.status, errorData);
          alert(`Failed to update transaction: ${errorData.detail || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      alert('An error occurred while updating the transaction. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Prepare summary data
    const summaryContent = `
      <div class="summary-grid">
        <div class="summary-card blue">
          <div class="summary-label">Total Transactions</div>
          <div class="summary-value">${stats.total}</div>
        </div>
        <div class="summary-card green">
          <div class="summary-label">Total Amount</div>
          <div class="summary-value">KES ${stats.total_amount.toLocaleString()}</div>
        </div>
        <div class="summary-card yellow">
          <div class="summary-label">Pending</div>
          <div class="summary-value">${stats.pending}</div>
        </div>
        <div class="summary-card emerald">
          <div class="summary-label">Completed</div>
          <div class="summary-value">${stats.completed}</div>
        </div>
        <div class="summary-card red">
          <div class="summary-label">Failed</div>
          <div class="summary-value">${stats.failed}</div>
        </div>
      </div>
    `;

    // Prepare table data
    const tableContent = `
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Reference</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTransactions.map(t => `
            <tr>
              <td>${t.member_name}</td>
              <td><span class="badge badge-${t.category}">${getTypeLabel(t.type)}</span></td>
              <td class="positive">KES ${t.amount.toLocaleString()}</td>
              <td>${t.method}</td>
              <td>${getReferenceDisplay(t)}</td>
              <td>${new Date(t.date).toLocaleDateString()}</td>
              <td><span class="badge badge-${t.status}">${t.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Create print-friendly version with enhanced styling
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Management Report</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              color: #374151;
              line-height: 1.6;
            }
            h1, h2, h3 { 
              color: #1f2937; 
              margin-bottom: 15px;
              font-weight: 600;
            }
            h1 { font-size: 28px; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { font-size: 20px; }
            .header-info { 
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 16px; 
              margin-bottom: 30px;
            }
            .summary-card { 
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .summary-card.blue { border-left: 4px solid #3b82f6; }
            .summary-card.green { border-left: 4px solid #10b981; }
            .summary-card.yellow { border-left: 4px solid #f59e0b; }
            .summary-card.emerald { border-left: 4px solid #059669; }
            .summary-card.red { border-left: 4px solid #ef4444; }
            .summary-label { 
              font-size: 12px; 
              color: #6b7280; 
              text-transform: uppercase; 
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .summary-value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #1f2937;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #e5e7eb;
            }
            th { 
              background: #f9fafb; 
              font-weight: 600; 
              color: #374151;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            tr:hover { background: #f9fafb; }
            .positive { color: #059669; font-weight: 600; }
            .negative { color: #dc2626; font-weight: 600; }
            .badge { 
              padding: 4px 8px; 
              border-radius: 12px; 
              font-size: 11px;
              font-weight: 500;
              text-transform: uppercase;
            }
            .badge-deposit { background: #dbeafe; color: #1d4ed8; }
            .badge-withdrawal { background: #fef3c7; color: #d97706; }
            .badge-loan { background: #fce7f3; color: #be185d; }
            .badge-fine { background: #fee2e2; color: #dc2626; }
            .badge-transaction { background: #f3f4f6; color: #374151; }
            .badge-pending { background: #fef3c7; color: #d97706; }
            .badge-completed { background: #d1fae5; color: #059669; }
            .badge-failed { background: #fee2e2; color: #dc2626; }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { margin: 10px; }
              .summary-card { page-break-inside: avoid; }
              table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>Transaction Management Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>

          <h2>Summary Statistics</h2>
          ${summaryContent}

          <h2>Transaction Details</h2>
          ${tableContent}

          <div class="footer">
            <p>Mama Chama Transaction Management System - Confidential Report</p>
            <p>Total Records: ${filteredTransactions.length}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Wait for the content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Member', 'Type', 'Amount', 'Method', 'Reference', 'Date', 'Status'],
      ...filteredTransactions.map(t => [
        t.member_name,
        getTypeLabel(t.type),
        `KES ${t.amount.toLocaleString()}`,
        t.method,
        getReferenceDisplay(t),
        new Date(t.date).toLocaleDateString(),
        t.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return '💰';
      case 'loan_repayment':
        return '🏦';
      case 'fine_payment':
        return '⚠️';
      case 'savings':
        return '🐷';
      default:
        return '💵';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'Monthly Contribution';
      case 'loan_repayment':
        return 'Loan Repayment';
      case 'fine_payment':
        return 'Fine Payment';
      case 'savings':
        return 'Extra Savings';
      default:
        return type;
    }
  };

  // Helper function to extract reference from description if reference field is empty
  const getReferenceDisplay = (transaction: AllTransaction) => {
    if (transaction.reference && transaction.reference !== '—') {
      return transaction.reference;
    }
    
    // Try to extract reference from description (e.g., "M-Pesa contribution - QK9074801P")
    if (transaction.description) {
      const match = transaction.description.match(/([A-Z]{2}\d{8,}[A-Z]?)/);
      if (match) {
        return match[1];
      }
    }
    
    return '—';
  };

  const filteredTransactions = allTransactions.filter(transaction =>
    transaction.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div id="transaction-content" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600 mt-1">Manage and verify all member transactions</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700">Total Deposits</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          <p className="text-sm text-blue-600">KES {stats.total_amount.toLocaleString()}</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpDown className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-700">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card no-print">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by member name, reference, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="contribution">Monthly Contribution</option>
              <option value="loan_repayment">Loan Repayment</option>
              <option value="fine_payment">Fine Payment</option>
              <option value="savings">Extra Savings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                        {transaction.member_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{transaction.member_name}</div>
                        <div className="text-xs text-gray-500">ID: {transaction.member_id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getTypeLabel(transaction.type)}</div>
                        {transaction.description && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">{transaction.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">KES {transaction.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{transaction.method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getReferenceDisplay(transaction)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(transaction.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{transaction.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="capitalize">{transaction.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap no-print">
                    <div className="flex items-center gap-2">
                      {transaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateDepositStatus(transaction.id, 'completed', transaction.category)}
                            disabled={updatingId === transaction.id}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingId === transaction.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'Approve'
                            )}
                          </button>
                          <button
                            onClick={() => updateDepositStatus(transaction.id, 'failed', transaction.category)}
                            disabled={updatingId === transaction.id}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {transaction.status === 'failed' && (
                        <button
                          onClick={() => updateDepositStatus(transaction.id, 'pending', transaction.category)}
                          disabled={updatingId === transaction.id}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No deposits found</div>
              <div className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositManagement;
