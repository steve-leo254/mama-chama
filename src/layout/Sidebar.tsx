// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, HandCoins, CalendarDays,
  RefreshCw, Settings, LogOut, PiggyBank
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/contributions', icon: PiggyBank, label: 'Contributions' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/merry-go-round', icon: RefreshCw, label: 'Merry-Go-Round' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/meetings', icon: CalendarDays, label: 'Meetings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { currentUser, logout } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
            <span className="text-xl">🤝</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mama Chama</h1>
            <p className="text-xs text-gray-500">Savings & Investment</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
          <span className="text-2xl">{currentUser?.avatar || '👩🏾'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser?.role || 'member'}</p>
          </div>
          <button onClick={logout} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors" title="Logout">
            <LogOut className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}