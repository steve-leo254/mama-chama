// src/components/member-portal/my-reports/MyReports.tsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PiggyBank, AlertTriangle, HandCoins, Download, FileText, Printer, ArrowUpRight, ArrowDownLeft, List } from 'lucide-react';
import Badge from '../../ui/Badge';
import ProgressBar from '../../ui/ProgressBar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export default function MyReports() {
  const {
    currentUser, getMemberStats, getMemberContributions, getMemberFines,
    getMemberLoans, getMemberLoanRepayments, getMemberTransactions
  } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'contributions' | 'fines' | 'loans'>('all');
  const [stats, setStats] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Enhanced PDF Export function with beautiful design
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Color scheme
    const colors = {
      primary: [16, 185, 129] as [number, number, number], // Emerald
      secondary: [99, 102, 241] as [number, number, number], // Indigo
      accent: [245, 158, 11] as [number, number, number], // Amber
      danger: [239, 68, 68] as [number, number, number], // Red
      dark: [31, 41, 55] as [number, number, number], // Gray-800
      light: [243, 244, 246] as [number, number, number], // Gray-100
      text: [55, 65, 81] as [number, number, number], // Gray-700
    };

    // Header with gradient effect (simulated with rectangles)
    const drawGradientHeader = () => {
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Add decorative elements
      doc.setFillColor(255, 255, 255, 0.1);
      doc.circle(pageWidth - 20, 15, 25, 'F');
      doc.circle(15, 30, 15, 'F');
    };

    // Logo/Icon placeholder (you can replace with actual logo)
    const drawLogo = () => {
      doc.setFillColor(255, 255, 255);
      doc.circle(20, 20, 8, 'F');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('S', 17.5, 22.5);
    };

    // Title and member info
    const drawHeader = () => {
      drawGradientHeader();
      drawLogo();
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Statement', 35, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${currentUser?.name} • Member ID: ${currentUser?.id}`, 35, 30);
      
      // Date
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth - 15, 22, { align: 'right' });
    };

    // Summary cards
    const drawSummaryCards = (startY: number) => {
      const cardWidth = (pageWidth - 30) / 4;
      const cardHeight = 25;
      const cardSpacing = 5;
      const summaryData = [
        { label: 'Total Contributed', value: `KES ${stats?.totalContributed?.toLocaleString() || 0}`, color: colors.primary },
        { label: 'Total Borrowed', value: `KES ${stats?.activeLoanBalance?.toLocaleString() || 0}`, color: colors.accent },
        { label: 'Total Fines', value: `KES ${stats?.totalFines?.toLocaleString() || 0}`, color: colors.danger },
        { label: 'Net Balance', value: `KES ${stats?.savingsBalance?.toLocaleString() || 0}`, color: colors.secondary },
      ];

      summaryData.forEach((card, index) => {
        const x = 10 + (index * (cardWidth + cardSpacing));
        
        // Card background
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(x, startY, cardWidth, cardHeight, 3, 3, 'F');
        
        // Colored accent bar
        doc.setFillColor(card.color[0], card.color[1], card.color[2]);
        doc.roundedRect(x, startY, cardWidth, 3, 3, 3, 'F');
        
        // Label
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.text(card.label, x + cardWidth / 2, startY + 10, { align: 'center' });
        
        // Value
        doc.setFontSize(11);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(card.value, x + cardWidth / 2, startY + 18, { align: 'center' });
      });

      return startY + cardHeight + 10;
    };

    drawHeader();
    let currentY = drawSummaryCards(55);

    // Prepare table data based on active tab
    let tableData: any[] = [];
    let tableHeaders: string[] = [];
    let tableTitle = '';

    if (activeTab === 'all') {
      tableTitle = 'Complete Transaction History';
      tableHeaders = ['Date', 'Type', 'Description', 'Amount', 'Status'];
      
      // Contributions
      myContributions.forEach(c => {
        tableData.push([
          c.date,
          'Contribution',
          `${c.month} - ${c.type}`,
          `+KES ${c.amount.toLocaleString()}`,
          c.status
        ]);
      });
      
      // Loans
      myLoans.forEach(l => {
        tableData.push([
          l.application_date,
          'Loan',
          l.purpose,
          `-KES ${l.amount.toLocaleString()}`,
          l.status
        ]);
      });
      
      // Fines
      myFines.forEach(f => {
        tableData.push([
          f.date,
          'Fine',
          f.reason,
          `-KES ${f.amount.toLocaleString()}`,
          f.status
        ]);
      });

      // Sort by date
      tableData.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    } 
    else if (activeTab === 'contributions') {
      tableTitle = 'Contribution Statement';
      tableHeaders = ['Date', 'Month', 'Type', 'Method', 'Amount', 'Status', 'Balance'];
      
      let runningBalance = 0;
      const contribData = [...myContributions].reverse();
      
      contribData.forEach(c => {
        if (c.status === 'completed') runningBalance += c.amount;
        tableData.push([
          c.date,
          c.month,
          c.type,
          c.method,
          `KES ${c.amount.toLocaleString()}`,
          c.status,
          c.status === 'completed' ? `KES ${runningBalance.toLocaleString()}` : '—'
        ]);
      });
      
      tableData.reverse();
    }
    else if (activeTab === 'fines') {
      tableTitle = 'Fine Statement';
      tableHeaders = ['Date', 'Reason', 'Month', 'Amount', 'Status', 'Paid Date'];
      
      myFines.forEach(f => {
        tableData.push([
          f.date,
          f.reason,
          f.month,
          `KES ${f.amount.toLocaleString()}`,
          f.status,
          f.paid_date || '—'
        ]);
      });
    }
    else if (activeTab === 'loans') {
      tableTitle = 'Loan Statement';
      tableHeaders = ['Date', 'Purpose', 'Amount', 'Interest', 'Total Due', 'Paid', 'Balance', 'Status'];
      
      myLoans.forEach(l => {
        tableData.push([
          l.application_date,
          l.purpose,
          `KES ${l.amount.toLocaleString()}`,
          `${l.interest_rate}%`,
          `KES ${l.total_repayable.toLocaleString()}`,
          `KES ${l.amount_paid.toLocaleString()}`,
          `KES ${(l.total_repayable - l.amount_paid).toLocaleString()}`,
          l.status
        ]);
      });
    }

    // Table title
    doc.setFontSize(14);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(tableTitle, 10, currentY);
    currentY += 8;

    // Draw decorative line
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(10, currentY, pageWidth - 10, currentY);
    currentY += 5;

    // Generate table
    autoTable(doc, {
      startY: currentY,
      head: [tableHeaders],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.text,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
      },
      styles: {
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data: any) => {
        // Footer on each page
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'Proudly brought to you by Mama Chama Savings and Credit Cooperative Society',
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );
        
        // Page number
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 15,
          footerY,
          { align: 'right' }
        );
        
        // Decorative footer line
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(0.3);
        doc.line(10, footerY - 5, pageWidth - 10, footerY - 5);
      },
    });

    // Add summary footer if needed
    const finalY = (autoTable as any).lastAutoTable.finalY + 10;
    if (finalY < pageHeight - 40) {
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.roundedRect(10, finalY, pageWidth - 20, 20, 3, 3, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'bold');
      
      if (activeTab === 'all') {
        doc.text('Net Balance:', 15, finalY + 10);
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text(`KES ${stats?.savingsBalance?.toLocaleString() || 0}`, 15, finalY + 16);
      } else if (activeTab === 'contributions') {
        doc.text('Total Contributed:', 15, finalY + 10);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text(`KES ${stats?.totalContributed?.toLocaleString() || 0}`, 15, finalY + 16);
      } else if (activeTab === 'fines') {
        doc.text('Outstanding Fines:', 15, finalY + 10);
        doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
        doc.text(`KES ${stats?.finesUnpaid?.toLocaleString() || 0}`, 15, finalY + 16);
      } else if (activeTab === 'loans') {
        doc.text('Outstanding Loan Balance:', 15, finalY + 10);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text(`KES ${stats?.activeLoanBalance?.toLocaleString() || 0}`, 15, finalY + 16);
      }
    }

    // Save PDF
    const fileName = `${currentUser?.name.replace(/\s+/g, '_')}_${activeTab}_statement_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Enhanced Print function with beautiful styling
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Prepare data based on active tab
    let tableContent = '';
    let summaryContent = '';
    let titleContent = '';

    if (activeTab === 'all') {
      titleContent = 'Complete Transaction Statement';
      summaryContent = `
        <div class="summary-grid">
          <div class="summary-card emerald">
            <div class="summary-label">Total Contributed</div>
            <div class="summary-value">KES ${stats?.totalContributed?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card amber">
            <div class="summary-label">Total Borrowed</div>
            <div class="summary-value">KES ${stats?.activeLoanBalance?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card rose">
            <div class="summary-label">Total Fines</div>
            <div class="summary-value">KES ${stats?.totalFines?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card blue">
            <div class="summary-label">Net Balance</div>
            <div class="summary-value">KES ${stats?.savingsBalance?.toLocaleString() || 0}</div>
          </div>
        </div>
      `;

      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${myContributions.map(c => `
              <tr class="contribution-row">
                <td>${c.date}</td>
                <td><span class="badge badge-emerald">Contribution</span></td>
                <td>${c.month} - ${c.type}</td>
                <td class="positive">+KES ${c.amount.toLocaleString()}</td>
                <td><span class="badge badge-${c.status === 'completed' ? 'success' : 'warning'}">${c.status}</span></td>
              </tr>
            `).join('')}
            ${myLoans.map(l => `
              <tr class="loan-row">
                <td>${l.application_date}</td>
                <td><span class="badge badge-amber">Loan</span></td>
                <td>${l.purpose}</td>
                <td class="negative">-KES ${l.amount.toLocaleString()}</td>
                <td><span class="badge badge-${l.status}">${l.status}</span></td>
              </tr>
            `).join('')}
            ${myFines.map(f => `
              <tr class="fine-row">
                <td>${f.date}</td>
                <td><span class="badge badge-rose">Fine</span></td>
                <td>${f.reason}</td>
                <td class="negative">-KES ${f.amount.toLocaleString()}</td>
                <td><span class="badge badge-${f.status === 'paid' ? 'success' : 'danger'}">${f.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3"><strong>NET BALANCE</strong></td>
              <td colspan="2" class="balance"><strong>KES ${stats?.savingsBalance?.toLocaleString() || 0}</strong></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (activeTab === 'contributions') {
      titleContent = 'Contribution Statement';
      summaryContent = `
        <div class="summary-grid">
          <div class="summary-card emerald">
            <div class="summary-label">Total Contributed</div>
            <div class="summary-value">KES ${stats?.totalContributed?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Monthly Contributions</div>
            <div class="summary-value">${myContributions.filter(c => c.type === 'monthly' && c.status === 'completed').length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Special Contributions</div>
            <div class="summary-value">KES ${myContributions.filter(c => c.type === 'special' && c.status === 'completed').reduce((s, c) => s + c.amount, 0).toLocaleString()}</div>
          </div>
          <div class="summary-card blue">
            <div class="summary-label">Contribution Streak</div>
            <div class="summary-value">${stats?.contributionStreak || 0} months</div>
          </div>
        </div>
      `;

      let runningBalance = 0;
      const contribData = [...myContributions].reverse();
      
      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Month</th>
              <th>Type</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${contribData.map(c => {
              if (c.status === 'completed') runningBalance += c.amount;
              return `
                <tr>
                  <td>${c.date}</td>
                  <td>${c.month}</td>
                  <td><span class="badge badge-${c.type === 'monthly' ? 'blue' : 'purple'}">${c.type}</span></td>
                  <td>${c.method}</td>
                  <td class="positive">KES ${c.amount.toLocaleString()}</td>
                  <td><span class="badge badge-${c.status === 'completed' ? 'success' : 'warning'}">${c.status}</span></td>
                  <td class="balance">${c.status === 'completed' ? `KES ${runningBalance.toLocaleString()}` : '—'}</td>
                </tr>
              `;
            }).reverse().join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4"><strong>TOTAL</strong></td>
              <td colspan="3" class="balance"><strong>KES ${stats?.totalContributed?.toLocaleString() || 0}</strong></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (activeTab === 'fines') {
      titleContent = 'Fine Statement';
      summaryContent = `
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Fines</div>
            <div class="summary-value">KES ${stats?.totalFines?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card emerald">
            <div class="summary-label">Paid</div>
            <div class="summary-value">KES ${stats?.finesPaid?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card rose">
            <div class="summary-label">Outstanding</div>
            <div class="summary-value">KES ${stats?.finesUnpaid?.toLocaleString() || 0}</div>
          </div>
        </div>
      `;

      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid Date</th>
            </tr>
          </thead>
          <tbody>
            ${myFines.map(f => `
              <tr class="${f.status === 'unpaid' ? 'unpaid-row' : ''}">
                <td>${f.date}</td>
                <td>${f.reason}</td>
                <td>${f.month}</td>
                <td class="negative">KES ${f.amount.toLocaleString()}</td>
                <td><span class="badge badge-${f.status === 'paid' ? 'success' : 'danger'}">${f.status}</span></td>
                <td>${f.paid_date || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3"><strong>TOTALS</strong></td>
              <td class="negative"><strong>KES ${stats?.totalFines?.toLocaleString() || 0}</strong></td>
              <td colspan="2"><strong>Outstanding: KES ${stats?.finesUnpaid?.toLocaleString() || 0}</strong></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (activeTab === 'loans') {
      titleContent = 'Loan Statement';
      summaryContent = `
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Loans Taken</div>
            <div class="summary-value">${stats?.totalLoansTaken || 0}</div>
          </div>
          <div class="summary-card amber">
            <div class="summary-label">Active Loans</div>
            <div class="summary-value">${myLoans.filter(l => l.status === 'active').length}</div>
          </div>
          <div class="summary-card rose">
            <div class="summary-label">Outstanding Balance</div>
            <div class="summary-value">KES ${stats?.activeLoanBalance?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card emerald">
            <div class="summary-label">Completed</div>
            <div class="summary-value">${myLoans.filter(l => l.status === 'completed').length}</div>
          </div>
        </div>
      `;

      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Purpose</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Total Due</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${myLoans.map(l => `
              <tr>
                <td>${l.application_date}</td>
                <td>${l.purpose}</td>
                <td class="negative">KES ${l.amount.toLocaleString()}</td>
                <td>${l.interest_rate}%</td>
                <td>KES ${l.total_repayable.toLocaleString()}</td>
                <td class="positive">KES ${l.amount_paid.toLocaleString()}</td>
                <td class="negative">KES ${(l.total_repayable - l.amount_paid).toLocaleString()}</td>
                <td><span class="badge badge-${l.status}">${l.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentUser?.name} - ${titleContent}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #374151;
              background: white;
              padding: 40px;
            }
            
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin-bottom: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: 800;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            
            .header-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 12px;
              font-size: 14px;
              opacity: 0.95;
            }
            
            .member-info {
              font-weight: 500;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 30px;
            }
            
            .summary-card {
              background: #f9fafb;
              border-left: 4px solid #6b7280;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .summary-card.emerald {
              border-left-color: #10b981;
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            }
            
            .summary-card.amber {
              border-left-color: #f59e0b;
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            }
            
            .summary-card.rose {
              border-left-color: #ef4444;
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            }
            
            .summary-card.blue {
              border-left-color: #3b82f6;
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            }
            
            .summary-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #6b7280;
              font-weight: 600;
              margin-bottom: 8px;
            }
            
            .summary-value {
              font-size: 22px;
              font-weight: 800;
              color: #1f2937;
            }
            
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-bottom: 30px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            thead {
              background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
              color: white;
            }
            
            th {
              padding: 16px 12px;
              text-align: left;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            td {
              padding: 14px 12px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 13px;
            }
            
            tbody tr:hover {
              background-color: #f9fafb;
            }
            
            tbody tr:last-child td {
              border-bottom: none;
            }
            
            .contribution-row {
              background-color: rgba(16, 185, 129, 0.03);
            }
            
            .loan-row {
              background-color: rgba(245, 158, 11, 0.03);
            }
            
            .fine-row {
              background-color: rgba(239, 68, 68, 0.03);
            }
            
            .unpaid-row {
              background-color: rgba(239, 68, 68, 0.08);
            }
            
            .positive {
              color: #059669;
              font-weight: 600;
            }
            
            .negative {
              color: #dc2626;
              font-weight: 600;
            }
            
            .balance {
              color: #3b82f6;
              font-weight: 700;
            }
            
            .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: capitalize;
              letter-spacing: 0.3px;
            }
            
            .badge-emerald {
              background: #d1fae5;
              color: #065f46;
            }
            
            .badge-amber {
              background: #fef3c7;
              color: #92400e;
            }
            
            .badge-rose {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .badge-blue {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .badge-purple {
              background: #e9d5ff;
              color: #6b21a8;
            }
            
            .badge-success {
              background: #d1fae5;
              color: #065f46;
            }
            
            .badge-warning {
              background: #fef3c7;
              color: #92400e;
            }
            
            .badge-danger {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .badge-info {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .badge-active {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .badge-completed {
              background: #d1fae5;
              color: #065f46;
            }
            
            .badge-pending {
              background: #fef3c7;
              color: #92400e;
            }
            
            tfoot {
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              font-weight: 700;
            }
            
            .total-row td {
              padding: 18px 12px;
              border-top: 2px solid #d1d5db;
              font-size: 14px;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #9ca3af;
              font-size: 12px;
              font-style: italic;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .summary-card {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                page-break-inside: avoid;
              }
              
              table {
                page-break-inside: auto;
              }
              
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              
              thead {
                display: table-header-group;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              tfoot {
                display: table-footer-group;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${titleContent}</h1>
            <div class="header-info">
              <span class="member-info">${currentUser?.name} • Member ID: ${currentUser?.id}</span>
              <span>Generated: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          
          ${summaryContent}
          ${tableContent}
          
          <div class="footer">
            <p>This is a computer-generated statement and requires no signature.</p>
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} Savings Group. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
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

  const myContributions = getMemberContributions(currentUser.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const myFines = getMemberFines(currentUser.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const myLoans = getMemberLoans(currentUser.id);
  const myRepayments = getMemberLoanRepayments(currentUser.id);
  const myTransactions = getMemberTransactions(currentUser.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Utility functions
  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'contribution':
        return <PiggyBank className="w-4 h-4 text-emerald-600" />;
      case 'loan_disbursement':
        return <HandCoins className="w-4 h-4 text-amber-600" />;
      case 'loan_repayment':
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case 'penalty':
      case 'fine_payment':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'interest':
        return <ArrowDownLeft className="w-4 h-4 text-purple-600" />;
      case 'merry_go_round':
        return <List className="w-4 h-4 text-indigo-600" />;
      case 'deposit':
        return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
      case 'withdrawal':
        return <ArrowDownLeft className="w-4 h-4 text-rose-600" />;
      default:
        return <List className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionAmount = (transaction: any) => {
    const isPositive = transaction.direction === 'in' || 
                     transaction.type === 'contribution' || 
                     transaction.type === 'loan_repayment' ||
                     transaction.type === 'deposit' ||
                     transaction.type === 'interest';
    const colorClass = isPositive ? 'text-emerald-700' : 'text-rose-700';
    const prefix = isPositive ? '+' : '-';
    
    return (
      <span className={colorClass}>
        {prefix}KES {Math.abs(transaction.amount).toLocaleString()}
      </span>
    );
  };

  // Calculate contributions with running balance
  let contribRunning = 0;
  const contribsWithBalance = [...myContributions].reverse().map(c => {
    if (c.status === 'completed') contribRunning += c.amount;
    return { ...c, runningBalance: contribRunning } as (typeof c & { runningBalance: number });
  }).reverse();

  // Calculate totals from actual transactions
  const totalContributed = myTransactions
    .filter(t => t.type === 'contribution')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDeposits = myTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBorrowed = myTransactions
    .filter(t => t.type === 'loan_disbursement')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalFines = myTransactions
    .filter(t => t.type === 'penalty' || t.type === 'fine_payment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = (totalContributed + totalDeposits) - totalBorrowed - totalFines;

  const tabs = [
    { key: 'all' as const, label: 'All Transactions', icon: List },
    { key: 'contributions' as const, label: 'Contribution Statement', icon: PiggyBank },
    { key: 'fines' as const, label: 'Fine Statement', icon: AlertTriangle },
    { key: 'loans' as const, label: 'Loan Statement', icon: HandCoins },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
          <p className="text-gray-500 text-sm">Personal financial statements</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint} 
            className="btn-secondary flex items-center gap-2 text-sm hover:bg-gray-100 transition-all"
          >
            <Printer className="w-4 h-4" /> Print
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
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
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
        <div className="space-y-6" ref={printRef}>
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
                <p className="text-lg font-bold text-emerald-700">KES {totalContributed.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Deposits</p>
                <p className="text-lg font-bold text-blue-700">KES {totalDeposits.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Borrowed</p>
                <p className="text-lg font-bold text-amber-700">KES {totalBorrowed.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Net Balance</p>
                <p className="text-lg font-bold text-purple-700">KES {netBalance.toLocaleString()}</p>
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
                  {myTransactions.map((transaction) => (
                    <tr key={`transaction-${transaction.id}`} className="hover:bg-gray-50/30">
                      <td className="px-6 py-3 text-sm text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="text-xs text-gray-600 capitalize">{transaction.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{transaction.description}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-right">
                        {getTransactionAmount(transaction)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant="success">
                          Completed
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ... Rest of the tabs remain the same ... */}
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
                <p className="text-lg font-bold text-emerald-700">KES {stats?.totalContributed?.toLocaleString() || 0}</p>
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
                <p className="text-lg font-bold text-primary-700">{stats?.contributionStreak || 0} months</p>
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
                      KES {stats?.totalContributed?.toLocaleString() || 0}
                    </td>
                    <td></td>
                    <td className="px-6 py-3 text-sm font-bold text-emerald-700 text-right hidden lg:table-cell">
                      KES {stats?.totalContributed?.toLocaleString() || 0}
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
                <p className="text-lg font-bold text-gray-900">KES {stats?.totalFines?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-bold text-emerald-700">KES {stats?.finesPaid?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-lg font-bold text-rose-700">KES {stats?.finesUnpaid?.toLocaleString() || 0}</p>
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
                      KES {stats?.totalFines?.toLocaleString() || 0}
                    </td>
                    <td colSpan={2} className="px-6 py-3 text-sm text-gray-600 text-center">
                      Outstanding: <span className="font-bold text-rose-600">KES {stats?.finesUnpaid?.toLocaleString() || 0}</span>
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
                <p className="text-lg font-bold text-gray-900">{stats?.totalLoansTaken || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Active Loans</p>
                <p className="text-lg font-bold text-amber-700">
                  {myLoans.filter(l => l.status === 'active').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">Outstanding Balance</p>
                <p className="text-lg font-bold text-rose-700">KES {stats?.activeLoanBalance?.toLocaleString() || 0}</p>
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