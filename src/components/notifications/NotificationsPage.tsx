// src/components/member-portal/MyNotifications.tsx
import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Search, X, CheckCheck, Trash2, Filter, Calendar, User, AlertTriangle, HandCoins, Users, PiggyBank, Megaphone, Heart } from 'lucide-react';
import type { Notification } from '../../types';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📬', icon: Bell },
  { id: 'system', label: 'System', emoji: '⚙️', icon: AlertTriangle, color: 'text-gray-600' },
  { id: 'financial', label: 'Financial', emoji: '💰', icon: PiggyBank, color: 'text-emerald-600' },
  { id: 'meeting', label: 'Meetings', emoji: '📅', icon: Calendar, color: 'text-blue-600' },
  { id: 'loan', label: 'Loans', emoji: '🏦', icon: HandCoins, color: 'text-amber-600' },
  { id: 'personal', label: 'Personal', emoji: '💌', icon: Heart, color: 'text-rose-600' },
  { id: 'announcement', label: 'News', emoji: '📢', icon: Megaphone, color: 'text-purple-600' },
];

const CATEGORY_ICONS = {
  system: AlertTriangle,
  financial: PiggyBank,
  meeting: Calendar,
  loan: HandCoins,
  personal: Heart,
  announcement: Megaphone,
};

const CATEGORY_COLORS = {
  system: 'text-gray-600 bg-gray-50 border-gray-200',
  financial: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  meeting: 'text-blue-600 bg-blue-50 border-blue-200',
  loan: 'text-amber-600 bg-amber-50 border-amber-200',
  personal: 'text-rose-600 bg-rose-50 border-rose-200',
  announcement: 'text-purple-600 bg-purple-50 border-purple-200',
};

export default function MyNotifications() {
  const { currentUser, getMemberNotifications, markNotificationRead, clearAllNotifications } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const notifications = currentUser ? getMemberNotifications(currentUser.id) : [];

  // Filter notifications by category and search
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }
    
    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(s) ||
        n.message.toLowerCase().includes(s)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notifications, selectedCategory, search]);

  // Count notifications by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = notifications.length;
      } else {
        counts[cat.id] = notifications.filter(n => n.category === cat.id).length;
      }
    });
    return counts;
  }, [notifications]);

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markNotificationRead(notification.id);
    }
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary-600" />
            My Notifications
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
              : 'All caught up! 🎉'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          <button 
            onClick={handleClearAll}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Categories</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            const count = categoryCounts[category.id] || 0;
            const isActive = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 border-2 border-primary-200' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                  {count > 0 && (
                    <span className={`min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      {showFilters && (
        <div className="card p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="card">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedCategory === 'all' ? 'No notifications yet' : `No ${CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase()} notifications`}
            </h3>
            <p className="text-gray-500 text-sm">
              {selectedCategory === 'all' 
                ? 'You\'ll see notifications here when there are updates'
                : `No notifications in this category yet`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const CategoryIcon = CATEGORY_ICONS[notification.category];
              const categoryInfo = CATEGORIES.find(c => c.id === notification.category);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      CATEGORY_COLORS[notification.category]
                    } border`}>
                      {CategoryIcon ? <CategoryIcon className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <span className="text-xs">{getNotificationIcon(notification.type)}</span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span>{categoryInfo?.emoji}</span>
                            {categoryInfo?.label}
                          </span>
                          <span>{notification.date}</span>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
