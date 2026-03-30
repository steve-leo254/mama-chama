// src/components/member-portal/my-reports/MyReports.tsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../ui/Badge';
import ProgressBar from '../../ui/ProgressBar';
import { PiggyBank, AlertTriangle, HandCoins, Download, FileText, Printer, Calendar, ArrowUpRight, ArrowDownLeft, List } from 'lucide-react';

export default function MyReports() {
  const {
    currentUser, getMemberStats, getMemberContributions, getMemberFines,
    getMemberLoans, getMemberLoanRepayments, getMemberTransactions
  } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'contributions' | 'fines' | 'loans'>('all');
  const [stats, setStats] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Print function
  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      // Create print-friendly version
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${currentUser?.name} - Transaction Statement</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #1f2937; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .positive { color: #059669; }
                .negative { color: #dc2626; }
                .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>${currentUser?.name} - Transaction Statement</h1>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // PDF Export function
  const handleExportPDF = () => {
    if (printRef.current) {
      const tableContent = printRef.current.querySelector('table');
      if (!tableContent) return;

      // Create CSV content for simple PDF export
      let csvContent = 'Date,Type,Description,Amount,Status\\n';
      
      // Add contributions
      myContributions.forEach(c => {
        csvContent += `${c.date},Contribution,"${c.month} - ${c.type}",+KES ${c.amount},${c.status}\\n`;
      });
      
      // Add loans
      myLoans.forEach(l => {
        csvContent += `${l.application_date},Loan,"${l.purpose}",-KES ${l.amount},${l.status}\\n`;
      });
      
      // Add fines
      myFines.forEach(f => {
        csvContent += `${f.date},Fine,"${f.reason}",-KES ${f.amount},${f.status}\\n`;
      });
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${currentUser?.name}_transaction_statement.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    const loadStats = async () => {
      try {
        const memberStats = await getMemberStats(currentUser.id);
        setStats(memberStats);
      } catch (err) {
        console.error('Failed to load member stats:', err);
        setStats({
          totalContributed: 0,
          totalFines: 0,
          finesPaid: 0,
          finesUnpaid: 0,
          activeLoanBalance: 0,
          totalLoansTaken: 0,
          savingsBalance: 0,
          contributionStreak: 0,
          lastContributionDate: null,
          pendingWithdrawals: 0,
        });
      }
    };

    loadStats();
  }, [currentUser, getMemberStats]);

  if (!currentUser || !stats) return null;

  // Show loading state while stats are being fetched
  if (stats && typeof stats.totalContributed === 'undefined') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your reports...</p>
        </div>
      </div>
    );
  }

  const myContributions = getMemberContributions(currentUser.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const myFines = getMemberFines(currentUser.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const myLoans = getMemberLoans(currentUser.id);
  const myRepayments = getMemberLoanRepayments(currentUser.id);

  const tabs = [
    { key: 'all' as const, label: 'All Transactions', icon: List },
    { key: 'contributions' as const, label: 'Contribution Statement', icon: PiggyBank },
    { key: 'fines' as const, label: 'Fine Statement', icon: AlertTriangle },
    { key: 'loans' as const, label: 'Loan Statement', icon: HandCoins },
  ];

  // Contribution running balance
  let contribRunning = 0;
  const contribsWithBalance = [...myContributions].reverse().map(c => {
    if (c.status === 'completed') contribRunning += c.amount;
    return { ...c, runningBalance: contribRunning } as (typeof c & { runningBalance: number });
  }).reverse();

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
          <p className="text-gray-500 text-sm">Personal financial statements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ====== ALL TRANSACTIONS ====== */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <List className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-bold text-gray-900">All Transactions</h3>
                <p className="text-sm text-gray-500">{currentUser.name} • Complete transaction history</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Contributed</p>
                <p className="text-lg font-bold text-emerald-700">KES {stats.totalContributed.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Borrowed</p>
                <p className="text-lg font-bold text-amber-700">KES {stats.activeLoanBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Fines</p>
                <p className="text-lg font-bold text-rose-700">KES {stats.totalFines.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Net Balance</p>
                <p className="text-lg font-bold text-blue-700">KES {stats.savingsBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* All Transactions Table */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm">COMPLETE TRANSACTION STATEMENT</h3>
                <p className="text-xs text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Description</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Amount</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Contributions */}
                  {myContributions.map(c => (
                    <tr key={`contrib-${c.id}`} className="hover:bg-emerald-50/30">
                      <td className="px-6 py-3 text-sm text-gray-900">{c.date}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          <Badge variant={c.type === 'monthly' ? 'info' : c.type === 'special' ? 'purple' : 'warning'} size="sm">
                            Contribution
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{c.month} - {c.type}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-emerald-600 text-right">
                        +KES {c.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={c.status === 'completed' ? 'success' : 'warning'}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Loans */}
                  {myLoans.map(l => (
                    <tr key={`loan-${l.id}`} className="hover:bg-amber-50/30">
                      <td className="px-6 py-3 text-sm text-gray-900">{l.application_date}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="w-4 h-4 text-amber-600" />
                          <Badge variant="warning" size="sm">Loan</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{l.purpose}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-amber-600 text-right">
                        -KES {l.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={l.status === 'active' ? 'warning' : l.status === 'completed' ? 'success' : 'info'}>
                          {l.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Fines */}
                  {myFines.map(f => (
                    <tr key={`fine-${f.id}`} className="hover:bg-rose-50/30">
                      <td className="px-6 py-3 text-sm text-gray-900">{f.date}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <Badge variant="danger" size="sm">Fine</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{f.reason}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-rose-600 text-right">
                        -KES {f.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={f.status === 'paid' ? 'success' : 'danger'}>
                          {f.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={3} className="px-6 py-3 text-sm font-bold text-gray-700">NET BALANCE</td>
                    <td className="px-6 py-3 text-sm font-bold text-blue-700 text-right">
                      KES {stats.savingsBalance.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====== CONTRIBUTION STATEMENT ====== */}
      {activeTab === 'contributions' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="font-bold text-gray-900">Contribution Statement</h3>
                <p className="text-sm text-gray-500">{currentUser.name} • Member since {currentUser.joinDate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Contributed</p>
                <p className="text-lg font-bold text-emerald-700">KES {stats.totalContributed.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Monthly Contributions</p>
                <p className="text-lg font-bold text-gray-900">
                  {myContributions.filter(c => c.type === 'monthly' && c.status === 'completed').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Special Contributions</p>
                <p className="text-lg font-bold text-gray-900">
                  KES {myContributions.filter(c => c.type === 'special' && c.status === 'completed').reduce((s, c) => s + c.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Contribution Streak</p>
                <p className="text-lg font-bold text-primary-700">{stats.contributionStreak} months</p>
              </div>
            </div>
          </div>

          {/* Statement Table */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm">CONTRIBUTION STATEMENT</h3>
                <p className="text-xs text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Month</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Method</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Ref</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Amount</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden lg:table-cell">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {contribsWithBalance.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-sm text-gray-900">{c.date}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{c.month}</td>
                      <td className="px-6 py-3">
                        <Badge variant={c.type === 'monthly' ? 'info' : c.type === 'special' ? 'purple' : 'warning'} size="sm">
                          {c.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 capitalize hidden sm:table-cell">{c.method}</td>
                      <td className="px-6 py-3 text-xs text-gray-400 font-mono hidden md:table-cell">{c.reference || '—'}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">
                        KES {c.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={c.status === 'completed' ? 'success' : c.status === 'pending' ? 'warning' : 'danger'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-emerald-600 text-right hidden lg:table-cell">
                        {c.status === 'completed' ? `KES ${c.runningBalance.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-700">TOTAL</td>
                    <td className="px-6 py-3 text-sm font-bold text-emerald-700 text-right">
                      KES {stats.totalContributed.toLocaleString()}
                    </td>
                    <td></td>
                    <td className="px-6 py-3 text-sm font-bold text-emerald-700 text-right hidden lg:table-cell">
                      KES {stats.totalContributed.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====== FINE STATEMENT ====== */}
      {activeTab === 'fines' && (
        <div className="space-y-6">
          {/* Fine Summary */}
          <div className="card bg-gradient-to-r from-rose-50 to-amber-50 border-rose-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              <div>
                <h3 className="font-bold text-gray-900">Fine Statement</h3>
                <p className="text-sm text-gray-500">{currentUser.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Fines</p>
                <p className="text-lg font-bold text-gray-900">KES {stats.totalFines.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-bold text-emerald-700">KES {stats.finesPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-lg font-bold text-rose-700">KES {stats.finesUnpaid.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {myFines.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="font-semibold text-gray-900">No Fines!</h3>
              <p className="text-gray-500 text-sm mt-1">You have a clean record. Keep it up!</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-sm">FINE STATEMENT</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Reason</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Month</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Amount</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {myFines.map(f => (
                    <tr key={f.id} className={`hover:bg-gray-50/50 ${f.status === 'unpaid' ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-6 py-3 text-sm text-gray-900">{f.date}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{f.reason}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 hidden sm:table-cell">{f.month}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">KES {f.amount}</td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={f.status === 'paid' ? 'success' : 'danger'}>{f.status}</Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 hidden md:table-cell">{f.paid_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={3} className="px-6 py-3 text-sm font-bold text-gray-700">TOTALS</td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                      KES {stats.totalFines.toLocaleString()}
                    </td>
                    <td colSpan={2} className="px-6 py-3 text-sm text-gray-600 text-center">
                      Outstanding: <span className="font-bold text-rose-600">KES {stats.finesUnpaid}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ====== LOAN STATEMENT ====== */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* Loan Summary */}
          <div className="card bg-gradient-to-r from-amber-50 to-primary-50 border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <HandCoins className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-bold text-gray-900">Loan Statement</h3>
                <p className="text-sm text-gray-500">{currentUser.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Loans Taken</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalLoansTaken}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Active Loans</p>
                <p className="text-lg font-bold text-amber-700">
                  {myLoans.filter(l => l.status === 'active').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Outstanding Balance</p>
                <p className="text-lg font-bold text-rose-700">KES {stats.activeLoanBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-emerald-700">
                  {myLoans.filter(l => l.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Loans */}
          {myLoans.map(loan => (
            <div key={loan.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{loan.purpose}</h3>
                    <Badge variant={
                      loan.status === 'active' ? 'info' :
                      loan.status === 'completed' ? 'success' :
                      loan.status === 'pending' ? 'warning' : 'danger'
                    }>{loan.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Applied: {loan.application_date} • Due: {loan.due_date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Principal</p>
                  <p className="text-sm font-bold text-gray-900">KES {loan.amount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Interest ({loan.interest_rate}%)</p>
                  <p className="text-sm font-bold text-gray-900">KES {(loan.total_repayable - loan.amount).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Total Repayable</p>
                  <p className="text-sm font-bold text-gray-900">KES {loan.total_repayable.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-sm font-bold text-emerald-600">KES {loan.amount_paid.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-sm font-bold text-rose-600">
                    KES {(loan.total_repayable - loan.amount_paid).toLocaleString()}
                  </p>
                </div>
              </div>

              {(loan.status === 'active' || loan.status === 'completed') && (
                <div className="mb-4">
                  <ProgressBar
                    value={loan.amount_paid}
                    max={loan.total_repayable}
                    color={loan.status === 'completed' ? 'emerald' : 'primary'}
                  />
                </div>
              )}

              {(loan.status === 'active' || loan.status === 'completed') && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Repayment History</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs text-gray-500 pb-2">Date</th>
                          <th className="text-right text-xs text-gray-500 pb-2">Amount</th>
                          <th className="text-left text-xs text-gray-500 pb-2 hidden sm:table-cell">Method</th>
                          <th className="text-left text-xs text-gray-500 pb-2 hidden sm:table-cell">Reference</th>
                          <th className="text-right text-xs text-gray-500 pb-2">Balance After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {myRepayments
                          .filter(r => r.loan_id === loan.id)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map(r => (
                            <tr key={r.id}>
                              <td className="py-2 text-sm text-gray-900">{r.date}</td>
                              <td className="py-2 text-sm font-semibold text-emerald-600 text-right">
                                KES {r.amount.toLocaleString()}
                              </td>
                              <td className="py-2 text-sm text-gray-500 capitalize hidden sm:table-cell">{r.method}</td>
                              <td className="py-2 text-xs text-gray-400 font-mono hidden sm:table-cell">{r.reference}</td>
                              <td className="py-2 text-sm font-semibold text-gray-900 text-right">
                                KES {r.balance_after.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                Guarantors: {loan.guarantors.join(', ')} • Monthly Payment: KES {loan.monthly_payment.toLocaleString()}
              </div>
            </div>
          ))}

          {myLoans.length === 0 && (
            <div className="card text-center py-12">
              <HandCoins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">No Loan History</h3>
              <p className="text-gray-500 text-sm mt-1">You haven't taken any loans yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}