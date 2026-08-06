import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MoreVertical, 
  Pin, 
  CheckCheck, 
  Check, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  BarChart2, 
  MapPin, 
  Music, 
  X, 
  CornerUpLeft, 
  Plus, 
  Bot,
  User,
  Users,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TelegramChatConversation, TelegramChatMessage, InlineKeyboardButton } from '../types';

interface MessagesViewProps {
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  botUsername?: string;
  onOpenUserDetail?: (userId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  showToast,
  botUsername,
  onOpenUserDetail
}) => {
  const [conversations, setConversations] = useState<TelegramChatConversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<TelegramChatMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'private' | 'group'>('all');

  // Composer State
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TelegramChatMessage | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  
  // Media / Special Attachment Modals
  const [activeModal, setActiveModal] = useState<'photo' | 'doc' | 'video' | 'poll' | 'location' | 'buttons' | 'simulate' | null>(null);
  
  // Custom Media Inputs
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaCaptionInput, setMediaCaptionInput] = useState('');
  
  // Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Option 1', 'Option 2']);
  
  // Location State
  const [locLat, setLocLat] = useState('28.6139');
  const [locLng, setLocLng] = useState('77.2090');

  // Inline Keyboards State
  const [inlineButtons, setInlineButtons] = useState<InlineKeyboardButton[][]>([
    [{ text: '🌐 Visit Website', url: 'https://telegram.org' }],
    [{ text: '⚡ Help / Commands', callbackData: 'help_command' }]
  ]);

  // Simulation test modal input
  const [simName, setSimName] = useState('');
  const [simUsername, setSimUsername] = useState('');
  const [simText, setSimText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      setIsLoadingChats(true);
      const res = await fetch('/api/admin/chats');
      if (res.ok) {
        const data = await res.json();
        const chatsList: TelegramChatConversation[] = data.chats || [];
        setConversations(chatsList);

        if (chatsList.length > 0 && activeChatId === null) {
          setActiveChatId(chatsList[0].chatId);
        }
      }
    } catch {
      // transient catch
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchMessagesForChat = async (chatId: number) => {
    try {
      setIsLoadingMessages(true);
      const res = await fetch(`/api/admin/chats/${chatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // transient catch
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChatId !== null) {
      fetchMessagesForChat(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeChat = conversations.find(c => c.chatId === activeChatId);

  const handleSendMessage = async (customPayload?: any) => {
    if (!activeChatId) return;

    const payload = customPayload || {
      text: messageText,
      buttons: inlineButtons.length > 0 ? inlineButtons : undefined
    };

    if (!payload.text && !payload.mediaUrl && !payload.pollDetails && !payload.locationDetails) return;

    try {
      setIsSending(true);
      const res = await fetch(`/api/admin/chats/${activeChatId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
        setMessageText('');
        setReplyingTo(null);
        setActiveModal(null);
        setShowAttachmentMenu(false);
        fetchConversations(); // refresh list last message
      } else {
        showToast('Send Failed', 'Could not dispatch message to Telegram API', 'error');
      }
    } catch (err: any) {
      showToast('Send Error', err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPhotoOrDoc = (type: 'photo' | 'document' | 'video') => {
    if (!mediaUrlInput) {
      showToast('Media URL Required', 'Please provide a valid image, video, or document URL', 'warning');
      return;
    }
    handleSendMessage({
      mediaType: type,
      mediaUrl: mediaUrlInput,
      mediaCaption: mediaCaptionInput || messageText,
      buttons: inlineButtons.length > 0 ? inlineButtons : undefined
    });
    setMediaUrlInput('');
    setMediaCaptionInput('');
  };

  const handleSendPoll = () => {
    if (!pollQuestion.trim()) {
      showToast('Poll Question Required', 'Please enter a valid poll question', 'warning');
      return;
    }
    handleSendMessage({
      mediaType: 'poll',
      pollDetails: {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim().length > 0)
      }
    });
    setPollQuestion('');
  };

  const handleSendLocation = () => {
    handleSendMessage({
      mediaType: 'location',
      locationDetails: {
        latitude: parseFloat(locLat) || 28.6139,
        longitude: parseFloat(locLng) || 77.2090
      }
    });
  };

  const handleSimulateInbound = async () => {
    try {
      const res = await fetch('/api/admin/simulate/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: simName || 'Rahul Sharma',
          username: simUsername || 'rahul_tg',
          text: simText || 'Hello Bot! I am interested in testing Telegram services.'
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('Test User Message Received', 'New message added to conversation list', 'success');
        fetchConversations();
        if (data.chatId) setActiveChatId(data.chatId);
        setActiveModal(null);
        setSimName('');
        setSimUsername('');
        setSimText('');
      }
    } catch (err: any) {
      showToast('Simulation Error', err.message, 'error');
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterType === 'private') return matchesSearch && c.type === 'private';
    if (filterType === 'group') return matchesSearch && (c.type === 'group' || c.type === 'supergroup');
    return matchesSearch;
  });

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans">
      {/* LEFT: Telegram Conversations List */}
      <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 select-none">
        {/* Search Header */}
        <div className="p-3 border-b border-slate-100 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <span>Telegram Chats</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#24A1DE]/10 text-[#24A1DE]">
                {conversations.length}
              </span>
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={fetchConversations}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#24A1DE] hover:bg-slate-100 transition-colors"
                title="Refresh Chats"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveModal('simulate')}
                className="p-1.5 rounded-lg bg-[#24A1DE] text-white hover:bg-[#1f8ec4] transition-colors flex items-center space-x-1 text-xs font-semibold px-2"
                title="Simulate Inbound Message from User"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Test Message</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-transparent rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#24A1DE] transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 pt-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-[#24A1DE] text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilterType('private')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'private'
                  ? 'bg-[#24A1DE] text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setFilterType('group')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'group'
                  ? 'bg-[#24A1DE] text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {isLoadingChats ? (
            <div className="p-8 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#24A1DE] animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading Telegram chats...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No Conversations Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                No users have started your Telegram bot yet. When users message your bot in Telegram or you click "Test Message", chats will appear here.
              </p>
              <button
                onClick={() => setActiveModal('simulate')}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#24A1DE] text-white text-xs font-medium shadow-xs hover:bg-[#1f8ec4]"
              >
                Simulate Test Inbound User
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.chatId === activeChatId;
              const isGroup = conv.type === 'group' || conv.type === 'supergroup';

              return (
                <button
                  key={conv.chatId}
                  onClick={() => setActiveChatId(conv.chatId)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 text-left transition-colors relative ${
                    isActive ? 'bg-[#24A1DE]/10 border-l-4 border-[#24A1DE]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.avatarUrl || (isGroup 
                        ? `https://api.dicebear.com/7.x/identicon/svg?seed=${conv.chatId}`
                        : `https://api.dicebear.com/7.x/bottts/svg?seed=${conv.chatId}`)}
                      alt={conv.title}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    {isGroup ? (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white p-0.5 rounded-full ring-2 ring-white">
                        <Users className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {conv.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate max-w-[190px]">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-[#24A1DE] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MIDDLE & RIGHT: Telegram Conversation Window */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-[#e6ebeef2] relative overflow-hidden">
          {/* Top Chat Header */}
          <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={activeChat.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChat.chatId}`}
                alt={activeChat.title}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate flex items-center space-x-1.5">
                  <span>{activeChat.title}</span>
                  {activeChat.username && (
                    <span className="text-xs text-[#24A1DE] font-normal">@{activeChat.username}</span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeChat.type === 'private' ? 'bot user • ID: ' + activeChat.chatId : 'group chat • ID: ' + activeChat.chatId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onOpenUserDetail && activeChat.type === 'private' && (
                <button
                  onClick={() => onOpenUserDetail(`usr-${activeChat.chatId}`)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#24A1DE] bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20 rounded-xl transition-colors"
                >
                  View User Profile
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center text-slate-400 space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#24A1DE]" />
                <span className="text-xs font-medium">Fetching history...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-[#24A1DE]">
                  <Send className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">No Messages in this Chat</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Send a message below using Telegram Bot API to start communicating with this Telegram user!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isBot = msg.sender === 'bot';

                return (
                  <div
                    key={`${msg.id || 'msg'}-${idx}`}
                    className={`flex ${isBot ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div
                      className={`max-w-lg rounded-2xl p-3 shadow-xs text-sm relative ${
                        isBot
                          ? 'bg-[#eeffde] text-slate-900 border border-emerald-200/60 rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-none'
                      }`}
                    >
                      {/* Sender Name */}
                      <div className="flex items-center justify-between mb-1 space-x-3">
                        <span className={`text-xs font-bold ${isBot ? 'text-emerald-700' : 'text-[#24A1DE]'}`}>
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Photo / Media Rendering */}
                      {msg.mediaType === 'photo' && msg.mediaUrl && (
                        <div className="my-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                          <img src={msg.mediaUrl} alt="Attachment" className="max-h-60 w-full object-cover" />
                        </div>
                      )}

                      {/* Video Media Rendering */}
                      {msg.mediaType === 'video' && msg.mediaUrl && (
                        <div className="my-2 rounded-xl overflow-hidden border border-slate-200 bg-black">
                          <video src={msg.mediaUrl} controls className="max-h-60 w-full" />
                        </div>
                      )}

                      {/* Poll Rendering */}
                      {msg.pollDetails && (
                        <div className="my-2 p-3 bg-white/80 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                            <BarChart2 className="w-4 h-4 text-[#24A1DE]" />
                            <span>{msg.pollDetails.question}</span>
                          </div>
                          <div className="space-y-1 pt-1">
                            {msg.pollDetails.options.map((opt, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-slate-100 text-xs text-slate-700 font-medium">
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location Rendering */}
                      {msg.locationDetails && (
                        <div className="my-2 p-3 bg-white/80 rounded-xl border border-slate-200 flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div className="text-xs">
                            <p className="font-bold text-slate-800">Shared Location</p>
                            <p className="text-slate-500">Lat: {msg.locationDetails.latitude}, Lng: {msg.locationDetails.longitude}</p>
                          </div>
                        </div>
                      )}

                      {/* Message Text Body */}
                      <p className="whitespace-pre-wrap text-slate-800 text-xs leading-relaxed font-sans">
                        {msg.text}
                      </p>

                      {/* Inline Buttons Preview */}
                      {msg.buttons && msg.buttons.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1">
                          {msg.buttons.map((row, rIdx) => (
                            <div key={rIdx} className="flex space-x-1">
                              {row.map((btn, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="flex-1 py-1 px-2 text-center text-[11px] font-medium bg-[#24A1DE]/10 text-[#24A1DE] rounded-lg border border-[#24A1DE]/20"
                                >
                                  {btn.text}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Status */}
                      {isBot && (
                        <div className="flex justify-end mt-1 space-x-1">
                          {msg.status === 'sent' || msg.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Reply Banner */}
          {replyingTo && (
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs border-l-2 border-[#24A1DE] pl-2 min-w-0">
                <CornerUpLeft className="w-3.5 h-3.5 text-[#24A1DE]" />
                <div className="min-w-0">
                  <span className="font-bold text-[#24A1DE] block">Replying to {replyingTo.senderName}</span>
                  <span className="text-slate-500 truncate block">{replyingTo.text}</span>
                </div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Attachment Quick Bar Menu */}
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white border-t border-slate-200 p-3 grid grid-cols-5 gap-2 shadow-lg z-20"
              >
                <button
                  onClick={() => { setActiveModal('photo'); setShowAttachmentMenu(false); }}
                  className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex flex-col items-center space-y-1 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Photo</span>
                </button>

                <button
                  onClick={() => { setActiveModal('doc'); setShowAttachmentMenu(false); }}
                  className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex flex-col items-center space-y-1 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Document</span>
                </button>

                <button
                  onClick={() => { setActiveModal('poll'); setShowAttachmentMenu(false); }}
                  className="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 flex flex-col items-center space-y-1 transition-colors"
                >
                  <BarChart2 className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Poll</span>
                </button>

                <button
                  onClick={() => { setActiveModal('location'); setShowAttachmentMenu(false); }}
                  className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex flex-col items-center space-y-1 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Location</span>
                </button>

                <button
                  onClick={() => { setActiveModal('buttons'); setShowAttachmentMenu(false); }}
                  className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 flex flex-col items-center space-y-1 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Buttons</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Telegram Message Composer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 z-10">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className={`p-2 rounded-xl transition-colors ${
                showAttachmentMenu ? 'bg-[#24A1DE] text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Attach File / Media"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Write a message to Telegram user..."
                className="w-full bg-slate-100 border border-transparent rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#24A1DE] transition-all resize-none"
              />
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || (!messageText.trim() && inlineButtons.length === 0)}
              className="p-2.5 bg-[#24A1DE] hover:bg-[#1f8ec4] text-white rounded-xl shadow-xs disabled:opacity-40 transition-colors flex items-center justify-center"
              title="Send Message via Telegram Bot API"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#24A1DE]/10 text-[#24A1DE] flex items-center justify-center">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Select a Conversation</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Choose a Telegram user or group from the left sidebar to open the real-time chat interface.
          </p>
        </div>
      )}

      {/* Attachment Modals */}
      {activeModal === 'photo' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Send Photo Message</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Photo Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="Photo caption text..."
                  value={mediaCaptionInput}
                  onChange={(e) => setMediaCaptionInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={() => handleSendPhotoOrDoc('photo')} className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#24A1DE] text-white hover:bg-[#1f8ec4]">
                Send Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'poll' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                <span>Create Telegram Poll</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Poll Question</label>
                <input
                  type="text"
                  placeholder="What feature should we launch next?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Options</label>
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[idx] = e.target.value;
                      setPollOptions(updated);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE] mb-2"
                  />
                ))}
                <button
                  onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                  className="text-xs text-[#24A1DE] font-semibold hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleSendPoll} className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#24A1DE] text-white hover:bg-[#1f8ec4]">
                Send Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Modal */}
      {activeModal === 'simulate' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#24A1DE]" />
                <span>Simulate Inbound Telegram User</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Add a real test user to your database & chat window to test all features instantly.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                <input
                  type="text"
                  placeholder="rahul_tg"
                  value={simUsername}
                  onChange={(e) => setSimUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Message Text</label>
                <textarea
                  rows={3}
                  placeholder="Hi bot! Testing the Telegram admin dashboard."
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleSimulateInbound} className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#24A1DE] text-white hover:bg-[#1f8ec4]">
                Create & Receive Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
