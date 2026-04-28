'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send, Copy, RotateCcw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { Message, Chunk } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL!;
const TTL_MS = 12 * 60 * 60 * 1000;

function chatKey(wsId: string) { return `semantiq:chat:${wsId}`; }

function loadHistory(wsId: string): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(chatKey(wsId));
    if (!raw) return [];
    const { messages, lastAt } = JSON.parse(raw);
    if (Date.now() - lastAt > TTL_MS) { localStorage.removeItem(chatKey(wsId)); return []; }
    return messages;
  } catch { return []; }
}

function saveHistory(wsId: string, messages: Message[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(chatKey(wsId), JSON.stringify({ messages, lastAt: Date.now() }));
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [nodeStatus, setNodeStatus] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadHistory(id));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const question = input.trim();
    setInput('');

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: question, timestamp: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveHistory(id, updated);

    setStreaming(true);
    setStreamingText('');
    setNodeStatus('');

    let answer = '';
    let chunks: Chunk[] = [];
    let llm_calls = 0;
    const t0 = performance.now();

    try {
      const history = updated.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API}/query/stream`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, workspace_id: Number(id), history, bypass_cache: false }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'status') setNodeStatus(event.node);
            if (event.type === 'token') { answer += event.data; setStreamingText(answer); }
            if (event.type === 'done') { llm_calls = event.llm_calls ?? 0; }
            if (event.chunks) chunks = event.chunks;
          } catch { /* skip malformed */ }
        }
      }
    } catch (e) {
      answer = 'Failed to reach the server. Is the backend running?';
    }

    const latency_ms = Math.round(performance.now() - t0);
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: answer || streamingText,
      chunks,
      meta: { latency_ms, llm_calls, cached: false },
      timestamp: Date.now(),
    };

    const final = [...updated, assistantMsg];
    setMessages(final);
    saveHistory(id, final);
    setStreaming(false);
    setStreamingText('');
    setNodeStatus('');
  };

  const clearChat = () => {
    localStorage.removeItem(chatKey(id));
    setMessages([]);
    toast.success('Chat cleared');
  };

  const shareWorkspace = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          {nodeStatus && (
            <span className="flex items-center gap-2 font-mono text-xs text-red-500 uppercase tracking-widest animate-pulse">
              <Zap size={14} /> {nodeStatus}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <button onClick={shareWorkspace} className="font-mono text-xs text-white/50 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2">
            <Copy size={14} /> SHARE
          </button>
          <button onClick={clearChat} className="font-mono text-xs text-white/50 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2">
            <RotateCcw size={14} /> NEW CHAT
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <p className="font-display uppercase text-3xl text-white/20 tracking-widest">ASK ANYTHING.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-3xl w-full', msg.role === 'user' ? 'ml-16 flex justify-end' : 'mr-16')}>
              <div className={cn(
                'px-6 py-5 whitespace-pre-wrap rounded-none',
                msg.role === 'user'
                  ? 'bg-white text-black font-display uppercase tracking-widest text-lg border border-white'
                  : 'bg-transparent border border-white/20 text-white font-mono text-sm leading-relaxed tracking-wide',
              )}>
                {msg.content}
              </div>

              {/* Chunks */}
              {msg.chunks && msg.chunks.length > 0 && (
                <details className="mt-4">
                  <summary className="font-mono text-xs text-white/50 uppercase tracking-widest hover:text-white cursor-pointer select-none mb-4">
                    {msg.chunks.length} SOURCE{msg.chunks.length > 1 ? 'S' : ''}
                  </summary>
                  <div className="space-y-4">
                    {msg.chunks.map((c, i) => (
                      <div key={i} className="bg-transparent border border-white/10 p-4 rounded-none">
                        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                          <span className="text-xs text-white/50 font-mono uppercase tracking-widest">
                            {c.web ? '🌐 WEB' : `📄 DOC ${c.payload?.doc_id ?? ''}`}
                            {c.payload?.section ? ` · §${c.payload.section}` : ''}
                          </span>
                          <span className="text-xs font-mono text-red-500">
                            {((c.rerank_score ?? c.score ?? 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs font-mono text-white/70 line-clamp-3 leading-relaxed tracking-wide">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Meta */}
              {msg.meta && (
                <div className="flex gap-6 mt-4 border-t border-white/10 pt-3">
                  <span className="font-mono text-xs text-white/40 uppercase tracking-widest">{msg.meta.latency_ms}MS</span>
                  <span className="font-mono text-xs text-white/40 uppercase tracking-widest">{msg.meta.llm_calls} LLM CALLS</span>
                  {msg.meta.cached && <span className="font-mono text-xs text-red-500 uppercase tracking-widest">CACHED</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {streaming && (
          <div className="flex justify-start">
            <div className="max-w-3xl w-full mr-16">
              <div className="bg-transparent border border-white/20 text-white font-mono text-sm leading-relaxed tracking-wide px-6 py-5 rounded-none whitespace-pre-wrap">
                {streamingText || <span className="inline-flex gap-2"><Dot /><Dot delay={0.2} /><Dot delay={0.4} /></span>}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/20 px-8 py-6">
        <div className="flex items-end gap-4 bg-transparent border border-white/20 px-6 py-4 focus-within:border-red-500 transition-colors rounded-none">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="ASK A QUESTION..."
            rows={1}
            className="flex-1 bg-transparent font-display text-lg uppercase tracking-widest text-white placeholder:text-white/30 outline-none resize-none max-h-48 overflow-y-auto"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="shrink-0 p-3 bg-red-500 text-white rounded-none border border-transparent hover:bg-white hover:text-red-500 hover:border-red-500 disabled:opacity-30 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest mt-4 text-center">SHIFT+ENTER FOR NEW LINE</p>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="w-2 h-2 bg-red-500 rounded-none animate-bounce"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}
