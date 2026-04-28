'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkspaces, createWorkspace, deleteWorkspace } from '@/lib/api';
import type { Domain } from '@/lib/types';

const DOMAINS: Domain[] = ['general', 'financial', 'legal', 'medical', 'clinical', 'scientific', 'technical'];

const DOMAIN_COLORS: Record<Domain, string> = {
  financial:  'text-white border-white/20',
  legal:      'text-white border-white/20',
  medical:    'text-white border-white/20',
  clinical:   'text-white border-white/20',
  scientific: 'text-white border-white/20',
  technical:  'text-white border-white/20',
  general:    'text-white border-white/20',
};

export default function DashboardPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState<Domain>('general');

  const { data } = useQuery({ queryKey: ['workspaces'], queryFn: getWorkspaces });
  const workspaces = data?.workspaces ?? [];

  const createMut = useMutation({
    mutationFn: () => createWorkspace(newName.trim(), newDomain),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      setShowNew(false);
      setNewName('');
      toast.success('Workspace created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspaces'] }); toast.success('Workspace deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalMb = workspaces.reduce((s, w) => s + (w.storage_mb ?? 0), 0);
  const quotaMb = 200;

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      {/* Navbar */}
      <header className="border-b border-white/10 px-6 md:px-12 py-6 flex items-center justify-between">
        <span className="font-display font-bold text-white text-3xl tracking-widest uppercase flex items-baseline">
          SEMANTIQ<span className="inline-block w-[0.18em] h-[0.18em] bg-red-500 rounded-full ml-[0.05em]"></span>
        </span>
        <button
          onClick={() => router.push('/profile')}
          className="font-mono text-xs text-white/50 uppercase tracking-widest hover:text-white transition-colors"
        >
          PROFILE
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Storage bar */}
        <div className="mb-16 border border-white/10 p-6">
          <div className="flex justify-between font-mono text-xs text-white/50 uppercase tracking-widest mb-4">
            <span>Storage Used</span>
            <span className="text-white">{totalMb.toFixed(1)} MB / {quotaMb} MB</span>
          </div>
          <div className="h-2 bg-white/5 overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${Math.min((totalMb / quotaMb) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Workspace grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="group bg-transparent border border-white/20 p-8 hover:bg-white hover:text-black transition-all cursor-pointer relative"
              onClick={() => router.push(`/workspace/${ws.id}/chat`)}
            >
              <div className="flex items-start justify-between mb-6">
                <span className={`text-xs px-3 py-1 border font-mono uppercase tracking-widest transition-colors group-hover:border-black group-hover:text-black ${DOMAIN_COLORS[ws.domain]}`}>
                  {ws.domain}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${ws.name}"?`)) deleteMut.mutate(ws.id); }}
                  className="opacity-0 group-hover:opacity-100 text-black hover:text-red-600 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-display uppercase text-2xl mb-2 group-hover:text-black">{ws.name}</h3>
              <p className="font-mono text-white/50 text-xs uppercase tracking-widest group-hover:text-black/60">{ws.storage_mb ?? 0} MB used</p>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={24} className="text-black" />
              </div>
            </div>
          ))}

          {/* New workspace card */}
          {!showNew ? (
            <button
              onClick={() => setShowNew(true)}
              className="bg-transparent border border-dashed border-white/20 p-8 hover:border-red-500 transition-all flex flex-col items-center justify-center gap-4 text-white/50 hover:text-red-500 min-h-[200px]"
            >
              <Plus size={32} />
              <span className="font-display uppercase text-xl tracking-widest">New Workspace</span>
            </button>
          ) : (
            <div className="bg-white/5 border border-white/20 p-8 flex flex-col gap-6">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="WORKSPACE NAME"
                className="bg-black border-b border-white/20 px-0 py-3 text-lg font-display uppercase tracking-widest text-white placeholder:text-white/30 outline-none focus:border-red-500 transition-colors"
              />
              <select
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value as Domain)}
                className="bg-black border border-white/20 px-4 py-3 text-sm font-mono uppercase tracking-widest text-white outline-none focus:border-red-500 appearance-none"
              >
                {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="flex gap-4 mt-auto">
                <button
                  onClick={() => createMut.mutate()}
                  disabled={!newName.trim() || createMut.isPending}
                  className="flex-1 py-3 bg-white text-black font-display uppercase tracking-widest text-sm hover:bg-red-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  {createMut.isPending ? 'CREATING…' : 'CREATE'}
                </button>
                <button
                  onClick={() => { setShowNew(false); setNewName(''); }}
                  className="px-6 py-3 font-display uppercase tracking-widest text-sm text-white/50 hover:text-white border border-white/20 hover:border-white transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
