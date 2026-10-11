'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'bot';
  content: string;
  ts: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  ts: number;
};

const SUGGESTIONS = [
  'Apa itu AI chatbot?',
  'Jelaskan cara kerja API secara singkat.',
  'Apa bedanya NestJS dan Express?',
  'Buatkan contoh kode Python untuk menghitung faktorial.',
];

// ---------- Ikon SVG ----------
function SparkleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.9 5.7L19.6 9.6l-5.7 1.9L12 17.2l-1.9-5.7L4.4 9.6l5.7-1.9L12 2zm7 12l.95 2.85L22.8 17.8l-2.85.95L19 21.6l-.95-2.85-2.85-.95 2.85-.95L19 14zM5 16l.7 2.1L7.8 18.8l-2.1.7L5 21.6l-.7-2.1-2.1-.7 2.1-.7L5 16z" />
    </svg>
  );
}

function SendIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.4 20.4l17.7-7.6c.9-.4.9-2 0-2.4L3.4 2.6c-.7-.3-1.5.3-1.5 1.2l.8 6.3c.1.7.7 1.2 1.4 1.3l8.5.9c.3 0 .3.5 0 .6l-8.5.9c-.7.1-1.3.6-1.4 1.3l-.8 6.3c0 .9.8 1.5 1.5 1.2z" />
    </svg>
  );
}

function CopyIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MoonIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function PlusIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PersonIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="7" r="4" />
      <path d="M12 14c-4.4 0-8 2.7-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.3-3.6-6-8-6z" />
    </svg>
  );
}

function MenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function MessageSquareIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function CloseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const now = () => Date.now();

const loadTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('chat-theme') as 'dark' | 'light') || 'dark';
};

const loadHistory = () => {
  if (typeof window === 'undefined') return { conversations: [], activeId: null };
  try {
    const raw = localStorage.getItem('chat-history');
    const conversations: Conversation[] = raw ? JSON.parse(raw) : [];
    return { conversations, activeId: conversations[0]?.id ?? null };
  } catch {
    return { conversations: [], activeId: null };
  }
};

function BotAvatar({ size = 'w-9 h-9' }: { size?: string }) {
  return (
    <div className={`${size} shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20`}>
      <SparkleIcon className="w-5 h-5" />
    </div>
  );
}

