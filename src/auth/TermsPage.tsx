// src/components/auth/TermsPage.tsx
import { ArrowLeft, FileText, Shield, Users, Gavel, PiggyBank, HandCoins, AlertTriangle, Calendar, RefreshCw, Lock } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  const sections = [
    {
      icon: Users,
      title: '1. Membership',
      color: 'bg-primary-100 text-primary-600',
      items: [
        'Membership is open to women aged 18 years and above.',
        'Each member must provide a valid National ID, phone number, and next of kin details.',
        'A new member must be proposed by an existing member and approved by the committee.',
        'Registration fee of KES 1,000 is payable upon joining.',
        'Members must attend at least 75% of monthly meetings.',
        'A member may be suspended for consistent non-compliance with group rules.',
        'Voluntary exit requires a 3-month notice in writing to the secretary.',
        'Upon exit, a member receives their savings less any outstanding fines or loan balances.',
      ],
    },
    {
      icon: PiggyBank,
      title: '2. Contributions',
      color: 'bg-emerald-100 text-emerald-600',
      items: [
        'Monthly contribution amount is KES 5,000 per member.',
        'Contributions are due by the 5th of each month.',
        'Payment can be made via M-Pesa, Bank Transfer, or Cash during meetings.',
        'All M-Pesa payments must include the member\'s ID number as reference.',
        'Special contributions may be called upon by majority vote.',
        'Contribution amounts may be reviewed annually at the AGM.',
        'No member shall be allowed to contribute less than the agreed amount.',
        'Contributions are non-refundable except upon approved exit from the group.',
      ],
    },
    {
      icon: AlertTriangle,
      title: '3. Fines & Penalties',
      color: 'bg-amber-100 text-amber-600',
      items: [
        'Late contribution (after 5th): KES 500 penalty per occurrence.',
        'Non-contribution for a month: KES 1,000 penalty plus the contribution amount.',
        'Absence from monthly meeting without apology: KES 200 fine.',
        'Late arrival to meeting (more than 30 minutes): KES 100 fine.',
        'All fines must be paid within 30 days of being issued.',
        'Unpaid fines will be deducted from the member\'s savings.',
        'Three consecutive months of non-payment may result in suspension.',
        'Fines are used to boost the group\'s emergency fund.',
      ],
    },
    {
      icon: HandCoins,
      title: '4. Loans',
      color: 'bg-rose-100 text-rose-600',
      items: [
        'A member is eligible for a loan after 3 months of active membership.',
        'Maximum loan amount is 3 times the member\'s total contributions.',
        'Loan interest rate is 10% flat on the principal amount.',
        'Maximum loan repayment period is 12 months.',
        'Every loan application requires a minimum of 2 guarantors who are active members.',
        'Guarantors are jointly liable for the loan in case of default.',
        'Loan applications are reviewed and approved by the committee within 7 days.',
        'A member cannot hold more than 2 active loans simultaneously.',
        'Monthly loan repayments are mandatory and must be paid alongside contributions.',
        'Default on loan repayment for 3 months triggers guarantor liability.',
        'Loan interest income is distributed to members at the end of the financial year.',
      ],
    },
    {
      icon: RefreshCw,
      title: '5. Merry-Go-Round',
      color: 'bg-purple-100 text-purple-600',
      items: [
        'All active members must participate in the merry-go-round cycle.',
        'The rotation order is determined by date of joining, then alphabetical order.',
        'Each member contributes an equal amount (KES 5,000) towards the recipient.',
        'The recipient receives the total pooled amount minus any outstanding obligations.',
        'The cycle repeats after all members have received.',
        'New members join at the end of the current cycle.',
        'A member who misses their merry-go-round contribution will be fined KES 1,000.',
        'The merry-go-round payout is processed during the monthly meeting.',
      ],
    },
    {
      icon: Calendar,
      title: '6. Meetings',
      color: 'bg-teal-100 text-teal-600',
      items: [
        'Monthly meetings are held on the 3rd Saturday of every month at 2:00 PM.',
        'Meeting venue rotates among members\' homes or an agreed location.',
        'Special meetings may be called with at least 48 hours\' notice.',
        'The Annual General Meeting (AGM) is held in January each year.',
        'Quorum for meetings is 60% of active members.',
        'Decisions are made by simple majority unless stated otherwise.',
        'Constitutional amendments require a 2/3 majority vote at an AGM.',
        'Meeting minutes must be circulated within 3 days via the group platform.',
      ],
    },
    {
      icon: Gavel,
      title: '7. Governance',
      color: 'bg-indigo-100 text-indigo-600',
      items: [
        'The group is governed by an elected committee: Chairperson, Treasurer, and Secretary.',
        'Committee members serve a 2-year term and are eligible for re-election.',
        'Elections are conducted during the AGM by secret ballot.',
        'The Treasurer must present monthly financial reports at each meeting.',
        'An independent audit is conducted annually before the AGM.',
        'Any financial transaction above KES 50,000 requires approval from 2 committee members.',
        'The committee has the authority to approve or reject loan applications.',
        'Disputes among members shall be resolved through the committee; if unresolved, through arbitration.',
      ],
    },
    {
      icon: Shield,
      title: '8. Data & Privacy',
      color: 'bg-gray-100 text-gray-600',
      items: [
        'Members\' personal information is collected for group management purposes only.',
        'Financial records are maintained digitally and backed up securely.',
        'Member data will never be shared with third parties without consent.',
        'Each member has the right to access their personal records upon request.',
        'The Treasurer and Chairperson have access to all financial data.',
        'The system uses encryption to protect sensitive information.',
        'Members can request deletion of their data upon approved exit.',
        'The group complies with the Kenya Data Protection Act, 2019.',
      ],
    },
    {
      icon: Lock,
      title: '9. Dissolution',
      color: 'bg-slate-100 text-slate-600',
      items: [
        'The group may be dissolved by a 3/4 majority vote at a special meeting called for that purpose.',
        'Upon dissolution, all outstanding loans must be recovered.',
        'Remaining assets shall be distributed equally among active members.',
        'All outstanding fines and penalties shall be deducted before distribution.',
        'The dissolution process shall be completed within 90 days.',
        'A final financial statement must be prepared and shared with all members.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Registration
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-sm">🤝</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">Mama Chama</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="gradient-hero text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Terms & Conditions</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Mama Chama Constitution & Bylaws
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/60">
            <span>📅 Effective: January 2024</span>
            <span>•</span>
            <span>📝 Last Updated: December 2024</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Preamble */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📜 Preamble</h2>
          <p className="text-gray-600 leading-relaxed">
            We, the members of <strong>Mama Chama</strong>, a women's savings and investment group,
            hereby establish this constitution to govern our collective activities. This document
            outlines the rules, responsibilities, and rights of all members. By joining Mama Chama,
            you agree to abide by all the terms and conditions stated herein.
          </p>
          <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-sm text-primary-800">
              <strong>Mission:</strong> To empower women through collective savings, affordable credit,
              and mutual support for financial independence and economic growth.
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="card mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Monthly Contribution', value: 'KES 5,000', sub: 'Due by 5th' },
              { label: 'Late Penalty', value: 'KES 500', sub: 'Per occurrence' },
              { label: 'Loan Interest', value: '10% flat', sub: 'On principal' },
              { label: 'Max Loan', value: '3x savings', sub: 'Your contributions' },
              { label: 'Guarantors', value: '2 minimum', sub: 'Active members' },
              { label: 'Max Duration', value: '12 months', sub: 'Loan repayment' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-emerald-100">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className="text-[10px] text-gray-400">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="card animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${section.color}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
              </div>
              <ol className="space-y-3">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Contact & Signatures */}
        <div className="card mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📞 Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Chairperson</p>
              <p className="font-semibold text-gray-900">Mary Wanjiku</p>
              <p className="text-sm text-gray-500">+254 712 345 678</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Treasurer</p>
              <p className="font-semibold text-gray-900">Grace Akinyi</p>
              <p className="text-sm text-gray-500">+254 723 456 789</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Secretary</p>
              <p className="font-semibold text-gray-900">Faith Muthoni</p>
              <p className="text-sm text-gray-500">+254 734 567 890</p>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="card mt-8 bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">✍️ Declaration</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            This constitution was adopted by the members of Mama Chama during the Annual General Meeting
            held on <strong>January 13, 2024</strong>. All current and future members are bound by these
            terms and conditions upon joining the group.
          </p>
          <p className="text-xs text-gray-400">
            Last amended: December 2024 | Next review: January 2025 AGM
          </p>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-12">
          <button onClick={onBack} className="btn-primary flex items-center gap-2 px-8">
            <ArrowLeft className="w-4 h-4" /> Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
}