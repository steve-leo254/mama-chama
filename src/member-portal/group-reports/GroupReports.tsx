// src/components/member-portal/group-reports/GroupReports.tsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../ui/Badge';
import ProgressBar from '../../ui/ProgressBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Users, PiggyBank, HandCoins, AlertTriangle, Printer } from 'lucide-react';
import './GroupReports.css';

// Extend jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export default function GroupReports() {
  const { stats, members, contributions, fines, loans } = useApp();
  const [activeTab, setActiveTab] = useState<'balances' | 'contributions' | 'fines'>('balances');

  const activeMembers = members.filter(m => m.status === 'active');
  const totalFines = fines.reduce((s, f) => s + f.amount, 0);
  const paidFines = fines.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const unpaidFines = fines.filter(f => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);

  // Enhanced Print function with beautiful styling
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Prepare data based on active tab
    let tableContent = '';
    let summaryContent = '';
    let titleContent = '';

    if (activeTab === 'balances') {
      titleContent = 'Group Account Balances';
      summaryContent = `
        <div class="summary-grid">
          <div class="summary-card emerald">
            <div class="summary-label">Total Savings</div>
            <div class="summary-value">KES ${stats.totalContributions.toLocaleString()}</div>
          </div>
          <div class="summary-card blue">
            <div class="summary-label">Available Balance</div>
            <div class="summary-value">KES ${stats.availableBalance.toLocaleString()}</div>
          </div>
          <div class="summary-card amber">
            <div class="summary-label">Loans Outstanding</div>
            <div class="summary-value">KES ${stats.totalLoans.toLocaleString()}</div>
          </div>
          <div class="summary-card purple">
            <div class="summary-label">Active Members</div>
            <div class="summary-value">${activeMembers.length}</div>
          </div>
        </div>
      `;

      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Contributed</th>
              <th>Borrowed</th>
              <th>Fines</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => {
              const memberFines = fines.filter(f => f.member_id === m.id);
              const unpaidAmt = memberFines.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);
              const totalContributed = contributions
                .filter(c => c.member_id === m.id && c.status === 'completed')
                .reduce((sum, c) => sum + c.amount, 0);
              const totalBorrowed = loans
                .filter(l => l.member_id === m.id && (l.status === 'active' || l.status === 'approved'))
                .reduce((sum, l) => sum + l.amount, 0);
              
              return `
                <tr>
                  <td>${m.name}</td>
                  <td><span class="badge badge-${m.role}">${m.role}</span></td>
                  <td class="positive">KES ${totalContributed.toLocaleString()}</td>
                  <td class="negative">KES ${totalBorrowed.toLocaleString()}</td>
                  <td>${unpaidAmt > 0 ? `<span class="negative">KES ${unpaidAmt}</span>` : '—'}</td>
                  <td><span class="badge badge-${m.status}">${m.status}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'contributions') {
      titleContent = 'Contribution Report';
      summaryContent = `
        <div class="summary-grid">
          <div class="summary-card emerald">
            <div class="summary-label">Total Contributions</div>
            <div class="summary-value">KES ${stats.totalContributions.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Monthly Target</div>
            <div class="summary-value">KES ${stats.monthlyTarget.toLocaleString()}</div>
          </div>
          <div class="summary-card blue">
            <div class="summary-label">Progress</div>
            <div class="summary-value">${((stats.monthlyCollected / stats.monthlyTarget) * 100).toFixed(0)}%</div>
          </div>
        </div>
      `;

      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Month</th>
              <th>Type</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${contributions.map(c => {
              const member = members.find(m => m.id === c.member_id);
              return `
                <tr>
                  <td>${member?.name || 'Unknown'}</td>
                  <td>${c.month}</td>
                  <td><span class="badge badge-${c.type}">${c.type}</span></td>
                  <td>${c.method}</td>
                  <td class="positive">KES ${c.amount.toLocaleString()}</td>
                  <td><span class="badge badge-${c.status}">${c.status}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'fines') {
      titleContent = 'Fine Summary';
      summaryContent = `
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Fines</div>
            <div class="summary-value">KES ${totalFines.toLocaleString()}</div>
          </div>
          <div class="summary-card emerald">
            <div class="summary-label">Fines Paid</div>
            <div class="summary-value">KES ${paidFines.toLocaleString()}</div>
          </div>
          <div class="summary-card rose">
            <div class="summary-label">Fines Unpaid</div>
            <div class="summary-value">KES ${unpaidFines.toLocaleString()}</div>
          </div>
        </div>
      `;

      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Reason</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid Date</th>
            </tr>
          </thead>
          <tbody>
            ${fines.map(f => `
              <tr>
                <td>${f.member_name}</td>
                <td>${f.reason}</td>
                <td>${f.month}</td>
                <td class="negative">KES ${f.amount.toLocaleString()}</td>
                <td><span class="badge badge-${f.status}">${f.status}</span></td>
                <td>${f.paid_date || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Create print-friendly version with enhanced styling
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Group Reports</title>
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
            h1 { font-size: 28px; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
            h2 { font-size: 20px; }
            .header-info { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .summary-card.emerald { border-left: 4px solid #10b981; }
            .summary-card.blue { border-left: 4px solid #3b82f6; }
            .summary-card.amber { border-left: 4px solid #f59e0b; }
            .summary-card.purple { border-left: 4px solid #8b5cf6; }
            .summary-card.rose { border-left: 4px solid #f43f5e; }
            .summary-label { 
              font-size: 12px; 
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #6b7280;
              margin-bottom: 4px;
            }
            .summary-value { 
              font-size: 18px; 
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
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 12px; 
              text-align: left;
            }
            th { 
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              font-weight: 600;
              color: #374151;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            tr:nth-child(even) { background-color: #f9fafb; }
            tr:hover { background-color: #f3f4f6; }
            .badge { 
              padding: 4px 8px; 
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              text-transform: uppercase;
            }
            .badge.success { background: #d1fae5; color: #065f46; }
            .badge.warning { background: #fed7aa; color: #92400e; }
            .badge.danger { background: #fee2e2; color: #991b1b; }
            .badge.neutral { background: #f3f4f6; color: #374151; }
            .badge.active { background: #d1fae5; color: #065f46; }
            .badge.inactive { background: #fee2e2; color: #991b1b; }
            .badge.monthly { background: #dbeafe; color: #1e40af; }
            .badge.special { background: #e9d5ff; color: #6b21a8; }
            .badge.admin { background: #fef3c7; color: #92400e; }
            .badge.member { background: #e0e7ff; color: #3730a3; }
            .positive { color: #059669; font-weight: 600; }
            .negative { color: #dc2626; font-weight: 600; }
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
              .summary-grid { grid-template-columns: repeat(2, 1fr); }
            }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>${titleContent}</h1>
            <p>Generated: ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          ${summaryContent}
          
          <h2>Detailed Report</h2>
          ${tableContent}
          
          <div class="footer">
            <p>This is a computer-generated report and requires no signature.</p>
            <p>Mama Chama Group Management System</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // Contribution per member
  const memberContribData = activeMembers.map(m => ({
    name: m.name.split(' ')[0],
    amount: contributions.filter(c => c.member_id === m.id && c.status === 'completed').reduce((s, c) => s + c.amount, 0),
  })).sort((a, b) => b.amount - a.amount);

  const balanceData = [
    { name: 'Savings', value: stats.totalSavings, color: '#10b981' },
    { name: 'Loans Out', value: stats.totalLoans, color: '#f59e0b' },
    { name: 'Available', value: stats.availableBalance, color: '#3b82f6' },
  ];

  // Monthly data for trend chart - using real data from contributions
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    
    console.log('All contributions:', contributions);
    
    // Get data for all months (Jan-Dec)
    for (let i = 0; i <= 11; i++) {
      const monthName = months[i];
      const monthContributions = contributions.filter(c => {
        // Flexible month matching - handle different formats
        const contributionMonth = c.month?.toLowerCase() || '';
        return (
          contributionMonth === monthName.toLowerCase() || // Exact match: "Apr"
          contributionMonth === monthName.toLowerCase() + ' 2026' || // With year: "Apr 2026"
          contributionMonth.includes(monthName.toLowerCase()) || // Partial match: contains "Apr"
          (i === 3 && contributionMonth.includes('april')) || // April for month 3
          (i === 3 && contributionMonth.includes('apr')) // Apr for month 3
        ) && c.status === 'completed';
      });
      const collected = monthContributions.reduce((sum, c) => sum + c.amount, 0);
      
      console.log(`Month ${monthName}:`, { 
        contributionsFound: monthContributions.length, 
        collected,
        sampleMonths: monthContributions.map(c => c.month)
      });
      
      monthlyData.push({
        month: monthName,
        collected: collected,
        target: stats.monthlyTarget || 50000
      });
    }
    
    return monthlyData;
  };

  const monthlyData = getMonthlyData();

  const tabs = [
    { key: 'balances' as const, label: 'Account Balances', icon: Wallet },
    { key: 'contributions' as const, label: 'Contribution Report', icon: PiggyBank },
    { key: 'fines' as const, label: 'Fine Summary', icon: AlertTriangle },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Reports</h2>
          <p className="text-gray-500 text-sm">View chama financial reports & summaries</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="btn-secondary flex items-center gap-2"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" /> 
            Print
          </button>
        </div>
      </div>

      <div id="reports-content">

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

      {/* Account Balances */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-700">Total Savings</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">KES {stats.totalSavings.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-primary-700">Available Balance</span>
              </div>
              <p className="text-2xl font-bold text-primary-900">KES {stats.availableBalance.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <HandCoins className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-700">Loans Outstanding</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">KES {stats.totalLoans.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-700">Active Members</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{activeMembers.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Balance Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={balanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {balanceData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value ? `KES ${Number(value).toLocaleString()}` : ''} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {balanceData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Member Contributions Ranking</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberContribData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v) => `${v / 1000}k`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12 }} width={70} />
                    <Tooltip formatter={(value) => value ? `KES ${Number(value).toLocaleString()}` : ''} />
                    <Bar dataKey="amount" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Member Balances Table */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">All Members Account Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Member</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Contributed</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Borrowed</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Fines</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(m => {
                    const memberFines = fines.filter(f => f.member_id === m.id);
                    const unpaidAmt = memberFines.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);
                    const totalContributed = contributions
                      .filter(c => c.member_id === m.id && c.status === 'completed')
                      .reduce((sum, c) => sum + c.amount, 0);
                    const totalBorrowed = loans
                      .filter(l => l.member_id === m.id && (l.status === 'active' || l.status === 'approved'))
                      .reduce((sum, l) => sum + l.amount, 0);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{m.avatar}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{m.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-600">
                          KES {totalContributed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-amber-600 hidden sm:table-cell">
                          KES {totalBorrowed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm hidden md:table-cell">
                          {unpaidAmt > 0 ? (
                            <span className="text-rose-600 font-semibold">KES {unpaidAmt}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={m.status === 'active' ? 'success' : 'warning'}>{m.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Report */}
      {activeTab === 'contributions' && (
        <div className="space-y-6">
          {/* Monthly Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Collection Progress</h3>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  {((stats.monthlyCollected / stats.monthlyTarget) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500">
                  KES {stats.monthlyCollected.toLocaleString()} / {stats.monthlyTarget.toLocaleString()}
                </p>
              </div>
            </div>
            <ProgressBar value={stats.monthlyCollected} max={stats.monthlyTarget} color="emerald" showLabel={false} size="md" />
          </div>

          {/* Monthly Trend */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Monthly Collection Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(value) => value ? `KES ${Number(value).toLocaleString()}` : ''} />
                  <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual Status */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — Member Status</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {members.filter(m => m.status === 'active').map(m => {
                const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                const currentContributions = contributions.filter(
                  c => c.member_id === m.id && c.month === currentMonth && c.type === 'monthly'
                );
                const totalContributed = currentContributions.reduce((sum, c) => sum + c.amount, 0);
                const hasCompletedContrib = currentContributions.some(c => c.status === 'completed');
                const allCompleted = currentContributions.length > 0 && currentContributions.every(c => c.status === 'completed');
                
                return (
                  <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{m.avatar}</span>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900">
                        KES {totalContributed.toLocaleString()}
                      </span>
                      <Badge variant={
                        allCompleted ? 'success' :
                        hasCompletedContrib ? 'warning' :
                        'neutral'
                      }>
                        {allCompleted ? 'completed' :
                         hasCompletedContrib ? 'partial' :
                         'not paid'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fine Summary */}
      {activeTab === 'fines' && (
        <div className="space-y-6">
          {/* Fine Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100/50">
              <p className="text-sm text-gray-600">Total Fines Issued</p>
              <p className="text-2xl font-bold text-gray-900">KES {totalFines.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{fines.length} fines total</p>
            </div>
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
              <p className="text-sm text-emerald-700">Fines Paid</p>
              <p className="text-2xl font-bold text-emerald-900">KES {paidFines.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-1">{fines.filter(f => f.status === 'paid').length} paid</p>
            </div>
            <div className="card bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200">
              <p className="text-sm text-rose-700">Fines Unpaid</p>
              <p className="text-2xl font-bold text-rose-900">KES {unpaidFines.toLocaleString()}</p>
              <p className="text-xs text-rose-600 mt-1">{fines.filter(f => f.status === 'unpaid').length} outstanding</p>
            </div>
          </div>

          {/* All Fines */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">All Fines Record</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Member</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Reason</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Amount</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fines.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{f.member_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{f.reason}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">KES {f.amount}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={f.status === 'paid' ? 'success' : 'danger'}>{f.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{f.month}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}