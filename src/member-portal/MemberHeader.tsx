// src/components/member-portal/MemberHeader.tsx
import { Bell, Search, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MemberHeader() {
  const { currentUser, getMemberNotifications, markNotificationRead, clearAllNotifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const myNotifications = currentUser ? getMemberNotifications(currentUser.id) : [];
  const unread = myNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-sm">🤝</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Mama Chama</h1>
        </div>

        <div className="hidden lg:block">
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h2 className="text-lg font-bold text-gray-900">{currentUser?.name}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-slide-up">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <button 
                      onClick={() => {
                        navigate('/member/notifications');
                        setShowNotifications(false);
                      }}
                      className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      My Notifications
                    </button>
                    {unread > 0 && (
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {myNotifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-emerald-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                            notif.type === 'success' ? 'bg-emerald-500' :
                            notif.type === 'warning' ? 'bg-amber-500' :
                            notif.type === 'error' ? 'bg-rose-500' : 'bg-primary-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg">
            {currentUser?.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}