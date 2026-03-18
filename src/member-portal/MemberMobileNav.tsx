// src/components/member-portal/MemberMobileNav.tsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart3, FileText, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { HandCoins, User, X } from 'lucide-react';

const mainItems = [
  { to: '/member', icon: LayoutDashboard, label: 'Home' },
  { to: '/member/transactions', icon: ArrowLeftRight, label: 'Transact' },
  { to: '/member/group-reports', icon: BarChart3, label: 'Group' },
  { to: '/member/my-reports', icon: FileText, label: 'Reports' },
];

const moreItems = [
  { to: '/member/my-loans', icon: HandCoins, label: 'My Loans' },
  { to: '/member/profile', icon: User, label: 'Profile' },
];

export default function MemberMobileNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">More</h3>
              <button onClick={() => setShowMore(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-gray-200 px-2 pb-safe">
        <div className="flex items-center justify-around">
          {mainItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/member'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium text-gray-500"
          >
            <MoreHorizontal className="w-5 h-5" />
            More
          </button>
        </div>
      </nav>
    </>
  );
}