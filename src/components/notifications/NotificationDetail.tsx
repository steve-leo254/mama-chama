import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ComposeMessage from './ComposeMessage';
import {
  ArrowLeft, Star, Archive, Trash2, Reply, ReplyAll, Forward,
  MoreVertical, Paperclip, Download, FileText, Image, Sheet,
  Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import type { Message, MessageAttachment } from '../../types';

interface NotificationDetailProps {
  message: Message;
  onBack: () => void;
  onCompose: () => void;
}

const attachmentIcons: Record<string, any> = {
  pdf: FileText,
  image: Image,
  doc: FileText,
  xlsx: Sheet,
};

const attachmentColors: Record<string, string> = {
  pdf: 'bg-rose-100 text-rose-600',
  image: 'bg-primary-100 text-primary-600',
  doc: 'bg-blue-100 text-blue-600',
  xlsx: 'bg-emerald-100 text-emerald-600',
};

export default function NotificationDetail({ message, onBack, onCompose }: NotificationDetailProps) {
  const { toggleStarMessage, archiveMessage, deleteMessage, permanentDeleteMessage } = useApp();
  const [showReply, setShowReply] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [replyMode, setReplyMode] = useState<'reply' | 'forward'>('reply');
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false);

  const visibleReplies = showAllReplies ? (message.replies || []) : (message.replies || []).slice(-2);
  const hiddenCount = (message.replies || []).length - 2;

  const renderAttachment = (att: MessageAttachment) => {
    const Icon = attachmentIcons[att.type] || FileText;
    const color = attachmentColors[att.type] || 'bg-gray-100 text-gray-600';
    return (
      <div key={att.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer group">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{att.name}</p>
          <p className="text-xs text-gray-500">{att.size}</p>
        </div>
        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-lg transition-all">
          <Download className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    );
  };

  return (
    <div className="card flex-1 flex flex-col overflow-hidden p-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-1">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl lg:hidden">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={() => toggleStarMessage(message.id)} className="p-2 hover:bg-gray-100 rounded-xl" title="Star">
            <Star className={`w-5 h-5 ${message.starred ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
          </button>
          <button onClick={() => archiveMessage(message.id)} className="p-2 hover:bg-gray-100 rounded-xl" title="Archive">
            <Archive className="w-5 h-5 text-gray-400" />
          </button>
          {message.folder === 'trash' ? (
            <button 
              onClick={() => setShowPermanentDeleteConfirm(true)} 
              className="p-2 hover:bg-red-100 rounded-xl" 
              title="Delete Permanently"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          ) : (
            <button onClick={() => { deleteMessage(message.id); onBack(); }} className="p-2 hover:bg-gray-100 rounded-xl" title="Delete">
              <Trash2 className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setReplyMode('reply'); setShowReply(true); }} className="p-2 hover:bg-gray-100 rounded-xl" title="Reply">
            <Reply className="w-5 h-5 text-gray-400" />
          </button>
          <button onClick={() => { setReplyMode('forward'); setShowReply(true); }} className="p-2 hover:bg-gray-100 rounded-xl" title="Forward">
            <Forward className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Subject */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">{message.subject}</h2>

          {/* Sender Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
              (message.from_user || message.from) && (message.from_user || message.from)?.role === 'system' ? 'bg-gradient-to-br from-primary-100 to-primary-200' : 'bg-gray-100'
            }`}>
              {(message.from_user || message.from)?.avatar || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{(message.from_user || message.from)?.name || 'Unknown'}</span>
                {(message.from_user || message.from) && (message.from_user || message.from)?.role !== 'member' && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    (message.from_user || message.from)?.role === 'system' ? 'bg-primary-100 text-primary-700' :
                    (message.from_user || message.from)?.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                    (message.from_user || message.from)?.role === 'treasurer' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {(message.from_user || message.from)?.role}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>to {(message.to_users || message.to || []).map(t => t.name).join(', ') || 'Unknown'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {message.date} at {message.time}
                </span>
              </div>
            </div>

            {/* Priority Badge */}
            {message.priority === 'high' && (
              <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase flex-shrink-0">
                High Priority
              </span>
            )}
          </div>

          {/* Labels */}
          {(message.labels || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(message.labels || []).map(label => (
                <span key={label} className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  label === 'urgent' ? 'bg-rose-100 text-rose-700' :
                  label === 'important' ? 'bg-amber-100 text-amber-700' :
                  label === 'finance' ? 'bg-emerald-100 text-emerald-700' :
                  label === 'meeting' ? 'bg-primary-100 text-primary-700' :
                  label === 'loan' ? 'bg-purple-100 text-purple-700' :
                  label === 'reminder' ? 'bg-teal-100 text-teal-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Body */}
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: message.body }}
          />

          {/* Attachments */}
          {(message.attachments || []).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments {(message.attachments || []).length}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(message.attachments || []).map(renderAttachment)}
              </div>
            </div>
          )}

          {/* Replies / Thread */}
          {(message.replies || []).length > 0 && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Reply className="w-4 h-4" />
                {(message.replies || []).length} {(message.replies || []).length === 1 ? 'Reply' : 'Replies'}
              </h4>

              {/* Show more toggle */}
              {hiddenCount > 0 && !showAllReplies && (
                <button
                  onClick={() => setShowAllReplies(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show {hiddenCount} earlier {hiddenCount === 1 ? 'reply' : 'replies'}
                </button>
              )}

              {showAllReplies && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllReplies(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-sm text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </button>
              )}

              <div className="space-y-4">
                {visibleReplies.map(reply => (
                  <div key={reply.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                        {reply.from?.avatar || '👤'}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{reply.from?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400 ml-2">{reply.date} at {reply.time}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 pl-11" dangerouslySetInnerHTML={{ __html: reply.body }} />
                    {(reply.attachments || []).length > 0 && (
                      <div className="pl-11 mt-2 space-y-1">
                        {(reply.attachments || []).map(renderAttachment)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reply Bar */}
      {!showReply ? (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={() => { setReplyMode('reply'); setShowReply(true); }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-100 hover:border-gray-300 transition-all text-left"
          >
            <Reply className="w-4 h-4" />
            Click to reply...
          </button>
        </div>
      ) : (
        <ComposeMessage
          onClose={() => setShowReply(false)}
          replyTo={replyMode === 'reply' ? message : null}
          forwardMessage={replyMode === 'forward' ? message : null}
          inline
        />
      )}

      {/* Permanent Delete Confirmation Dialog */}
      {showPermanentDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Permanently?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete "{message.subject}" and remove it from the system. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPermanentDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  permanentDeleteMessage(message.id);
                  setShowPermanentDeleteConfirm(false);
                  onBack();
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}