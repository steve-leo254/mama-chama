// src/components/chat/ChatList.tsx
import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MessageCircle, Users } from 'lucide-react';
import ChatInterface from './ChatInterface';
import type { Member, Message } from '../../types';

export default function ChatList() {
  const { members, currentUser, getAllChatMessages } = useApp();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');

  // Get available chat partners (excluding current user)
  const availableMembers = useMemo(() => {
    return members.filter(member => 
      member.id !== currentUser?.id && member.status === 'active'
    );
  }, [members, currentUser]);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!search) return availableMembers;
    const searchLower = search.toLowerCase();
    return availableMembers.filter(member =>
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    );
  }, [availableMembers, search]);

  // Get last message for each member
  const getLastMessage = (memberId: string) => {
    const allMessages = getAllChatMessages();
    const chatMessages = allMessages.filter((msg: Message) => 
      msg.from && msg.from.id && msg.to &&
      ((msg.from.id === memberId && msg.to.some((to: any) => to.id === currentUser?.id)) ||
      (msg.from.id === currentUser?.id && msg.to.some((to: any) => to.id === memberId)))
    );
    return chatMessages.sort((a: Message, b: Message) => 
      new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
    )[0];
  };

  const getUnreadCount = (memberId: string) => {
    const allMessages = getAllChatMessages();
    return allMessages.filter((msg: Message) => 
      msg.from && msg.from.id === memberId && msg.to &&
      msg.to.some((to: any) => to.id === currentUser?.id) && 
      !msg.read
    ).length;
  };

  if (selectedMember) {
    return (
      <div className="h-full flex">
        <ChatInterface 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <MessageCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-500">Chat with members</p>
          </div>
        </div>

        {/* Search */}
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
                  onClick={() => setSelectedMember(member)}
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
  );
}
