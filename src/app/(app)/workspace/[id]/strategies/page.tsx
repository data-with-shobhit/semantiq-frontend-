'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listStrategies, apiJson } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function StrategiesPage() {
  const qc = useQueryClient();
  const [namedOnly, setNamedOnly] = useState(false);
  const { data } = useQuery({ queryKey: ['strategies', namedOnly], queryFn: () => listStrategies(namedOnly) });
  const strategies = data?.strategies ?? [];

  const nameMut = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiJson(`/eval/strategy/${id}/name`, { method: 'POST', body: JSON.stringify({ name }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['strategies'] }); toast.success('Strategy saved'); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="h-screen overflow-y-auto px-8 py-12 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <h1 className="font-display text-4xl text-white uppercase tracking-widest">STRATEGY LIBRARY</h1>
        <label className="flex items-center gap-3 font-mono text-xs text-white/50 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
          <input type="checkbox" checked={namedOnly} onChange={(e) => setNamedOnly(e.target.checked)} className="accent-red-500 w-4 h-4 rounded-none" />
          NAMED ONLY
        </label>
      </div>

      {strategies.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="font-mono text-sm text-white/40 uppercase tracking-widest">NO STRATEGIES FOUND. INGEST A DOCUMENT FIRST.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {strategies.map((s) => (
            <StrategyCard key={s.strategy_id} strategy={s} onSaveName={(name) => nameMut.mutate({ id: s.strategy_id, name })} />
          ))}
        </div>
      )}
    </div>
  );
}

function StrategyCard({ strategy: s, onSaveName }: { strategy: any; onSaveName: (name: string) => void }) {
  const [name, setName] = useState(s.name ?? '');
  return (
    <div className="bg-transparent border border-white/20 p-8 hover:border-white/40 transition-colors">
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <p className="font-display text-xl text-white uppercase tracking-widest">{s.filename}</p>
          <p className="font-mono text-xs text-white/50 mt-2 uppercase tracking-widest">V{s.version} · {s.source}</p>
        </div>
        {s.is_active && (
          <span className="font-mono text-xs px-3 py-1 bg-red-500 text-white uppercase tracking-widest">ACTIVE</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-8 mb-6">
        <div><p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-2">CHUNKER</p><p className="font-mono text-sm text-white uppercase tracking-widest">{s.chunker}</p></div>
        <div><p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-2">CHUNK SIZE</p><p className="font-mono text-sm text-white uppercase tracking-widest">{s.chunk_size}</p></div>
        <div><p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-2">OVERLAP</p><p className="font-mono text-sm text-white uppercase tracking-widest">{s.overlap}</p></div>
      </div>

      {s.reasoning && (
        <p className="font-mono text-xs text-white/60 mb-8 leading-relaxed tracking-wide line-clamp-3">
          {s.reasoning.startsWith('LLM failed')
            ? 'Strategy auto-selected using heuristics (LLM unavailable at ingestion time)'
            : s.reasoning}
        </p>
      )}

      {s.ragas_scores && (
        <div className="flex gap-8 mb-8 border-t border-white/10 pt-6">
          {Object.entries(s.ragas_scores).map(([k, v]) => (
            <span key={k} className="font-mono text-xs text-white/40 uppercase tracking-widest">{k}: <span className="text-red-500">{(v as number).toFixed(2)}</span></span>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="NAME THIS STRATEGY…"
          className="flex-1 bg-black border border-white/20 px-4 py-3 font-mono text-xs text-white uppercase tracking-widest placeholder:text-white/20 outline-none focus:border-red-500 transition-colors"
        />
        <button
          onClick={() => name.trim() && onSaveName(name.trim())}
          className="px-8 py-3 bg-white text-black font-display uppercase tracking-widest text-sm hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
          disabled={!name.trim()}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}
