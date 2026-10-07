'use client'; // Wajib ditambahkan karena kita menggunakan state (useState)

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// Mendefinisikan tipe data untuk pesan
type Message = {
  role: 'user' | 'bot';
  content: string;
  ts: number; // timestamp agar bisa menampilkan jam
};

const SUGGESTIONS = [
  'Apa itu AI chatbot?',
  'Jelaskan cara kerja API secara singkat.',
  'Apa bedanya NestJS dan Express?',
  'Buatkan contoh kode Python untuk menghitung faktorial.',
];

// ---------- Icon SVG kecil (murni tampilan) ----------
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

// ---------- Helper format jam ----------
const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// ---------- Komponen Avatar ----------
function BotAvatar({ size = 'w-9 h-9' }: { size?: string }) {
  return (
    <div
      className={`${size} shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20`}
    >
      <SparkleIcon className="w-5 h-5" />
    </div>
  );
}

function UserAvatar({ size = 'w-9 h-9' }: { size?: string }) {
  return (
    <div
      className={`${size} shrink-0 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-slate-200 shadow-lg ring-1 ring-white/10`}
    >
      <PersonIcon className="w-5 h-5" />
    </div>
  );
}

// ---------- Halaman Utama ----------
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('chat-theme') as 'dark' | 'light') || 'dark';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fungsi untuk scroll otomatis ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Terapkan tema (dark = default di root)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light');
    else root.classList.remove('light');
    localStorage.setItem('chat-theme', theme);
  }, [theme]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Salin teks jawaban bot
  const copyText = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard tidak tersedia, abaikan
    }
  };

  // Mulai percakapan baru
  const resetChat = () => {
    if (isLoading) return;
    setMessages([]);
    setCopiedId(null);
  };

  // Fungsi utama untuk mengirim pesan (logika asli dipertahankan)
  const send = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    // 1. Tambahkan pesan user ke layar
    setMessages((prev) => [...prev, { role: 'user', content: trimmed, ts: Date.now() }]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Perlu snapshot pesan terkini (tanpa pesan yang baru ditambahkan)
    const history = messages.map(({ role, content }) => ({ role, content }));

    try {
      // 2. Kirim pesan ke backend NestJS (Pastikan backend di port 3001 jalan)
      const response = await axios.post('http://localhost:3001/api/chat', {
        messages: [...history, { role: 'user', content: trimmed }],
      });

      // 3. Tambahkan balasan AI ke layar
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: response.data.data, ts: Date.now() },
      ]);
    } catch (error) {
      console.error('Error fetching chat:', error);
      const e = error as { response?: { data?: { message?: string } } };
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content:
            e.response?.data?.message ||
            'Maaf, terjadi kesalahan pada server.',
          ts: Date.now(),
        },
      ]);
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
    <div className="flex h-screen flex-col">
      {/* Background blur */}
      <div aria-hidden className="blur-bg">
        <span className="blob-1" />
        <span className="blob-2" />
        <span className="blob-3" />
      </div>

      {/* Panel chat */}
      <div className="glass relative mx-auto my-3 flex h-[calc(100%-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl sm:my-4 sm:h-[calc(100%-2rem)]">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-2)]/60 px-4 py-3 sm:px-5 backdrop-blur-xl">
          <BotAvatar />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold tracking-tight">
              AI Chatbot
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full" />
              Online · Siap membantu Anda
            </p>
          </div>
          <button
            onClick={resetChat}
            title="Percakapan Baru"
            aria-label="Mulai percakapan baru"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)] disabled:opacity-40"
            disabled={isLoading || messages.length === 0}
          >
            <PlusIcon />
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            aria-label="Ubah tema"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {/* Area Chat */}
        <div className="chat-scroll relative flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {messages.length === 0 ? (
            <div className="fade-in flex h-full flex-col items-center justify-center gap-6 pb-10">
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
              <div className="grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">
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
            <div className="space-y-5">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`msg-in flex items-end gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'bot' && <BotAvatar size="w-8 h-8" />}

                  <div
                    className={`max-w-[80%] sm:max-w-[72%] ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    {msg.role === 'bot' ? (
                      <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 shadow-sm">
                        <div className="markdown text-[var(--foreground)]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-[var(--user-from)] to-[var(--user-to)] px-4 py-3 text-white shadow-lg shadow-indigo-500/20">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}

                    <div
                      className={`mt-1.5 flex items-center gap-2 text-[11px] text-[var(--muted)] ${
                        msg.role === 'user'
                          ? 'justify-end pr-1'
                          : 'justify-between pl-1'
                      }`}
                    >
                      <span>{formatTime(msg.ts)}</span>
                      {msg.role === 'bot' && (
                        <button
                          onClick={() => copyText(index, msg.content)}
                          title="Salin jawaban"
                          aria-label="Salin jawaban"
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                        >
                          {copiedId === index ? (
                            <>
                              <CheckIcon /> Tersalin
                            </>
                          ) : (
                            <>
                              <CopyIcon /> Salin
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && <UserAvatar size="w-8 h-8" />}
                </div>
              ))}
            </div>
          )}

          {/* Indikator Loading */}
          {isLoading && (
            <div className="msg-in mt-5 flex items-end gap-2.5">
              <BotAvatar size="w-8 h-8" />
              <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3.5 shadow-sm">
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

        {/* Form Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[var(--border)] bg-[var(--surface-2)]/60 px-3 py-3 backdrop-blur-xl sm:px-4"
        >
          <div className="flex items-end gap-2">
            <div className="flex flex-1 items-end rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-colors focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/25">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pesan di sini... (Enter untuk kirim)"
                className="max-h-40 w-full resize-none bg-transparent px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Kirim pesan"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--user-from)] to-[var(--user-to)] text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-[11px] text-[var(--muted)]">
            AI dapat membuat kesalahan. Periksa ulang informasi penting.
          </p>
        </form>
      </div>
    </div>
  );
}