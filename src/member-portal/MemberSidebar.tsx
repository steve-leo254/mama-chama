// src/components/member-portal/MemberSidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, BarChart3,
  FileText, HandCoins, User, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/member', icon: LayoutDashboard, label: 'My Dashboard' },
  { to: '/member/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/member/group-reports', icon: BarChart3, label: 'Group Reports' },
  { to: '/member/my-reports', icon: FileText, label: 'My Reports' },
  { to: '/member/my-loans', icon: HandCoins, label: 'My Loans' },
  { to: '/member/profile', icon: User, label: 'My Profile' },
];

export default function MemberSidebar() {
  const { currentUser, logout } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🤝</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mama Chama</h1>
            <p className="text-xs text-emerald-600 font-medium">Member Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/member'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl">
          <span className="text-2xl">{currentUser?.avatar || '👩🏾'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-emerald-600">Member</p>
          </div>
          <button onClick={logout} className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors" title="Logout">
            <LogOut className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}