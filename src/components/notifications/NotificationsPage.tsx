// src/components/notifications/NotificationsPage.tsx
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import NotificationList from './NotificationList';
import NotificationDetail from './NotificationDetail';
import ComposeMessage from './ComposeMessage';
import ChatList from '../chat/ChatList';
import {
  Inbox, Send, Star, Archive, Trash2, Mail, PenSquare,
  Search, SlidersHorizontal, ChevronLeft, X, Bell,
  Filter, MailOpen, CheckCheck, MessageCircle
} from 'lucide-react';
import type { Message, MessageFolder } from '../../types';

const FOLDERS = [
  { id: 'inbox' as MessageFolder, label: 'Inbox', icon: Inbox, color: 'text-primary-600' },
  { id: 'sent' as MessageFolder, label: 'Sent', icon: Send, color: 'text-emerald-600' },
  { id: 'starred' as MessageFolder, label: 'Starred', icon: Star, color: 'text-amber-500' },
  { id: 'trash' as MessageFolder, label: 'Trash', icon: Trash2, color: 'text-red-600' },
  { id: 'archive' as MessageFolder, label: 'Archive', icon: Archive, color: 'text-gray-600' },
];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📬' },
  { id: 'system', label: 'System', emoji: '⚙️' },
  { id: 'financial', label: 'Financial', emoji: '💰' },
  { id: 'meeting', label: 'Meetings', emoji: '📅' },
  { id: 'loan', label: 'Loans', emoji: '🏦' },
  { id: 'personal', label: 'Personal', emoji: '💌' },
  { id: 'announcement', label: 'News', emoji: '📢' },
  { id: 'new-category', label: 'New Category', emoji: '🎉' },
];

