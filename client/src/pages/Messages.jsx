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

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
  bg: '#ffffff',
  text: '#0A0A0A',
  muted: '#6B7280',
  border: '#E5E7EB',
  accent: '#F59E0B',
  lightBg: '#FAFAFA',
  bubbleOther: '#F3F3F3',
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
};

/* ─── Injected styles (animations + scrollbar + mobile) ──────────────────── */
const MSG_STYLE = `
  @keyframes msg-fadein { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  .msg-fadein { animation: msg-fadein .25s ease both; }
  @keyframes msg-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .msg-shimmer { background:#F3F4F6; animation: msg-pulse 1.6s ease-in-out infinite; border-radius:8px; }
  @keyframes msg-dot-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
  .msg-dot-pulse { animation: msg-dot-pulse 1.4s ease-in-out infinite; }
  .msg-scroll::-webkit-scrollbar { width:4px; }
  .msg-scroll::-webkit-scrollbar-thumb { background:#E5E7EB; border-radius:4px; }
  .msg-scroll::-webkit-scrollbar-track { background:transparent; }
  .msg-input-focus:focus { border-color: #F59E0B !important; box-shadow: 0 0 0 3px rgba(245,158,11,.12) !important; }
  @media (max-width:768px) {
    .msg-sidebar-hide { display:none !important; }
    .msg-sidebar-show { display:flex !important; }
    .msg-chat-hide { display:none !important; }
    .msg-chat-show { display:flex !important; }
  }
`;

/* ─── Initials helper ────────────────────────────────────────────────────── */
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

