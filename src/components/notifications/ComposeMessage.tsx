// src/components/notifications/ComposeMessage.tsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Send, Paperclip, Bold, Italic, List, Link2,
  Smile, Minimize2, Maximize2, Trash2, ChevronDown,
  Image as ImageIcon, FileText, Bell, AlertTriangle, 
  Users, BarChart3, Plus, Upload, File
} from 'lucide-react';
import type { Message } from '../../types';
import { pollsAPI } from '../../services/api';

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

  // Phase 2: Rich Communication Features
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal'>('normal');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'message' | 'poll' | 'group'>('message');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll data state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [anonymousVoting, setAnonymousVoting] = useState(false);

  const availableRecipients = members.filter(m => m.id !== currentUser?.id && m.status === 'active');

  // Helper functions
  const removeEmptyPollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleSend = async () => {
    if (!currentUser) return;
    
    // Handle poll creation
    if (messageType === 'poll') {
      if (!pollQuestion.trim()) {
        alert('Please enter a poll question');
        return;
      }
      
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        alert('Please enter at least 2 poll options');
        return;
      }

      setSending(true);
      try {
        const pollData = {
          title: pollQuestion,
          description: subject || undefined,
          allow_multiple_votes: allowMultipleVotes,
          anonymous_voting: anonymousVoting,
          options: validOptions.map((option, index) => ({
            option_text: option,
            option_order: index
          }))
        };

        const poll = await pollsAPI.create(pollData);
        
        // Send notification about new poll
        const pollMessage = `📊 New Poll: ${pollQuestion}\n\n${validOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nVote now!`;
        
        if (announcement) {
          const allMemberIds = availableRecipients.map(m => m.id);
          await sendMessage({
            from: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
            to_ids: allMemberIds,
            subject: `📊 Poll: ${pollQuestion}`,
            body: pollMessage,
            preview: pollMessage.slice(0, 100),
            folder: 'sent',
            labels: ['poll'],
            attachments: [],
            category: 'announcement',
            priority: priority,
            poll_id: poll.id, // Store poll ID for easy linking
          });
        } else {
          const recipient = availableRecipients.find(m => m.name === to);
          if (recipient) {
            await sendMessage({
              from: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
              to_ids: [recipient.id],
              subject: `📊 Poll: ${pollQuestion}`,
              body: pollMessage,
              preview: pollMessage.slice(0, 100),
              folder: 'sent',
              labels: ['poll'],
              attachments: [],
              category: 'personal',
              priority: priority,
              poll_id: poll.id, // Store poll ID for easy linking
            });
          }
        }

        setSending(false);
        onClose();
        return;
      } catch (error) {
        console.error('Failed to create poll:', error);
        setSending(false);
        alert('Failed to create poll. Please try again.');
        return;
      }
    }

    // Regular message handling
    const editorContent = editorRef.current?.innerHTML || '';
    const textContent = editorRef.current?.innerText || editorContent || body;
    
    if (!textContent.trim()) {
      console.error('No content to send');
      return;
    }

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
          priority: priority,
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
          priority: priority,
        });
      }

      setSending(false);
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      setSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
    <>
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

              {/* Priority & Message Type */}
              <div className="border-b border-gray-50 px-4 py-2 bg-gray-50">
                <div className="flex items-center gap-4">
                  {/* Priority Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Priority:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPriority('urgent')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          priority === 'urgent' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        🔴 Urgent
                      </button>
                      <button
                        onClick={() => setPriority('high')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          priority === 'high' 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        🟡 High
                      </button>
                      <button
                        onClick={() => setPriority('normal')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          priority === 'normal' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        🟢 Normal
                      </button>
                    </div>
                  </div>

                  {/* Message Type */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Type:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setMessageType('message')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          messageType === 'message' 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        💬 Message
                      </button>
                      <button
                        onClick={() => setShowPollModal(true)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          messageType === 'poll' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        📊 Poll
                      </button>
                      <button
                        onClick={() => setShowGroupModal(true)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          messageType === 'group' 
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        👥 Group
                      </button>
                    </div>
                  </div>
                </div>
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
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 hover:bg-gray-200 rounded-lg" 
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 hover:bg-gray-200 rounded-lg" 
                  title="Insert Image"
                >
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg" title="Emoji">
                  <Smile className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
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

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Attachments ({attachments.length})</span>
                  </div>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Remove attachment"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSend}
                    disabled={sending || (!to && !replyTo && !announcement && messageType !== 'poll')}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> {
                        messageType === 'poll' ? 'Create Poll' :
                        announcement ? 'Send Announcement' : 'Send'
                      }</>
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

      {/* Poll Creation Modal */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Create Poll
                </h3>
                <button onClick={() => setShowPollModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poll Question</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What's your poll question?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poll Options</label>
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    ))}
                    {pollOptions.length < 5 && (
                      <button
                        type="button"
                        onClick={addPollOption}
                        className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poll Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allowMultipleVotes}
                        onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm text-gray-700">Allow multiple selections</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={anonymousVoting}
                        onChange={(e) => setAnonymousVoting(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm text-gray-700">Anonymous responses</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowPollModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPollModal(false);
                  setMessageType('poll');
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Selection Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Select Groups
                </h3>
                <button onClick={() => setShowGroupModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">All Members</p>
                    <p className="text-sm text-gray-500">Send to all active members</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{availableRecipients.length} members</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Loan Committee</p>
                    <p className="text-sm text-gray-500">Members with loan privileges</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">8 members</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Event Planning</p>
                    <p className="text-sm text-gray-500">Members organizing events</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">5 members</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New Members</p>
                    <p className="text-sm text-gray-500">Recently joined members</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">3 members</span>
                </label>
              </div>
              
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <button className="flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-800">
                  <Plus className="w-4 h-4" />
                  Create New Group
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setMessageType('group');
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Select Groups
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
