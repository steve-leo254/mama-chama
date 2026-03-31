// src/components/chat/ChatList.tsx
import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MessageCircle, Users, Inbox, Send, Star, Archive, Trash2, PenSquare, SlidersHorizontal, X, MailOpen, ChevronLeft } from 'lucide-react';
import ChatInterface from './ChatInterface';
import type { Member, Message, MessageFolder } from '../../types';

const FOLDERS = [
  { id: 'inbox' as MessageFolder, label: 'Inbox', icon: Inbox, color: 'text-primary-600' },
  { id: 'sent' as MessageFolder, label: 'Sent', icon: Send, color: 'text-emerald-600' },
  { id: 'starred' as MessageFolder, label: 'Starred', icon: Star, color: 'text-amber-500' },
  { id: 'trash' as MessageFolder, label: 'Trash', icon: Trash2, color: 'text-red-600' },
  { id: 'archive' as MessageFolder, label: 'Archive', icon: Archive, color: 'text-gray-600' },
];

export default function ChatList() {
  const { members, currentUser, getAllChatMessages, getMyMessages, unreadMessageCount, toggleReadMessage } = useApp();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<MessageFolder>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [viewMode, setViewMode] = useState<'folders' | 'chat'>('folders');

  // Get available chat partners (excluding current user)
  const availableMembers = useMemo(() => {
    return members.filter(member => 
      member.id !== currentUser?.id && member.status === 'active'
    );
  }, [members, currentUser]);

  // Get messages for current folder
  const messages = getMyMessages(activeFolder);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!search) return availableMembers;
    const searchLower = search.toLowerCase();
    return availableMembers.filter(member =>
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    );
  }, [availableMembers, search]);

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.subject.toLowerCase().includes(s) ||
        m.preview.toLowerCase().includes(s) ||
        (m.from_user && m.from_user.name.toLowerCase().includes(s))
      );
    }
    return filtered.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  }, [messages, search]);

  // Get last message for each member
  const getLastMessage = (memberId: string) => {
    const allMessages = getAllChatMessages();
    const chatMessages = allMessages.filter((msg: Message) => 
      msg.from_user && msg.from_user.id && msg.to_users &&
      ((msg.from_user.id === memberId && msg.to_users.some((to: any) => to.id === currentUser?.id)) ||
      (msg.from_user.id === currentUser?.id && msg.to_users.some((to: any) => to.id === memberId)))
    );
    return chatMessages.sort((a: Message, b: Message) => 
      new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
    )[0];
  };

  const getUnreadCount = (memberId: string) => {
    const allMessages = getAllChatMessages();
    return allMessages.filter((msg: Message) => 
      msg.from_user && msg.from_user.id === memberId && msg.to_users &&
      msg.to_users.some((to: any) => to.id === currentUser?.id) && 
      !msg.read
    ).length;
  };

  // Folder counts
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

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
  };

  const handleBackToMembers = () => {
    setSelectedMember(null);
  };

  if (selectedMember) {
    return (
      <div className="h-full flex">
        <ChatInterface 
          member={selectedMember} 
          onClose={handleBackToMembers} 
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-7 h-7 text-primary-600" />
              Member Chat
            </h2>
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('folders')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'folders' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Inbox className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('chat')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'chat' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            {viewMode === 'chat' 
              ? 'Chat with other members and stay connected'
              : 'Manage your messages and stay connected'
            }
            {unreadMessageCount > 0 && ` • ${unreadMessageCount} unread`}
          </p>
        </div>
        <div className="flex gap-2">
          {viewMode === 'folders' && (
            <button className="btn-primary flex items-center gap-2">
              <PenSquare className="w-4 h-4" /> Compose
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      {viewMode === 'chat' ? (
        <div className="h-full flex bg-white rounded-xl overflow-hidden">
          {/* Members List */}
          <div className="flex-1 flex flex-col">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Users className="w-12 h-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {search ? 'No members found' : 'No active members'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {search 
                      ? 'Try adjusting your search terms'
                      : 'All members are currently inactive'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredMembers.map(member => {
                    const lastMessage = getLastMessage(member.id);
                    const unreadCount = getUnreadCount(member.id);
                    
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left group"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {member.avatar}
                            </span>
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {member.name}
                            </h3>
                            {lastMessage && (
                              <span className="text-xs text-gray-500">
                                {lastMessage.time}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {lastMessage 
                                ? lastMessage.preview 
                                : `Start conversation with ${member.name.split(' ')[0]}`
                              }
                            </p>
                            {member.role && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {member.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
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
                  className="hidden lg:flex w-full items-center justify-center gap-2 mb-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-800 transition-all active:scale-[0.98]"
                >
                  <PenSquare className="w-5 h-5" /> Compose
                </button>

                {/* Folders */}
                <nav className="space-y-2 mb-6">
                  {FOLDERS.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => { setActiveFolder(folder.id); setSelectedMessage(null); setShowMobileList(true); setShowMobileSidebar(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                        activeFolder === folder.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <folder.icon className={`w-5 h-5 ${activeFolder === folder.id ? 'text-primary-600' : folder.color}`} />
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

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MailOpen className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {search ? 'No messages found' : 'No messages'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {search 
                        ? 'Try adjusting your search terms'
                        : 'Your messages will appear here'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map(message => (
                      <button
                        key={message.id}
                        onClick={() => handleSelectMessage(message)}
                        className={`w-full p-4 hover:bg-gray-50 transition-colors text-left group ${
                          selectedMessage?.id === message.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600">
                              {message.from_user?.avatar || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`text-sm ${message.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'} truncate`}>
                                {message.from_user?.name || 'Unknown'}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {message.time}
                              </span>
                            </div>
                            <h4 className={`text-sm ${message.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'} truncate mb-1`}>
                              {message.subject}
                            </h4>
                            <p className="text-xs text-gray-600 truncate">
                              {message.preview}
                            </p>
                          </div>
                          {!message.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className={`${!showMobileList || selectedMessage ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0`}>
            {selectedMessage ? (
              <div className="card flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={handleBack}
                    className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {selectedMessage.from_user?.avatar || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedMessage.from_user?.name || 'Unknown'}</h3>
                      <p className="text-xs text-gray-500">{selectedMessage.date} at {selectedMessage.time}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedMessage.subject}</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button className="btn-primary flex items-center gap-2">
                    <PenSquare className="w-4 h-4" /> Reply
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <Star className="w-4 h-4" /> Star
                  </button>
                  <button className="btn-secondary flex items-center gap-2 text-red-600">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="card flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                  <MailOpen className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Messages Hub
                </h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  Choose a message from the list to read it here, or compose a new message to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="btn-primary flex items-center gap-2">
                    <PenSquare className="w-4 h-4" /> Compose New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
