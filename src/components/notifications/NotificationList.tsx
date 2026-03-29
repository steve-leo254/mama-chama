// src/components/notifications/NotificationList.tsx
import { Star, Paperclip, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Message, MessageFolder } from '../../types';

interface NotificationListProps {
  messages: Message[];
  selectedId: string | null;
  onSelect: (msg: Message) => void;
  folder: MessageFolder;
}

const categoryColors: Record<string, string> = {
  system: 'bg-gray-400',
  financial: 'bg-emerald-500',
  meeting: 'bg-primary-500',
  loan: 'bg-amber-500',
  personal: 'bg-purple-500',
  announcement: 'bg-rose-500',
};

export default function NotificationList({ messages, selectedId, onSelect, folder }: NotificationListProps) {
  const { toggleStarMessage } = useApp();

  const getTimeDisplay = (date: string, time: string) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return time;
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (today.getTime() - msgDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return msgDate.toLocaleDateString('en', { weekday: 'short' });
    }
    return msgDate.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-5xl mb-4">📭</span>
        <h3 className="font-semibold text-gray-900 mb-1">No messages</h3>
        <p className="text-sm text-gray-500">
          {folder === 'inbox' ? "Your inbox is empty" : `No messages in ${folder}`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
      {messages.filter(msg => msg && msg.id).map(msg => (
        <button
          key={msg.id}
          onClick={() => onSelect(msg)}
          className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all relative group ${
            selectedId === msg.id ? 'bg-primary-50/70 border-l-[3px] border-l-primary-500' : ''
          } ${!msg.read ? 'bg-white' : 'bg-gray-50/30'}`}
        >
          {/* Unread indicator */}
          {!msg.read && (
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full" />
          )}

          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                (msg.from_user || msg.from)?.role === 'system' ? 'bg-gradient-to-br from-primary-100 to-primary-200' : 'bg-gray-100'
              }`}>
                {(msg.from_user || msg.from)?.avatar || '👤'}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${categoryColors[msg.category] || 'bg-gray-400'}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`text-sm truncate ${!msg.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {folder === 'sent' ? `To: ${(msg.to_users || msg.to || []).map(t => t.name).join(', ') || 'Unknown'}` : ((msg.from_user || msg.from)?.name || 'Unknown')}
                </span>
                <span className="text-[11px] text-gray-400 flex-shrink-0 flex items-center gap-1">
                  {(msg.replies || []).length > 0 && (
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {msg.replies.length}
                    </span>
                  )}
                  {getTimeDisplay(msg.date, msg.time)}
                </span>
              </div>

              <p className={`text-sm truncate mb-0.5 ${!msg.read ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                {msg.subject || 'No subject'}
              </p>

              <p className="text-xs text-gray-500 truncate">{msg.preview || ''}</p>

              {/* Bottom Row: Labels + Actions */}
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  {(msg.labels || []).slice(0, 2).map(label => (
                    <span key={label} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      label === 'urgent' ? 'bg-rose-100 text-rose-600' :
                      label === 'important' ? 'bg-amber-100 text-amber-600' :
                      label === 'finance' ? 'bg-emerald-100 text-emerald-600' :
                      label === 'meeting' ? 'bg-primary-100 text-primary-600' :
                      label === 'loan' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {label}
                    </span>
                  ))}
                  {(msg.attachments || []).length > 0 && (
                    <Paperclip className="w-3 h-3 text-gray-400" />
                  )}
                </div>

                <div
                  onClick={(e) => { e.stopPropagation(); toggleStarMessage(msg.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                >
                  <Star className={`w-3.5 h-3.5 ${msg.starred ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-400'}`} />
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}