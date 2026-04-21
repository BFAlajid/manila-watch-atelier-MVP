import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquare, X, Send, Loader2, RotateCcw, Minus } from 'lucide-react';
import { IconButton } from './ui/IconButton';

const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Welcome to **Manila Watch Atelier**! I'm your personal watch concierge.\n\nHow can I help you today?",
  timestamp: new Date(),
};

const QUICK_ACTIONS = [
  { label: 'Rolex Collection', msg: 'What Rolex watches do you have available?' },
  { label: 'Under 1M PHP', msg: 'Show me watches under 1 million PHP' },
  { label: 'Patek Philippe', msg: 'Tell me about your Patek Philippe pieces' },
  { label: 'Book Viewing', msg: "I'd like to book a viewing appointment" },
];

// ── Lightweight markdown renderer ──────────────────────────────────
function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  function flushList() {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      const cls = listType === 'ul' ? 'list-disc' : 'list-decimal';
      elements.push(<Tag key={`list-${key++}`} className={`${cls} list-inside space-y-0.5 my-1.5 text-neutral-300`}>{listItems}</Tag>);
      listItems = [];
      listType = null;
    }
  }

  function inlineFormat(str: string): ReactNode {
    // Bold, italic, links, code
    const parts: ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[([^\]]+)\]\(([^)]+)\))|(`([^`]+)`)/g;
    let lastIdx = 0;
    let match;
    let inlineKey = 0;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIdx) parts.push(str.slice(lastIdx, match.index));

      if (match[1]) {
        parts.push(<strong key={`b-${inlineKey++}`} className="font-semibold text-[#D4AF37]">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<em key={`i-${inlineKey++}`} className="italic text-neutral-300">{match[4]}</em>);
      } else if (match[5]) {
        const href = match[7];
        const isExt = href.startsWith('http');
        parts.push(
          <a key={`a-${inlineKey++}`} href={href} target={isExt ? '_blank' : undefined} rel={isExt ? 'noopener noreferrer' : undefined} className="text-[#D4AF37] underline underline-offset-2 hover:text-[#F4E5B8] transition-colors">{match[6]}</a>
        );
      } else if (match[8]) {
        parts.push(<code key={`c-${inlineKey++}`} className="bg-neutral-800 text-[#D4AF37] px-1 py-0.5 rounded text-xs">{match[9]}</code>);
      }
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < str.length) parts.push(str.slice(lastIdx));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flushList();
      elements.push(<p key={`h-${key++}`} className="text-white font-semibold text-sm mt-2 mb-1">{inlineFormat(headingMatch[2])}</p>);
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(<li key={`li-${key++}`}>{inlineFormat(ulMatch[1])}</li>);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(<li key={`li-${key++}`}>{inlineFormat(olMatch[1])}</li>);
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${key++}`} className="border-neutral-800 my-2" />);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(<blockquote key={`bq-${key++}`} className="border-l-2 border-[#D4AF37]/40 pl-3 my-1.5 text-neutral-400 italic text-[12px]">{inlineFormat(trimmed.slice(2))}</blockquote>);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(<p key={`p-${key++}`} className="mb-1.5 last:mb-0">{inlineFormat(trimmed)}</p>);
  }

  flushList();
  return elements;
}

