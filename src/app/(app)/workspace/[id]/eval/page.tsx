'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { listDocuments, getEvalHistory } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL!;

function ScoreBar({ value, label }: { value: number; label: string }) {
  const color = value >= 0.75 ? 'bg-white' : value >= 0.5 ? 'bg-white/50' : 'bg-red-500';
  return (
    <div className="border border-white/10 p-4">
      <div className="flex justify-between font-mono text-xs uppercase tracking-widest mb-3">
        <span className="text-white/50">{label}</span>
        <span className="text-white">{value.toFixed(3)}</span>
      </div>
      <div className="h-2 bg-white/5 overflow-hidden">
        <div className={cn('h-full transition-all', color)} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

export default function EvalPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [pairs, setPairs] = useState([{ q: '', gt: '' }]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [reingesting, setReingesting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { data: docsData } = useQuery({
    queryKey: ['docs', Number(id)],
    queryFn: () => listDocuments(Number(id)),
  });
  const readyDocs = (docsData?.documents ?? []).filter((d) => d.status === 'ready');

  const { data: evalData } = useQuery({
    queryKey: ['eval', selectedDoc],
    queryFn: () => getEvalHistory(selectedDoc!),
    enabled: !!selectedDoc,
  });
  const currentEval = evalData?.eval;

  const addPair = () => setPairs([...pairs, { q: '', gt: '' }]);
  const updatePair = (i: number, field: 'q' | 'gt', val: string) => {
    setPairs(pairs.map((p, j) => j === i ? { ...p, [field]: val } : p));
  };

  const runEval = async () => {
    if (!selectedDoc) { toast.error('Select a document first'); return; }
    const filled = pairs.filter((p) => p.q.trim() && p.gt.trim());
    if (filled.length === 0) { toast.error('Fill in at least one Q&A pair'); return; }
    setRunning(true);
    try {
      const res = await fetch(`${API}/eval/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_id: selectedDoc,
          questions: filled.map((p) => p.q),
          ground_truths: filled.map((p) => p.gt),
          delay_s: 5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success('Evaluation complete');
      } else {
        const err = await res.json();
        toast.error(err.detail ?? 'Eval failed');
      }
    } catch { toast.error('Failed to reach server'); }
    setRunning(false);
  };

  const evalResult = result ?? currentEval;

  const reingest = async () => {
    if (!selectedDoc) return;
    setReingesting(true);
    try {
      const res = await fetch(`${API}/eval/reingest/${selectedDoc}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_feedback: feedback || null }),
      });
      if (res.ok) {
        toast.success('Re-ingestion queued with refined strategy');
        setFeedback('');
      } else {
        const err = await res.json();
        toast.error(err.detail ?? 'Re-ingest failed');
      }
    } catch { toast.error('Failed to reach server'); }
    setReingesting(false);
  };

  return (
    <div className="h-screen overflow-y-auto px-8 py-12 max-w-4xl mx-auto">
      <h1 className="font-display text-4xl text-white uppercase tracking-widest mb-12">RAGAS EVALUATION</h1>

      {/* Doc selector */}
      <div className="mb-12">
        <label className="font-mono text-xs text-white/50 uppercase tracking-widest block mb-4">TARGET DOCUMENT</label>
        <select
          value={selectedDoc ?? ''}
          onChange={(e) => setSelectedDoc(Number(e.target.value) || null)}
          className="bg-black border border-white/20 rounded-none px-4 py-4 font-mono text-sm uppercase tracking-widest text-white outline-none focus:border-red-500 w-full appearance-none transition-colors"
        >
          <option value="">SELECT A DOCUMENT…</option>
          {readyDocs.map((d) => (
            <option key={d.id} value={d.id}>{d.filename} ({d.chunk_count} CHUNKS)</option>
          ))}
        </select>
      </div>

      {/* Current eval */}
      {evalResult && (
        <div className="border border-white/20 p-8 mb-12 space-y-8">
          <p className="font-mono text-xs text-red-500 uppercase tracking-widest">
            {result ? 'LATEST RUN' : `RUN AT ${currentEval?.created_at?.slice(0, 19)}`}
          </p>

          {/* RAGAS scores */}
          <div>
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">RAGAS SCORES</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreBar value={evalResult.faithfulness ?? 0} label="FAITHFULNESS" />
              <ScoreBar value={evalResult.context_precision ?? 0} label="CONTEXT PRECISION" />
              <ScoreBar value={evalResult.answer_relevance ?? 0} label="ANSWER RELEVANCY" />
              <ScoreBar value={evalResult.avg_score ?? 0} label="AVG SCORE" />
            </div>
          </div>

          {/* Retrieval metrics */}
          {evalResult.retrieval_metrics && Object.keys(evalResult.retrieval_metrics).length > 0 && (
            <div>
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">RETRIEVAL METRICS</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(evalResult.retrieval_metrics as Record<string, number>).map(([key, val]) => (
                  <ScoreBar key={key} value={val} label={key.replace(/_/g, ' ').toUpperCase()} />
                ))}
              </div>
            </div>
          )}

          {/* Re-ingest with refined strategy */}
          <div className="border-t border-white/10 pt-8">
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">RE-INGEST WITH REFINED STRATEGY</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              placeholder="OPTIONAL: DESCRIBE WHAT WAS WRONG (E.G. ANSWERS MISSING TABLE DATA)"
              className="w-full bg-black border border-white/20 px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500 resize-none transition-colors mb-4"
            />
            <button
              onClick={reingest}
              disabled={reingesting}
              className="px-8 py-3 bg-white/10 text-white font-display uppercase tracking-widest text-sm border border-white/20 hover:bg-red-500 hover:border-red-500 disabled:opacity-30 transition-all"
            >
              {reingesting ? 'QUEUING…' : 'RE-INGEST WITH REFINED STRATEGY'}
            </button>
            <p className="font-mono text-xs text-white/30 mt-3">
              RAGAS scores will be passed to LLM → new chunking strategy → doc re-embedded
            </p>
          </div>
        </div>
      )}

      {/* Q&A pairs */}
      <div className="space-y-6 mb-12">
        {pairs.map((pair, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-white/10 p-6">
            <div>
              <label className="font-mono text-xs text-white/50 uppercase tracking-widest block mb-4">QUESTION {i + 1}</label>
              <textarea
                value={pair.q}
                onChange={(e) => updatePair(i, 'q', e.target.value)}
                rows={3}
                placeholder="E.G. WHAT ARE THE DANGER SIGNS IN IMCI?"
                className="w-full bg-black border border-white/20 rounded-none px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500 resize-none transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-white/50 uppercase tracking-widest block mb-4">GROUND TRUTH {i + 1}</label>
              <textarea
                value={pair.gt}
                onChange={(e) => updatePair(i, 'gt', e.target.value)}
                rows={3}
                placeholder="EXPECTED ANSWER…"
                className="w-full bg-black border border-white/20 rounded-none px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500 resize-none transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={addPair}
          className="px-6 py-4 font-display uppercase tracking-widest text-sm text-white/50 border border-white/20 rounded-none hover:border-white hover:text-white transition-all"
        >
          + ADD PAIR
        </button>
        <button
          onClick={runEval}
          disabled={running || !selectedDoc}
          className="px-10 py-4 bg-red-500 text-white font-display uppercase tracking-widest text-sm border border-transparent rounded-none hover:bg-white hover:text-red-500 hover:border-red-500 disabled:opacity-30 transition-all"
        >
          {running ? 'RUNNING…' : 'RUN EVALUATION'}
        </button>
      </div>
      {running && <p className="font-mono text-xs text-red-500 mt-6 uppercase tracking-widest animate-pulse">THIS MAY TAKE A FEW MINUTES…</p>}
    </div>
  );
}
