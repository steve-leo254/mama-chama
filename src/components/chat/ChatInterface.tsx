// src/components/chat/ChatInterface.tsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Paperclip, Smile, Search, Phone, Video, Info, Star, Archive, Trash2 } from 'lucide-react';
import type { Message, Member } from '../../types';

interface ChatInterfaceProps {
  member: Member;
  onClose?: () => void;
}

export default function ChatInterface({ member, onClose }: ChatInterfaceProps) {
  const { currentUser, sendMessage, getAllChatMessages, toggleStarMessage, archiveMessage, deleteMessage } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history
  useEffect(() => {
    const allMessages = getAllChatMessages();
    const chatMessages = allMessages.filter((msg: Message) => 
      msg.from && msg.from.id && msg.to &&
      ((msg.from.id === member.id && msg.to.some((to: any) => to.id === currentUser?.id)) ||
      (msg.from.id === currentUser?.id && msg.to.some((to: any) => to.id === member.id)))
    );
    setMessages(chatMessages.sort((a: Message, b: Message) => 
      new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
    ));
  }, [member, currentUser, getAllChatMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const messageData = {
      to_ids: [member.id], // Backend expects array of user IDs
      subject: 'Chat Message',
      body: newMessage,
      category: 'personal', // Must match MessageCategoryEnum
      priority: 'normal', // Must match MessagePriorityEnum
      labels: []
    };

    try {
      await sendMessage(messageData);
      
      // Add optimistic message to local state
      const localMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
        to: [{ id: member.id, name: member.name }],
        subject: 'Chat Message',
        body: newMessage,
        preview: newMessage.substring(0, 100),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        starred: false,
        folder: 'sent' as const,
        category: 'personal' as const,
        priority: 'normal' as const,
        attachments: [],
        replies: [],
        labels: []
      };

      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');
      simulateTyping(); // Simulate other person typing back
      
      // Focus back to input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Message action handlers
  const handleStarMessage = async (messageId: string) => {
    try {
      await toggleStarMessage(messageId);
      // Refresh messages to update the UI
      const allMessages = getAllChatMessages();
      const chatMessages = allMessages.filter((msg: Message) => 
        msg.from && msg.from.id && msg.to &&
        ((msg.from.id === member.id && msg.to.some((to: any) => to.id === currentUser?.id)) ||
        (msg.from.id === currentUser?.id && msg.to.some((to: any) => to.id === member.id)))
      );
      setMessages(chatMessages.sort((a: Message, b: Message) => 
        new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
      ));
    } catch (error) {
      console.error('Failed to star message:', error);
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await archiveMessage(messageId);
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to archive message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const formatMessageTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isOwnMessage = (message: Message) => message.from && message.from.id === currentUser?.id;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">{member.avatar}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <p className="text-xs text-green-600">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="p-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in conversation..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'} group relative`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              isOwnMessage(message) 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            } rounded-2xl px-4 py-2 shadow-sm`}>
              {!isOwnMessage(message) && message.from && (
                <p className="text-xs font-medium mb-1 opacity-75">{message.from.name}</p>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.body}</p>
              <p className={`text-xs mt-1 ${isOwnMessage(message) ? 'text-primary-200' : 'text-gray-500'}`}>
                {formatMessageTime(message.time)}
              </p>
            </div>
            
            {/* Message Actions - Show on hover */}
            <div className={`absolute top-0 ${isOwnMessage(message) ? 'left-full -ml-8' : 'right-full -mr-8'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
              <button
                onClick={() => handleStarMessage(message.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  message.starred 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                } shadow-sm`}
                title={message.starred ? 'Unstar message' : 'Star message'}
              >
                <Star className="w-4 h-4" fill={message.starred ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => handleArchiveMessage(message.id)}
                className="p-1.5 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                title="Archive message"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteMessage(message.id)}
                className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all resize-none"
              style={{ minHeight: '48px' }}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