// ── Component ──────────────────────────────────────────────────────
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setShowPulse(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    setHasInteracted(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ]);
    setInput('');
    setIsLoading(true);

    const apiMessages = [...messages.filter((m) => m.id !== 'welcome'), userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const appendChunk = (chunk: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
      );
    };

    const replaceContent = (content: string) => {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content } : m)));
    };

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${response.status})`);
      }

      // SSE parser — accumulate chunks, split on blank-line delimiter.
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Streaming not supported by this browser.');
      const decoder = new TextDecoder();
      let buffer = '';
      let sawText = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let delimIdx: number;
        while ((delimIdx = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, delimIdx);
          buffer = buffer.slice(delimIdx + 2);

          let eventName = 'message';
          let dataLine = '';
          for (const line of rawEvent.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLine += line.slice(5).trim();
          }
          if (!dataLine) continue;
          let payload: any = {};
          try { payload = JSON.parse(dataLine); } catch { continue; }

          if (eventName === 'text' && typeof payload.chunk === 'string') {
            sawText = true;
            appendChunk(payload.chunk);
          } else if (eventName === 'done' && payload.sessionId && !sessionId) {
            setSessionId(payload.sessionId);
          } else if (eventName === 'error' && payload.error) {
            throw new Error(payload.error);
          }
          // `tool` events are intentionally not surfaced to the user — they'd
          // be noisy on a short conversation. The typing indicator is enough.
        }
      }

      if (!sawText) {
        replaceContent("I couldn't process that. Could you try rephrasing?");
      }
    } catch (err: any) {
      const fallback = err.message?.includes('not configured')
        ? "Our chat is being set up. Reach Sherard directly via **WhatsApp** or **email**!"
        : 'Something went wrong. Try again, or reach Sherard via **WhatsApp**.';
      replaceContent(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setSessionId(null);
    setHasInteracted(false);
  };

  return (
    <>
      {/* ─── Floating Chat Button ─── */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '112px',
            right: '24px',
            zIndex: 99999,
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #B8960C)',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(212, 175, 55, 0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 32px rgba(212, 175, 55, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(212, 175, 55, 0.3)';
            }}
          >
            <MessageSquare size={24} />
            {showPulse && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                background: '#D4AF37',
                borderRadius: '50%',
                border: '2px solid #000',
              }} aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mwa-chat"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 99999,
              width: '400px',
              maxWidth: 'calc(100vw - 32px)',
              height: '560px',
              maxHeight: 'calc(100vh - 48px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              background: '#0A0A0A',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'linear-gradient(90deg, #111, #0A0A0A)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(212,175,55,0.15)',
                }}>
                  <span style={{ fontSize: '18px', color: '#D4AF37' }}>&#9670;</span>
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', letterSpacing: '0.3px' }}>MWA Concierge</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#34D399', borderRadius: '50%', display: 'inline-block' }} />
                    <span style={{ fontSize: '11px', color: 'rgba(52,211,153,0.8)' }}>Online now</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <IconButton
                  label="New conversation"
                  icon={<RotateCcw size={15} />}
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  title="New conversation"
                />
                <IconButton
                  label="Minimize chat"
                  icon={<Minus size={15} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                />
                <IconButton
                  label="Close chat"
                  icon={<X size={15} />}
                  variant="ghost"
                  size="sm"
                  tone="danger"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                />
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#333 transparent',
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      ...(msg.role === 'user'
                        ? {
                            background: '#D4AF37',
                            color: '#000',
                            borderRadius: '16px 16px 4px 16px',
                          }
                        : {
                            background: '#1A1A1A',
                            color: '#E5E5E5',
                            borderRadius: '16px 16px 16px 4px',
                            border: '1px solid rgba(255,255,255,0.04)',
                          }),
                    }}
                  >
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    background: '#1A1A1A',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '5px',
                  }}>
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} className="animate-bounce" style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: 'rgba(212,175,55,0.5)',
                        animationDelay: `${delay}ms`,
                        display: 'inline-block',
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Actions ── */}
            {!hasInteracted && (
              <div style={{ padding: '0 16px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => sendMessage(a.msg)}
                    style={{
                      fontSize: '11px',
                      padding: '6px 12px',
                      background: '#1A1A1A',
                      color: '#999',
                      borderRadius: '999px',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
                      e.currentTarget.style.color = '#D4AF37';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ── */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '12px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: '#0D0D0D',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about our watches..."
                  rows={1}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: '#1A1A1A',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                    resize: 'none',
                    outline: 'none',
                    minHeight: '42px',
                    maxHeight: '96px',
                    fontFamily: 'inherit',
                    scrollbarWidth: 'thin',
                    opacity: isLoading ? 0.4 : 1,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 96) + 'px';
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: (!input.trim() || isLoading) ? 'rgba(212,175,55,0.2)' : '#D4AF37',
                    color: '#000',
                    border: 'none',
                    cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
