// src/components/layout/MobileNav.tsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, PiggyBank, HandCoins, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { CalendarDays, RefreshCw, Settings, Wallet, X } from 'lucide-react';

const mainItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/contributions', icon: PiggyBank, label: 'Savings' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
];

const moreItems = [
  { to: '/merry-go-round', icon: RefreshCw, label: 'Merry-Go-Round' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/meetings', icon: CalendarDays, label: 'Meetings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">More Options</h3>
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
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
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

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-gray-200 px-2 pb-safe">
        <div className="flex items-center justify-around">
          {mainItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
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