/* ─── Inline avatar (matches spec: 40px, grey bg, black initials) ────────── */
function MsgAvatar({ name, src, size = 40 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', background: '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontWeight: 700, fontSize: size * 0.35, color: T.text, fontFamily: T.font,
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Date separator ─────────────────────────────────────────────────────── */
function DateSeparator({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: T.muted, whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
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

  // Helper to format date labels for separators
  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(c => {
    const name = `${c.otherUser?.firstName || ''} ${c.otherUser?.lastName || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  /* ──────────────────────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: T.font, background: T.bg, height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <style>{MSG_STYLE}</style>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', maxWidth: 1200, width: '100%', margin: '0 auto' }}>

        {/* ══════════════════════════════════════════════════════════════════
           LEFT COLUMN — Conversation list
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className={activeConversation ? 'msg-sidebar-hide' : 'msg-sidebar-show'}
          style={{
            width: 320, minWidth: 320, borderRight: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', background: T.bg,
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: T.text, margin: 0 }}>
                Messages
              </h1>
              {conversations.length > 0 && (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, color: T.muted,
                  background: T.lightBg, border: `1px solid ${T.border}`,
                  padding: '3px 10px', borderRadius: 9999,
                }}>
                  {conversations.length}
                </span>
              )}
            </div>

            {/* Search input */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
              <input
                type="text"
                placeholder="Search conversations…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="msg-input-focus"
                style={{
                  width: '100%', padding: '9px 14px 9px 36px', fontSize: '0.8125rem',
                  border: `1px solid ${T.border}`, borderRadius: 10, outline: 'none',
                  color: T.text, background: T.bg, fontFamily: T.font,
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="msg-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConversations ? (
              <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'msg-pulse 0.8s linear infinite' }} />
                <p style={{ fontSize: '0.75rem', color: T.muted }}>Loading chats…</p>
              </div>
            ) : error ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <AlertCircle size={24} style={{ color: '#EF4444', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.8125rem', color: T.muted }}>{error}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: T.lightBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MessageSquare size={22} style={{ color: T.muted }} />
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: T.text }}>No messages yet</p>
                <p style={{ fontSize: '0.75rem', color: T.muted, maxWidth: 200 }}>
                  Find a service and message the provider to get started!
                </p>
                <Link
                  to="/services"
                  style={{
                    marginTop: 8, display: 'inline-block', padding: '8px 18px', borderRadius: 8,
                    background: T.text, color: '#fff', fontSize: '0.8125rem', fontWeight: 700,
                    textDecoration: 'none', fontFamily: T.font,
                  }}
                >
                  Browse Services
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const name = `${conv.otherUser?.firstName || ''} ${conv.otherUser?.lastName || ''}`;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    style={{
                      width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
                      textAlign: 'left', cursor: 'pointer', border: 'none', fontFamily: T.font,
                      borderBottom: `1px solid ${T.border}`,
                      background: isSelected ? T.lightBg : T.bg,
                      borderLeft: isSelected ? `3px solid ${T.accent}` : '3px solid transparent',
                      transition: 'background .15s, border-color .15s',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = T.lightBg; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = T.bg; }}
                  >
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <MsgAvatar
                        name={name}
                        src={conv.otherUser?.avatarUrl}
                        size={40}
                      />
                      {hasUnread && (
                        <div
                          className="msg-dot-pulse"
                          style={{
                            position: 'absolute', top: -2, right: -2,
                            width: 10, height: 10, borderRadius: '50%',
                            background: T.accent, border: `2px solid ${T.bg}`,
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <h2 style={{
                          fontSize: '0.875rem', fontWeight: hasUnread ? 800 : 600, color: T.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
                        }}>
                          {name}
                        </h2>
                        <span style={{ fontSize: '0.6875rem', color: T.muted, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
                          {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.8125rem', color: hasUnread ? T.text : T.muted,
                        fontWeight: hasUnread ? 600 : 400, margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {conv.lastMessage?.senderId === user.id ? 'You: ' : ''}
                        {conv.lastMessage?.content || 'Started a conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
           RIGHT COLUMN — Chat thread
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className={activeConversation ? 'msg-chat-show' : 'msg-chat-hide'}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', background: T.bg,
          }}
        >
          {activeConversation ? (
            <>
              {/* ── Chat header ── */}
              <div style={{
                height: 64, minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', borderBottom: `1px solid ${T.border}`, background: T.bg,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  {/* Back button (mobile) */}
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="msg-sidebar-show"
                    style={{
                      display: 'none', width: 36, height: 36, borderRadius: 8,
                      border: `1px solid ${T.border}`, background: T.bg, cursor: 'pointer',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label="Back to chats"
                  >
                    <ArrowLeft size={18} style={{ color: T.text }} />
                  </button>

                  <MsgAvatar
                    name={`${activeConversation.otherUser?.firstName || ''} ${activeConversation.otherUser?.lastName || ''}`}
                    src={activeConversation.otherUser?.avatarUrl}
                    size={36}
                  />
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: T.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeConversation.otherUser?.firstName} {activeConversation.otherUser?.lastName}
                    </h2>
                  </div>
                </div>

                <Link
                  to={`/profile/${activeConversation.otherUser?.id}`}
                  style={{
                    fontSize: '0.8125rem', fontWeight: 700, color: T.accent,
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  View Profile
                </Link>
              </div>

              {/* ── Message thread ── */}
              <div className="msg-scroll" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {loadingMessages ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, border: `2.5px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'msg-pulse 0.8s linear infinite' }} />
                    <p style={{ fontSize: '0.75rem', color: T.muted }}>Loading thread…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, background: 'rgba(245,158,11,.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={26} style={{ color: T.accent }} />
                    </div>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: T.text }}>
                      Start of your conversation
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: T.muted, maxWidth: 260, textAlign: 'center' }}>
                      Say hello to start discussing listings, pricing, and timing!
                    </p>
                  </div>
                ) : (
                  (() => {
                    let lastDateStr = '';
                    return messages.map((msg, idx) => {
                      const isMe = msg.senderId === user.id;
                      const msgDate = new Date(msg.createdAt);
                      const dateStr = msgDate.toDateString();
                      let showSeparator = false;
                      if (dateStr !== lastDateStr) {
                        showSeparator = true;
                        lastDateStr = dateStr;
                      }

                      return (
                        <div key={msg.id || idx} className="msg-fadein">
                          {/* Date separator */}
                          {showSeparator && (
                            <DateSeparator label={formatDateLabel(msg.createdAt)} />
                          )}

                          {/* Message bubble */}
                          <div style={{
                            display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12,
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                          }}>
                            {/* Other user avatar */}
                            {!isMe && (
                              <MsgAvatar
                                name={`${activeConversation.otherUser?.firstName || ''} ${activeConversation.otherUser?.lastName || ''}`}
                                src={activeConversation.otherUser?.avatarUrl}
                                size={28}
                              />
                            )}

                            <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column' }}>
                              <div style={{
                                padding: '10px 16px', fontSize: '0.875rem', lineHeight: 1.5,
                                wordBreak: 'break-word',
                                background: isMe ? T.text : T.bubbleOther,
                                color: isMe ? '#ffffff' : T.text,
                                borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                              }}>
                                {msg.content}
                              </div>

                              {/* Timestamp + read receipt */}
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
                                justifyContent: isMe ? 'flex-end' : 'flex-start', paddingLeft: 4, paddingRight: 4,
                              }}>
                                <span style={{ fontSize: '0.625rem', color: T.muted }}>
                                  {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  <CheckCheck size={13} style={{ color: msg.isRead ? T.accent : '#D1D5DB' }} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Message input area ── */}
              <form
                onSubmit={handleSend}
                style={{
                  height: 72, minHeight: 72, display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0 24px', borderTop: `1px solid ${T.border}`, background: T.bg,
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                  className="msg-input-focus"
                  style={{
                    flex: 1, height: 44, padding: '10px 16px', fontSize: '0.875rem',
                    border: `1px solid ${T.border}`, borderRadius: 8, outline: 'none',
                    color: T.text, background: T.bg, fontFamily: T.font,
                    transition: 'border-color .2s, box-shadow .2s',
                    opacity: sending ? 0.6 : 1,
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: 8, border: 'none', flexShrink: 0,
                    background: sending || !messageText.trim() ? '#D1D5DB' : T.text,
                    cursor: sending || !messageText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!sending && messageText.trim()) e.currentTarget.style.background = T.accent;
                  }}
                  onMouseLeave={(e) => {
                    if (!sending && messageText.trim()) e.currentTarget.style.background = T.text;
                  }}
                >
                  {sending ? (
                    <div style={{
                      width: 18, height: 18, border: '2.5px solid #fff', borderTopColor: 'transparent',
                      borderRadius: '50%', animation: 'msg-pulse 0.8s linear infinite',
                    }} />
                  ) : (
                    <Send size={18} style={{ color: '#ffffff' }} />
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Empty state (no conversation selected) ── */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 32, textAlign: 'center', background: T.bg,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, background: 'rgba(245,158,11,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              }}>
                <MessageSquare size={36} style={{ color: T.accent }} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: T.text, marginBottom: 8 }}>
                Select a conversation
              </h2>
              <p style={{ fontSize: '0.9375rem', color: T.muted, maxWidth: 280 }}>
                Choose a conversation from the left to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
