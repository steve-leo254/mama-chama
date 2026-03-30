// src/components/member-portal/MemberChat.tsx
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ChatInterface from '../components/chat/ChatInterface';
import {
  MessageCircle, PenSquare, Search, X, Users,
  Filter, MessageSquare, CheckCheck, Inbox, Send, Star, Archive, Trash2, ChevronLeft, MailOpen
} from 'lucide-react';
import type { Member, Message, MessageFolder } from '../types';

const FOLDERS = [
  { id: 'inbox' as MessageFolder, label: 'Inbox', icon: Inbox, color: 'text-primary-600' },
  { id: 'sent' as MessageFolder, label: 'Sent', icon: Send, color: 'text-emerald-600' },
  { id: 'starred' as MessageFolder, label: 'Starred', icon: Star, color: 'text-amber-500' },
  { id: 'trash' as MessageFolder, label: 'Trash', icon: Trash2, color: 'text-red-600' },
  { id: 'archive' as MessageFolder, label: 'Archive', icon: Archive, color: 'text-gray-600' },
];

export default function MemberChat() {
  const { members, currentUser, getAllChatMessages, getMyMessages, unreadMessageCount, toggleReadMessage } = useApp();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showCompose, setShowCompose] = useState(false);
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

  // Get all chat messages for filtering
  const allChatMessages = useMemo(() => {
    return getAllChatMessages().filter((msg: Message) => 
      msg.from && msg.from.id && msg.to &&
      (msg.from.id === currentUser?.id || msg.to.some((to: any) => to.id === currentUser?.id))
    );
  }, [getAllChatMessages, currentUser]);

  // Filter messages by search
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
    return filtered.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  }, [messages, search]);

  // Folder counts
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FOLDERS.forEach(f => {
      const msgs = getMyMessages(f.id);
      counts[f.id] = f.id === 'inbox' ? msgs.filter(m => !m.read).length : msgs.length;
    });
    return counts;
  }, [getMyMessages]);

  // Get unique members from filtered messages
  const chatMembers = useMemo(() => {
    const memberIds = new Set<string>();
    filteredMessages.forEach((msg: Message) => {
      if (msg.from && msg.from.id !== currentUser?.id) {
        memberIds.add(msg.from.id);
      }
      if (msg.to) {
        msg.to.forEach((to: any) => {
          if (to.id !== currentUser?.id) {
            memberIds.add(to.id);
          }
        });
      }
    });
    
    return availableMembers.filter(member => memberIds.has(member.id));
  }, [filteredMessages, availableMembers, currentUser]);

  // Get last message for each member
  const getLastMessage = (memberId: string) => {
    const memberMessages = allChatMessages.filter((msg: Message) => 
      (msg.from && msg.from.id === memberId && msg.to && msg.to.some((to: any) => to.id === currentUser?.id)) ||
      (msg.from && msg.from.id === currentUser?.id && msg.to && msg.to.some((to: any) => to.id === memberId))
    );
    return memberMessages.sort((a: Message, b: Message) => 
      new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
    )[0];
  };

  // Get unread count for each member
  const getUnreadCount = (memberId: string) => {
    return allChatMessages.filter((msg: Message) => 
      msg.from && msg.from.id === memberId && msg.to &&
      msg.to.some((to: any) => to.id === currentUser?.id) && 
      !msg.read
    ).length;
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setShowMobileList(false);
  };

  const handleBackToMembers = () => {
    setSelectedMember(null);
  };

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    setShowMobileList(false);
    if (!msg.read) toggleReadMessage(msg.id);
  };

  const handleBackToMessages = () => {
    setSelectedMessage(null);
    setShowMobileList(true);
  };

  if (selectedMember) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackToMembers}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">{selectedMember.avatar || '👤'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedMember.name}</h2>
              <p className="text-sm text-emerald-600">Active now</p>
            </div>
          </div>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <ChatInterface 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)} 
          />
        </div>
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
              <MessageCircle className="w-7 h-7 text-emerald-600" />
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
            <button onClick={() => setShowCompose(true)} className="btn-primary flex items-center gap-2">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
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
              {chatMembers.length === 0 ? (
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
                  {chatMembers.map((member) => {
                    const lastMessage = getLastMessage(member.id);
                    const unreadCount = getUnreadCount(member.id);
                    
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                              <span className="text-lg">{member.avatar || '👤'}</span>
                            </div>
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>
                          
                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {member.name}
                              </h4>
                              {lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {lastMessage.date}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-gray-600 truncate">
                                {lastMessage 
                                  ? lastMessage.preview || lastMessage.subject
                                  : 'Start a conversation...'
                                }
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                member.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {member.status}
                              </span>
                            </div>
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
                  onClick={() => setShowCompose(true)}
                  className="hidden lg:flex w-full items-center justify-center gap-2 mb-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-emerald-800 transition-all active:scale-[0.98]"
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
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <folder.icon className={`w-5 h-5 ${activeFolder === folder.id ? 'text-emerald-600' : folder.color}`} />
                        {folder.label}
                      </span>
                      {folderCounts[folder.id] > 0 && (
                        <span className={`min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-[11px] font-bold ${
                          folder.id === 'inbox' && folderCounts[folder.id] > 0
                            ? 'bg-emerald-600 text-white'
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
                    <Filter className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  <div className="p-8 text-center">
                    <MailOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Your messages will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map(message => (
                      <button
                        key={message.id}
                        onClick={() => handleSelectMessage(message)}
                        className={`w-full p-4 hover:bg-gray-50 transition-colors text-left group ${
                          selectedMessage?.id === message.id ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600">
                              {message.from?.avatar || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`text-sm ${message.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'} truncate`}>
                                {message.from?.name || 'Unknown'}
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
                            <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 mt-2"></div>
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
                    onClick={handleBackToMessages}
                    className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {selectedMessage.from?.avatar || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedMessage.from?.name || 'Unknown'}</h3>
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
                  <MessageCircle className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Messages Hub
                </h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  Choose a message from the list to read it here, or compose a new message to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setShowCompose(true)} className="btn-primary flex items-center gap-2">
                    <PenSquare className="w-4 h-4" /> Compose New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Start New Chat</h3>
                <button onClick={() => setShowCompose(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {availableMembers.slice(0, 5).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setShowCompose(false);
                    }}
                    className="w-full p-3 hover:bg-gray-50 rounded-xl text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <span className="text-sm">{member.avatar || '👤'}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.status}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