function UserAvatar({ size = 'w-9 h-9' }: { size?: string }) {
  return (
    <div className={`${size} shrink-0 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-slate-200 shadow-lg ring-1 ring-white/10`}>
      <PersonIcon className="w-5 h-5" />
    </div>
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadHistory().conversations);
  const [activeId, setActiveId] = useState<string | null>(() => loadHistory().activeId);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadTheme());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save history on change
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0) {
      localStorage.setItem('chat-history', JSON.stringify(conversations));
    } else if (typeof window !== 'undefined' && conversations.length === 0) {
      localStorage.removeItem('chat-history');
    }
  }, [conversations]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light');
    else root.classList.remove('light');
    localStorage.setItem('chat-theme', theme);
  }, [theme]);

  // Auto-scroll
  const activeConversation = conversations.find(c => c.id === activeId);
  const currentMessages = useMemo(
    () => activeConversation?.messages || [],
    [activeConversation]
  );
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const copyText = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const createNewChat = () => {
    if (isLoading) return;
    setActiveId(null);
    if (window.innerWidth < 1024) setSidebarOpen(false); // Close sidebar on mobile
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newConvs = conversations.filter(c => c.id !== id);
    setConversations(newConvs);
    if (activeId === id) {
      setActiveId(newConvs.length > 0 ? newConvs[0].id : null);
    }
  };

  const selectChat = (id: string) => {
    if (isLoading) return;
    setActiveId(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const send = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    let convId = activeId;

    const newUserMessage: Message = { role: 'user', content: trimmed, ts: now() };

    // Snapshot riwayat diambil dari state langsung (bukan dari dalam updater setState)
    const targetConv = conversations.find(c => c.id === convId);
    const currentHistory = targetConv?.messages ?? [];
    const historyToSend: { role: string; content: string }[] = [
      ...currentHistory.map(({ role, content }) => ({ role, content })),
      { role: 'user', content: trimmed },
    ];

    if (!convId) {
      // Create new conversation
      convId = now().toString();
      const title = trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed;
      const newConv: Conversation = {
        id: convId,
        title,
        messages: [...currentHistory, newUserMessage],
        ts: now(),
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveId(convId);
    } else {
      // Update existing
      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return { ...c, messages: [...c.messages, newUserMessage] };
        }
        return c;
      }));
    }

    setInput('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await axios.post('http://localhost:3001/api/chat', {
        messages: historyToSend,
      });

      const replyText =
        response.data?.success === true && typeof response.data.data === 'string'
          ? response.data.data
          : response.data?.message || 'Maaf, terjadi kesalahan pada server.';

      const botMessage: Message = { role: 'bot', content: replyText, ts: now() };

      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return { ...c, messages: [...c.messages, botMessage] };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error fetching chat:', error);
      const e = error as { response?: { data?: { message?: string } } };
      const errorMessage: Message = {
        role: 'bot',
        content: e.response?.data?.message || 'Maaf, terjadi kesalahan pada server.',
        ts: now(),
      };
      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return { ...c, messages: [...c.messages, errorMessage] };
        }
        return c;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--surface)] text-[var(--foreground)] overflow-hidden">
      {/* Background blur */}
      <div aria-hidden className="blur-bg fixed inset-0 z-0 pointer-events-none">
        <span className="blob-1" />
        <span className="blob-2" />
        <span className="blob-3" />
      </div>

      {/* Sidebar (Mobile Overlay) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--surface-2)]/90 backdrop-blur-xl border-r border-[var(--border)] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-transparent px-3 py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-3)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--foreground)] text-[var(--surface)]">
              <PlusIcon className="h-4 w-4" />
            </div>
            Percakapan Baru
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 pt-0">
          <div className="text-xs font-semibold text-[var(--muted)] mb-3 px-2">Riwayat Percakapan</div>
          
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-[var(--muted)]">
                Belum ada percakapan
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectChat(conv.id)}
                  className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activeId === conv.id ? 'bg-[var(--surface-3)] font-medium text-[var(--foreground)]' : 'text-[var(--muted)] hover:bg-[var(--surface-3)]/50'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <MessageSquareIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteChat(e, conv.id)}
                    className="hidden text-[var(--muted)] transition-colors hover:text-red-500 group-hover:block"
                    title="Hapus percakapan"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Mobile Sidebar Close */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute -right-12 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] lg:hidden"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="relative flex flex-1 flex-col z-10 w-full min-w-0">
        
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)]/60 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--foreground)] lg:hidden"
            >
              <MenuIcon />
            </button>
            <BotAvatar size="w-8 h-8" />
            <h1 className="text-[15px] font-bold tracking-tight">AI Chatbot</h1>
          </div>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {/* Messages */}
        <div className="chat-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-10 lg:px-20">
          {currentMessages.length === 0 ? (
            <div className="fade-in flex h-full flex-col items-center justify-center gap-6 pb-10 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-indigo-500/40 to-cyan-400/30 blur-2xl" />
                <BotAvatar size="w-16 h-16" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Halo, ada yang bisa saya bantu?
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Tanyakan apa saja, atau pilih saran pertanyaan di bawah ini.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={isLoading}
                    className="fade-in rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] active:translate-y-0 disabled:opacity-50"
                    style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {currentMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`msg-in flex items-start gap-4 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'bot' && <BotAvatar size="w-8 h-8" />}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    {msg.role === 'bot' ? (
                      <div className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 shadow-sm">
                        <div className="markdown text-[var(--foreground)] text-sm leading-relaxed">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--user-from)] to-[var(--user-to)] px-4 py-3 text-white shadow-md">
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                    )}

                    <div
                      className={`mt-1 flex items-center gap-2 text-[11px] text-[var(--muted)] ${
                        msg.role === 'user' ? 'justify-end pr-1' : 'justify-between pl-1'
                      }`}
                    >
                      <span>{formatTime(msg.ts)}</span>
                      {msg.role === 'bot' && (
                        <button
                          onClick={() => copyText(index, msg.content)}
                          title="Salin jawaban"
                          className="flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:text-[var(--foreground)]"
                        >
                          {copiedId === index ? (
                            <><CheckIcon className="h-3 w-3" /> Tersalin</>
                          ) : (
                            <><CopyIcon className="h-3 w-3" /> Salin</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && <UserAvatar size="w-8 h-8" />}
                </div>
              ))}
              
              {isLoading && (
                <div className="msg-in flex items-start gap-4">
                  <BotAvatar size="w-8 h-8" />
                  <div className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="px-4 pb-4 sm:px-10 lg:px-20 mx-auto w-full max-w-4xl shrink-0">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/80 p-2 shadow-sm backdrop-blur-xl transition-colors focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kirim pesan ke AI Chatbot..."
              className="max-h-40 w-full resize-none bg-transparent px-3 py-2 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--user-from)] to-[var(--user-to)] text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none mb-0.5 mr-0.5"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-[var(--muted)]">
            AI dapat membuat kesalahan. Pertimbangkan untuk memverifikasi informasi penting.
          </p>
        </div>

      </div>
    </div>
  );
}