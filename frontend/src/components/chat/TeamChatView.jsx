import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  CheckCheck, 
  Users, 
  Paperclip, 
  Image as ImageIcon, 
  X,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Search,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const TeamChatView = () => {
  const { 
    messages, 
    sendMessage, 
    currentUser, 
    setCurrentTab,
    founders,
    uploadFile,
    markChatAsRead
  } = usePortal();

  // Active chat: null for Group #founders-circle, or a founder object for 1-on-1 DM
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null); // { file, previewUrl, isUploading }
  const [isUploading, setIsUploading] = useState(false);
  const [showChannelListMobile, setShowChannelListMobile] = useState(true);
  const [searchDm, setSearchDm] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // List of other founders + admin for DMs
  const dmContacts = founders.filter(f => f.id !== currentUser?.id);

  // Filter messages based on active chat
  const activeMessages = messages.filter(m => {
    if (selectedRecipient) {
      // 1-on-1 DM
      return (
        (m.senderId === currentUser?.id && m.recipientId === selectedRecipient.id) ||
        (m.senderId === selectedRecipient.id && m.recipientId === currentUser?.id)
      );
    } else {
      // Group #founders-circle
      return !m.recipientId || m.channelId === 'group';
    }
  });

  // Mark messages as read for active chat
  useEffect(() => {
    if (selectedRecipient) {
      markChatAsRead('dm', selectedRecipient.id);
    } else {
      markChatAsRead('group', null);
    }
  }, [selectedRecipient]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedRecipient]);

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setSelectedMedia({ file, previewUrl, name: file.name });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedMedia) return;

    let mediaUrl = null;
    let mediaType = 'image';

    if (selectedMedia) {
      try {
        setIsUploading(true);
        const res = await uploadFile(selectedMedia.file, 'founders/chat', 'auto');
        if (res.success && res.url) {
          mediaUrl = res.url;
          mediaType = selectedMedia.file.type.startsWith('video') ? 'video' : 'image';
        }
      } catch (err) {
        console.error('Chat media upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    }

    const payload = {
      text: inputText.trim(),
      recipientId: selectedRecipient ? selectedRecipient.id : null,
      channelId: selectedRecipient ? 'dm' : 'group',
      mediaUrl,
      mediaType
    };

    setInputText('');
    setSelectedMedia(null);
    await sendMessage(payload);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#fbf9f6] text-slate-800 select-none overflow-hidden w-full h-full max-w-full box-border">
      
      {/* ========================================================
          LEFT: Conversations Sidebar (Groups + Direct DMs)
          ======================================================== */}
      <aside className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 transition-all ${
        showChannelListMobile ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* Sidebar Header */}
        <div className="h-14 md:h-16 bg-slate-900 border-b border-orange-500/20 text-white px-3 sm:px-4 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playPop();
                setCurrentTab('dashboard');
              }}
              title="Return to Dashboard"
              className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-sm tracking-tight">Chats & Direct Messages</h2>
          </div>
          <span className="text-[10px] font-mono bg-orange-600/90 text-white px-2 py-0.5 rounded-full">Executive</span>
        </div>

        {/* Search Contacts */}
        <div className="p-2.5 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchDm}
              onChange={(e) => setSearchDm(e.target.value)}
              placeholder="Search founders or DMs..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Conversation Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          
          {/* 1. Official Group Chat */}
          <div
            onClick={() => {
              sound.playPop();
              setSelectedRecipient(null);
              setShowChannelListMobile(false);
            }}
            className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
              selectedRecipient === null ? 'bg-orange-50/90 border-r-4 border-orange-600' : 'hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 truncate">Founders Circle (Group)</h4>
                <span className="text-[10px] text-orange-600 font-mono font-bold">Live</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                All 3 Founders + SSA Lead Admin
              </p>
            </div>
          </div>

          {/* 2. Direct Messages (1-on-1) Section Title */}
          <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Direct Messages (1-on-1)
          </div>

          {/* List of Contacts for Direct Messaging */}
          {dmContacts
            .filter(c => c.name.toLowerCase().includes(searchDm.toLowerCase()))
            .map((contact) => {
              const isSelected = selectedRecipient?.id === contact.id;

              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    sound.playPop();
                    setSelectedRecipient(contact);
                    setShowChannelListMobile(false);
                  }}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-orange-50/90 border-r-4 border-orange-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                      alt={contact.name} 
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200 aspect-square" 
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        <span>{contact.name}</span>
                        {contact.role === 'superadmin' && (
                          <ShieldCheck className="w-3 h-3 text-orange-600" />
                        )}
                      </h4>
                      <span className="text-[10px] font-medium text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200 font-mono">DM</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {contact.designation || (contact.role === 'superadmin' ? 'Lead Admin' : 'Founder')}
                    </p>
                  </div>
                </div>
              );
            })}

        </div>
      </aside>

      {/* ========================================================
          RIGHT: Active Chat Messages Canvas & Composer
          ======================================================== */}
      <div className={`flex-1 flex flex-col h-full min-w-0 w-full max-w-full overflow-hidden ${
        showChannelListMobile ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Chat Top Header */}
        <header className="h-14 md:h-16 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-2.5 sm:px-3.5 md:px-5 flex items-center justify-between shadow-md shadow-orange-600/20 shrink-0 z-10 w-full min-w-0 box-border">
          
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 mr-2">
            {/* Mobile Channel Switcher Button */}
            <button
              onClick={() => setShowChannelListMobile(true)}
              className="md:hidden flex items-center gap-0.5 p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer shrink-0"
              title="Show Conversations"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-bold">Chats</span>
            </button>

            {/* Avatar & Header Name */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative shrink-0">
                {selectedRecipient ? (
                  <img
                    src={selectedRecipient.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={selectedRecipient.name}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-white/80 aspect-square"
                  />
                ) : (
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-orange-700 to-amber-700 flex items-center justify-center font-bold text-white shadow-inner">
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-orange-600" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xs md:text-sm font-bold tracking-tight leading-tight flex items-center gap-1 text-white truncate">
                  <span className="truncate">{selectedRecipient ? selectedRecipient.name : 'Founders Circle'}</span>
                  {selectedRecipient && (
                    <span className="text-[9px] font-mono bg-white/20 px-1 py-0.2 rounded text-white shrink-0">
                      DM
                    </span>
                  )}
                </h2>
                <p className="text-[10px] md:text-[11px] text-orange-100/90 leading-tight truncate">
                  {selectedRecipient ? (selectedRecipient.designation || 'Online') : 'Soham, Sayantan, Achinta, SSA Lead Admin'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Header: Exit back to dashboard button */}
          <button
            onClick={() => {
              sound.playPop();
              setCurrentTab('dashboard');
            }}
            className="px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Dashboard</span>
          </button>
        </header>

        {/* Chat Messages Body with Warm Executive Theme */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 space-y-3 bg-[#fbf9f6] w-full min-w-0 box-border">
          
          {/* Security Notice Pill */}
          <div className="flex justify-center mb-2 px-1">
            <div className="bg-orange-50 text-orange-950 border border-orange-200/80 rounded-xl px-3 py-1.5 text-[10px] md:text-[11px] text-center max-w-md shadow-xs leading-normal">
              🔒 {selectedRecipient ? `Private 1-on-1 chat with ${selectedRecipient.name}. Rule 10 & 18 apply.` : 'Messages are confidential to Weblets® & StackAdda™ founders.'}
            </div>
          </div>

          {/* Messages Feed */}
          {activeMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const stableKey = msg.localId || msg.id;

            return (
              <div
                key={stableKey}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[78%] md:max-w-[70%] rounded-2xl p-2.5 sm:p-3 shadow-xs text-xs leading-relaxed space-y-1.5 relative break-words ${
                    isMe
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 rounded-tl-none border border-slate-200'
                  }`}
                >
                  {/* Sender Name in Group Chat */}
                  {!isMe && !selectedRecipient && (
                    <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-orange-600 pb-0.5">
                      <span>{msg.senderName}</span>
                      <span className="text-[9px] font-mono text-slate-400 font-normal uppercase">
                        {msg.senderRole === 'superadmin' ? 'Lead Admin' : 'Founder'}
                      </span>
                    </div>
                  )}

                  {/* Render Cloudinary Image/Video Attachment */}
                  {msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/20 mb-1 max-w-sm">
                      {msg.mediaType === 'video' ? (
                        <video src={msg.mediaUrl} controls className="w-full max-h-60 rounded-xl" />
                      ) : (
                        <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={msg.mediaUrl} 
                            alt="Attachment" 
                            className="w-full max-h-72 object-cover rounded-xl hover:opacity-95 transition-opacity" 
                          />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Message Text */}
                  {msg.text && (
                    <p className="whitespace-pre-wrap break-words leading-relaxed select-text font-sans text-xs">
                      {msg.text}
                    </p>
                  )}

                  {/* Timestamp & Double Ticks */}
                  <div className={`flex items-center justify-end gap-1 text-[10px] pt-0.5 font-mono select-none ${
                    isMe ? 'text-orange-100' : 'text-slate-400'
                  }`}>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {isMe && (
                      <span title={msg.status === 'read' ? 'Read' : msg.status === 'sending' ? 'Sending...' : 'Delivered'}>
                        {msg.status === 'sending' ? (
                          <div className="w-2.5 h-2.5 border-2 border-white/60 border-t-white rounded-full animate-spin inline-block" />
                        ) : (
                          <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-sky-200' : 'text-white'}`} />
                        )}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Media Preview Drawer before Sending */}
        {selectedMedia && (
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2 truncate">
              <img src={selectedMedia.previewUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
              <div className="truncate text-xs">
                <p className="font-bold text-slate-800 truncate">{selectedMedia.name}</p>
                <p className="text-[10px] text-orange-600 font-mono">Attachment Ready</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMedia(null)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Executive Input Bar */}
        <footer className="p-2 sm:p-2.5 md:p-3 bg-slate-50 flex items-center gap-1.5 sm:gap-2 border-t border-slate-200 shrink-0 w-full min-w-0 max-w-full box-border">
          
          {/* Cloudinary File Attachment Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image / Media"
            className="p-2 sm:p-2.5 rounded-full bg-white hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <input 
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            className="hidden"
            onChange={handleMediaSelect}
          />

          {/* Floating Pill Input */}
          <div className="flex-1 min-w-0 bg-white rounded-3xl border border-slate-200 shadow-2xs flex items-center px-3 py-1 sm:px-3.5 sm:py-1.5 gap-2 min-h-[40px] sm:min-h-[44px] focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/20">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedRecipient ? `Message ${selectedRecipient.name.split(' ')[0]}...` : "Message founders circle..."}
              rows={1}
              className="flex-1 min-w-0 text-xs text-slate-800 placeholder:text-slate-400 resize-none max-h-24 focus:outline-none py-1 leading-relaxed bg-transparent"
              style={{ minHeight: '22px' }}
            />
          </div>

          {/* Rounded Orange Gradient Send Button */}
          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedMedia) || isUploading}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-600/30 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
            title="Send Message"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            )}
          </button>

        </footer>

      </div>
    </div>
  );
};