export default function NotificationsPage() {
  const { getMyMessages, unreadMessageCount, toggleReadMessage, portalMode } = useApp();
  const [activeFolder, setActiveFolder] = useState<MessageFolder>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [viewMode, setViewMode] = useState<'messages' | 'chat'>('messages');

  const isAdmin = portalMode === 'admin';
  const messages = getMyMessages(activeFolder);

  // Debug logging
  console.log('=== NOTIFICATIONS DEBUG ===');
  console.log('Active folder:', activeFolder);
  console.log('Category filter:', categoryFilter);
  console.log('Raw messages count:', messages.length);
  console.log('Raw messages:', messages.map(m => ({ id: m.id, subject: m.subject, category: m.category, folder: m.folder })));

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.subject.toLowerCase().includes(s) ||
        m.preview.toLowerCase().includes(s) ||
        (m.from && m.from.name.toLowerCase().includes(s))
      );
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }
    return filtered.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  }, [messages, search, categoryFilter]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FOLDERS.forEach(f => {
      const msgs = getMyMessages(f.id);
      counts[f.id] = f.id === 'inbox' ? msgs.filter(m => !m.read).length : msgs.length;
    });
    return counts;
  }, [getMyMessages]);

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    setShowMobileList(false);
    if (!msg.read) toggleReadMessage(msg.id);
  };

  const handleBack = () => {
    setSelectedMessage(null);
    setShowMobileList(true);
  };

  const markAllRead = () => {
    messages.filter(m => !m.read).forEach(m => toggleReadMessage(m.id));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-7 h-7 text-primary-600" />
              {isAdmin ? 'Member Communications' : 'Messages'}
            </h2>
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('messages')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'messages' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('chat')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'chat' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            {isAdmin 
              ? `${viewMode === 'chat' 
                  ? 'Real-time chat with members' 
                  : 'Manage communications with all members'
                }${unreadMessageCount > 0 ? ` • ${unreadMessageCount} unread` : ''}`
              : viewMode === 'chat'
                ? 'Chat with other members'
                : (unreadMessageCount > 0 
                    ? `${unreadMessageCount} unread message${unreadMessageCount > 1 ? 's' : ''}` 
                    : 'All caught up! 🎉'
                )
            }
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && viewMode === 'messages' && (
            <button onClick={() => setShowAnnouncement(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" /> Send Announcement
            </button>
          )}
          {unreadMessageCount > 0 && viewMode === 'messages' && (
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {viewMode === 'messages' && (
            <button onClick={() => setShowCompose(true)} className="btn-primary flex items-center gap-2">
              <PenSquare className="w-4 h-4" /> {isAdmin ? 'Compose to Members' : 'Compose'}
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      {viewMode === 'chat' ? (
        <ChatList />
      ) : (
        <div className="flex gap-6 min-h-[calc(100vh-220px)]">
          {/* Sidebar - Folders */}
          <div className={`${showMobileSidebar ? 'fixed inset-0 z-40 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'} lg:block lg:w-56 flex-shrink-0`}>
            <div className={`${showMobileSidebar ? 'w-72 h-full bg-white p-4 animate-slide-in-left' : ''} lg:w-full`}>
              {showMobileSidebar && (
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h3 className="font-bold text-gray-900">Folders</h3>
                  <button onClick={() => setShowMobileSidebar(false)}><X className="w-5 h-5" /></button>
                </div>
              )}
              <div className="card p-2 h-full overflow-y-auto">
                {/* Compose Button (Desktop) */}
                <button
                  onClick={() => setShowCompose(true)}
                  className="hidden lg:flex w-full items-center justify-center gap-2 mb-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-800 transition-all active:scale-[0.98]"
                >
                  <PenSquare className="w-5 h-5" /> Compose
                </button>

                {/* Folders */}
                <nav className="space-y-1 mb-6">
                  {FOLDERS.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => { setActiveFolder(folder.id); setSelectedMessage(null); setShowMobileList(true); setShowMobileSidebar(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeFolder === folder.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <folder.icon className={`w-4.5 h-4.5 ${activeFolder === folder.id ? 'text-primary-600' : folder.color}`} />
                        {folder.label}
                      </span>
                      {folderCounts[folder.id] > 0 && (
                        <span className={`min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-[11px] font-bold ${
                          folder.id === 'inbox' && folderCounts[folder.id] > 0
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {folderCounts[folder.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                {/* Categories */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Categories</p>
                  <div className="space-y-0.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                          categoryFilter === cat.id
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <span className="text-sm">{cat.emoji}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className={`${showMobileList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-96 flex-shrink-0`}>
            <div className="card p-0 flex-1 flex flex-col overflow-hidden min-h-[600px]">
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex gap-2">
                  <button onClick={() => setShowMobileSidebar(true)} className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* List */}
              <NotificationList
                messages={filteredMessages}
                selectedId={selectedMessage?.id || null}
                onSelect={handleSelectMessage}
                folder={activeFolder}
              />
            </div>
          </div>

          {/* Message Detail */}
          <div className={`${!showMobileList || selectedMessage ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0`}>
            {selectedMessage ? (
              <NotificationDetail
                message={selectedMessage}
                onBack={handleBack}
                onCompose={() => setShowCompose(true)}
              />
            ) : (
              <div className="card flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                  <MailOpen className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isAdmin ? 'Communications Hub' : 'Select a message'}
                </h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  {isAdmin 
                    ? 'Send announcements, reminders, and personal messages to members. Keep everyone informed and engaged.'
                    : 'Choose a message from the list to read it here, or compose a new message to get started.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {isAdmin && (
                    <button onClick={() => setShowAnnouncement(true)} className="btn-secondary flex items-center gap-2">
                      <Bell className="w-4 h-4" /> Send Announcement
                    </button>
                  )}
                  <button onClick={() => setShowCompose(true)} className="btn-primary flex items-center gap-2">
                    <PenSquare className="w-4 h-4" /> {isAdmin ? 'Compose to Members' : 'Compose New'}
                  </button>
                </div>
                {isAdmin && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 max-w-sm">
                    <p className="text-xs text-blue-700">
                      <strong>💡 Admin Tip:</strong> Use categories to organize messages by type (Financial, Meetings, Loans, etc.) for better member communication.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <ComposeMessage
          onClose={() => setShowCompose(false)}
          replyTo={null}
        />
      )}

      {/* Announcement Modal */}
      {showAnnouncement && (
        <ComposeMessage
          onClose={() => setShowAnnouncement(false)}
          replyTo={null}
          announcement={true}
        />
      )}
    </div>
  );
}