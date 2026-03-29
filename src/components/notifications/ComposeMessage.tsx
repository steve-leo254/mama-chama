// src/components/notifications/ComposeMessage.tsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, Paperclip, Bold, Italic, List, Link2,
  Smile, Minimize2, Maximize2, Trash2, ChevronDown,
  Image as ImageIcon, FileText, Bell
} from 'lucide-react';
import type { Message } from '../../types';

interface ComposeMessageProps {
  onClose: () => void;
  replyTo: Message | null;
  forwardMessage?: Message | null;
  inline?: boolean;
  announcement?: boolean;
}

export default function ComposeMessage({ onClose, replyTo, forwardMessage, inline = false, announcement }: ComposeMessageProps) {
  const { currentUser, members, sendMessage, replyToMessage } = useApp();
  const [to, setTo] = useState(replyTo?.from?.name || '');
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject.replace(/^(Re: |Fwd: )+/, '')}` :
    forwardMessage ? `Fwd: ${forwardMessage.subject.replace(/^(Re: |Fwd: )+/, '')}` : ''
  );
  const [body, setBody] = useState(
    forwardMessage ? `<br/><br/>---------- Forwarded message ----------<br/><strong>From:</strong> ${forwardMessage.from?.name || 'Unknown'}<br/><strong>Date:</strong> ${forwardMessage.date}<br/><strong>Subject:</strong> ${forwardMessage.subject}<br/><br/>${forwardMessage.body}` : ''
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [sending, setSending] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);

  const availableRecipients = members.filter(m => m.id !== currentUser?.id && m.status === 'active');

  const handleSend = async () => {
    // Get content from editor
    const editorContent = editorRef.current?.innerHTML || '';
    const textContent = editorRef.current?.innerText || editorContent || body;
    
    console.log('Content debug:');
    console.log('- editorRef.current:', editorRef.current);
    console.log('- innerHTML:', editorContent);
    console.log('- innerText:', editorRef.current?.innerText);
    console.log('- body state:', body);
    console.log('- final content:', textContent);
    
    if (!textContent.trim()) {
      console.error('No content to send');
      return;
    }
    if (!currentUser) return;

    setSending(true);
    await new Promise(r => setTimeout(r, 800));

    const content = textContent;

    try {
      if (replyTo) {
        await replyToMessage(replyTo.id, content);
      } else if (announcement) {
        // Send to all active members
        const allMemberIds = availableRecipients.map(m => m.id);
        await sendMessage({
          from: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
          to_ids: allMemberIds,
          subject,
          body: content,
          preview: content.replace(/<[^>]*>/g, '').slice(0, 100),
          folder: 'sent',
          labels: [],
          attachments: [],
          category: 'announcement',
          priority: 'high',
        });
      } else {
        const recipient = availableRecipients.find(m => m.name === to);
        if (!recipient) {
          console.error('No recipient found for:', to);
          setSending(false);
          return;
        }
        
        await sendMessage({
          from: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
          to_ids: [recipient.id],
          subject,
          body: content,
          preview: content.replace(/<[^>]*>/g, '').slice(0, 100),
          folder: 'sent',
          labels: [],
          attachments: [],
          category: 'personal',
          priority: 'normal',
        });
      }

      // Only close on success
      setSending(false);
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      setSending(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Inline reply mode
  if (inline) {
    return (
      <div className="border-t border-gray-200 bg-white p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {replyTo?.from ? `Reply to ${replyTo.from.name}` : 'Forward'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-0.5 mb-2 p-1 bg-gray-50 rounded-lg">
          <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-200 rounded" title="Bold">
            <Bold className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-200 rounded" title="Italic">
            <Italic className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded" title="List">
            <List className="w-4 h-4 text-gray-500" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button className="p-1.5 hover:bg-gray-200 rounded" title="Attach">
            <Paperclip className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded" title="Emoji">
            <Smile className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[80px] max-h-[200px] overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 mb-3"
          data-placeholder="Write your reply..."
          onFocus={(e) => {
            if (e.currentTarget.innerHTML === '' || e.currentTarget.innerHTML === '<br>') {
              e.currentTarget.innerHTML = '';
            }
          }}
        />

        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            Discard
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            {sending ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span>
            ) : (
              <><Send className="w-4 h-4" /> Send Reply</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full compose modal
  return (
    <div className={`fixed z-50 ${isFullscreen ? 'inset-4' : 'bottom-0 right-4 sm:right-8 w-full sm:w-[520px]'} ${isMinimized ? 'h-12' : ''} transition-all duration-300`}>
      {/* Backdrop for mobile */}
      {isFullscreen && <div className="absolute inset-0 bg-black/30 -z-10 rounded-2xl" />}

      <div className={`bg-white rounded-t-2xl ${isFullscreen ? 'rounded-2xl h-full' : ''} shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${isMinimized ? 'h-12' : isFullscreen ? '' : 'h-[500px]'}`}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white rounded-t-2xl cursor-pointer"
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          <span className="font-semibold text-sm">
            {replyTo?.from ? `Reply to ${replyTo.from.name}` : forwardMessage ? 'Forward Message' : announcement ? 'Send Announcement' : 'New Message'}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-gray-700 rounded">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }} className="p-1 hover:bg-gray-700 rounded">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 hover:bg-gray-700 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* To / Subject */}
            {!announcement && (
              <div className="border-b border-gray-100">
                <div className="flex items-center border-b border-gray-50 px-4">
                  <span className="text-sm text-gray-500 w-12">To</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => { setTo(e.target.value); setShowRecipients(true); }}
                      onFocus={() => setShowRecipients(true)}
                      onBlur={() => setTimeout(() => setShowRecipients(false), 200)}
                      className="w-full py-2.5 text-sm focus:outline-none"
                      placeholder="Select recipient..."
                      readOnly={!!replyTo}
                    />
                    {showRecipients && !replyTo && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto mt-1">
                        {availableRecipients
                          .filter(m => m.name.toLowerCase().includes(to.toLowerCase()))
                          .map(m => (
                            <button
                              key={m.id}
                              onMouseDown={() => { setTo(m.name); setShowRecipients(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                            >
                              <span className="text-lg">{m.avatar}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{m.name}</p>
                                <p className="text-xs text-gray-500">{m.role}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {announcement && (
              <div className="bg-blue-50 border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    Sending to all {availableRecipients.length} active members
                  </span>
                </div>
              </div>
            )}
            <div className={`border-b border-gray-50 ${announcement ? 'border-t border-gray-100' : ''} px-4`}>
              <span className="text-sm text-gray-500 w-12">Sub</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full py-2.5 text-sm focus:outline-none"
                placeholder={announcement ? "Announcement subject..." : "Subject"}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-100 bg-gray-50">
              <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded-lg" title="Bold">
                <Bold className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded-lg" title="Italic">
                <Italic className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded-lg" title="Bullet List">
                <List className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => { const url = prompt('Enter URL:'); if (url) execCommand('createLink', url); }} className="p-2 hover:bg-gray-200 rounded-lg" title="Link">
                <Link2 className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button className="p-2 hover:bg-gray-200 rounded-lg" title="Attach File">
                <Paperclip className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg" title="Insert Image">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg" title="Emoji">
                <Smile className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto">
              <div
                ref={editorRef}
                contentEditable
                className="min-h-full p-4 text-sm text-gray-700 focus:outline-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: body }}
                suppressContentEditableWarning
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSend}
                  disabled={sending || (!to && !replyTo && !announcement)}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> {announcement ? 'Send Announcement' : 'Send'}</>
                  )}
                </button>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg" title="Discard">
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}