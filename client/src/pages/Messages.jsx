import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Search,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Messages() {
  const { user, fetchUnreadCount } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const providerIdParam = searchParams.get('providerId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async (selectIdAfterFetch = null) => {
    try {
      setLoadingConversations(true);
      const { data } = await api.get('/conversations');
      const list = data.data || [];
      setConversations(list);

      if (selectIdAfterFetch) {
        const found = list.find(c => c.id === selectIdAfterFetch);
        if (found) {
          setActiveConversation(found);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Handle pre-loading conversation from providerId query param
  useEffect(() => {
    const handlePreload = async () => {
      if (providerIdParam && user) {
        try {
          setLoadingConversations(true);
          const { data } = await api.post('/conversations', { providerId: providerIdParam });
          const targetConv = data.data;

          // Fetch fresh list
          const listRes = await api.get('/conversations');
          const list = listRes.data.data || [];
          setConversations(list);

          // Select the created/retrieved conversation
          const found = list.find(c => c.id === targetConv.id) || targetConv;
          setActiveConversation(found);

          // Clear query params to keep URL clean
          setSearchParams({});
        } catch (err) {
          console.error('Error initiating conversation:', err);
          setError('Failed to start chat with this provider.');
        } finally {
          setLoadingConversations(false);
        }
      } else {
        fetchConversations();
      }
    };

    handlePreload();
  }, [providerIdParam, user, fetchConversations, setSearchParams]);

  // Fetch messages for the active conversation
  const fetchMessages = useCallback(async (convId) => {
    try {
      setLoadingMessages(true);
      const { data } = await api.get(`/conversations/${convId}/messages`);
      setMessages(data.data.messages || []);
      
      // Zero out unread count locally
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c)
      );

      // Refresh global unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation, fetchMessages]);

  // Socket.io listeners
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewMessage = (msg) => {
      // If message is for the active conversation, append it
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Mark as read on backend (since we are currently actively viewing it)
        api.get(`/conversations/${activeConversation.id}/messages`).catch(console.error);
      } else {
        // Increment unread count in the conversation list, update last message, and resort
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === msg.conversationId) {
              return {
                ...c,
                unreadCount: c.unreadCount + 1,
                lastMessage: msg,
                updatedAt: new Date().toISOString()
              };
            }
            return c;
          });
          
          // If the conversation is not in the list (e.g. first message from someone), re-fetch list
          if (!updated.some(c => c.id === msg.conversationId)) {
            fetchConversations();
            return prev;
          }

          return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
      }
    };

    const handleMessagesRead = ({ conversationId }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setMessages(prev =>
          prev.map(m => m.senderId === user.id ? { ...m, isRead: true } : m)
        );
      }
    };

    socket.on('message', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('message', handleNewMessage);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [user, activeConversation, fetchConversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  // Send message handler
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeConversation || sending) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const { data } = await api.post(`/conversations/${activeConversation.id}/messages`, {
        content: text
      });

      // Append locally right away
      setMessages(prev => {
        if (prev.some(m => m.id === data.data.id)) return prev;
        return [...prev, data.data];
      });

      // Update conversations list with last message and timestamp
      setConversations(prev => {
        return prev.map(c => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              lastMessage: data.data,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Helper to format timestamps
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(c => {
    const name = `${c.otherUser?.firstName || ''} ${c.otherUser?.lastName || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex flex-col"
      style={{ color: 'var(--text-body)' }}
    >
      <div className="flex-1 flex overflow-hidden rounded-2xl border shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        
        {/* ==================== LEFT PANEL: Conversations list ==================== */}
        <div 
          className={[
            "w-full md:w-80 lg:w-96 border-r flex flex-col h-full bg-[var(--bg-surface)]",
            activeConversation ? "hidden md:flex" : "flex",
            "border-r transition-all duration-200"
          ].join(' ')}
          style={{ borderColor: 'var(--border-default)' }}
        >
          {/* Header & Search */}
          <div className="p-4 border-b flex flex-col gap-3" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between">
              <h1 className="heading-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-500" />
                Messages
              </h1>
              {conversations.length > 0 && (
                <span className="bg-primary-50 dark:bg-primary-950/40 text-primary-500 text-xs font-bold px-2.5 py-1 rounded-full">
                  {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
                </span>
              )}
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                style={{
                  backgroundColor: 'var(--bg-base)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-body)'
                }}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-default)] scrollbar-hide">
            {loadingConversations ? (
              <div className="p-8 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading chats...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3 mt-10">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-muted)] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>No messages yet</p>
                <p className="text-xs max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                  Find a service and message the provider to get started!
                </p>
                <Link to="/services">
                  <Button variant="outline" size="sm" className="mt-2">Browse Services</Button>
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const name = `${conv.otherUser?.firstName || ''} ${conv.otherUser?.lastName || ''}`;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={[
                      "w-full p-4 flex items-start gap-3 text-left transition-all duration-200 cursor-pointer",
                      isSelected 
                        ? "bg-primary-50/50 dark:bg-primary-950/20" 
                        : "hover:bg-[var(--bg-muted)]/50"
                    ].join(' ')}
                  >
                    <div className="relative">
                      <Avatar name={name} src={conv.otherUser?.avatarUrl} size="md" />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white ring-2 ring-[var(--bg-surface)] animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>
                          {name}
                        </h2>
                        <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                          {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                      </div>
                      
                      <p 
                        className={[
                          "text-xs truncate",
                          conv.unreadCount > 0 
                            ? "font-semibold text-primary-500" 
                            : "text-[var(--text-muted)]"
                        ].join(' ')}
                      >
                        {conv.lastMessage?.senderId === user.id ? 'You: ' : ''}
                        {conv.lastMessage?.content || 'Started a conversation'}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 self-center flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ==================== RIGHT PANEL: Active chat thread ==================== */}
        <div 
          className={[
            "flex-1 flex flex-col h-full bg-[var(--bg-base)]",
            activeConversation ? "flex" : "hidden md:flex"
          ].join(' ')}
        >
          {activeConversation ? (
            <>
              {/* Header */}
              <div 
                className="p-4 bg-[var(--bg-surface)] border-b flex items-center justify-between shadow-sm"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <button 
                    onClick={() => setActiveConversation(null)}
                    className="p-2 rounded-lg md:hidden transition-colors hover:bg-[var(--bg-muted)] cursor-pointer"
                    aria-label="Back to chats"
                  >
                    <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-heading)' }} />
                  </button>

                  <Avatar 
                    name={`${activeConversation.otherUser?.firstName || ''} ${activeConversation.otherUser?.lastName || ''}`} 
                    src={activeConversation.otherUser?.avatarUrl} 
                    size="md" 
                  />
                  
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold truncate" style={{ color: 'var(--text-heading)' }}>
                      {activeConversation.otherUser?.firstName} {activeConversation.otherUser?.lastName}
                    </h2>
                    <p className="text-[10px] truncate flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <ShieldCheck className="w-3 h-3 text-primary-500" />
                      Verified Provider
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {loadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading thread...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] gap-3">
                    <Sparkles className="w-8 h-8 text-primary-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>
                        This is the start of your conversation
                      </p>
                      <p className="text-xs max-w-xs">
                        Say hello to start discussing listings, pricing, and timing!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.id;
                    
                    return (
                      <div
                        key={msg.id || idx}
                        className={[
                          "flex items-end gap-2.5",
                          isMe ? "justify-end" : "justify-start"
                        ].join(' ')}
                      >
                        {/* Recipient avatar (only show on left-side messages) */}
                        {!isMe && (
                          <Avatar
                            name={`${activeConversation.otherUser?.firstName || ''} ${activeConversation.otherUser?.lastName || ''}`}
                            src={activeConversation.otherUser?.avatarUrl}
                            size="sm"
                            className="mb-1"
                          />
                        )}

                        <div className="max-w-[70%] flex flex-col">
                          <div
                            className={[
                              "px-4 py-2.5 text-sm shadow-sm break-words",
                              isMe
                                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-none shadow-md shadow-primary-500/10"
                                : "bg-[var(--bg-surface)] text-[var(--text-body)] border border-[var(--border-default)] rounded-2xl rounded-bl-none"
                            ].join(' ')}
                          >
                            {msg.content}
                          </div>
                          
                          <div className="flex items-center gap-1 mt-1 px-1 justify-end">
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-primary-500' : 'text-[var(--text-faint)]'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Section */}
              <form 
                onSubmit={handleSend}
                className="p-4 bg-[var(--bg-surface)] border-t flex gap-2 items-center"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                  className="flex-1 px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-base)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-body)'
                  }}
                />
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="h-[42px] px-5 rounded-xl flex items-center justify-center flex-shrink-0 gap-1.5 shadow-md shadow-primary-500/20"
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Send</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-base)]">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/15 mb-6 animate-glow">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h2 className="heading-2xl mb-2">Your Conversations</h2>
              <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
                Select a contact from the list on the left to review your chat history or send a new message.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
