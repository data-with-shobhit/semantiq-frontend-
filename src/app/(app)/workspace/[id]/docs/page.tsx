'use client';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Upload, Trash2, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { listDocuments, deleteDocument, getStrategyHistory } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL!;
const ALLOWED = ['.pdf', '.txt', '.md', '.docx', '.py', '.js', '.ts'];

const STATUS_ICON = {
  ready:      <CheckCircle2 size={16} className="text-white" />,
  processing: <Clock size={16} className="text-red-500 animate-spin" />,
  failed:     <XCircle size={16} className="text-red-500" />,
};

function DocRow({ doc, workspaceId }: { doc: Document; workspaceId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: stratData } = useQuery({
    queryKey: ['strategies', doc.id],
    queryFn: () => getStrategyHistory(doc.id),
    enabled: open,
  });
  const active = stratData?.strategies.find((s) => s.is_active);

  const deleteMut = useMutation({
    mutationFn: () => deleteDocument(doc.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['docs', workspaceId] }); toast.success('Document deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="bg-transparent border border-white/20 rounded-none overflow-hidden hover:border-white/40 transition-colors">
      <div
        className="flex items-center gap-6 px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {STATUS_ICON[doc.status] ?? STATUS_ICON.failed}
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg text-white uppercase tracking-widest truncate">{doc.filename}</p>
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest mt-1">
            {doc.status === 'ready' ? `${doc.chunk_count ?? 0} CHUNKS` : doc.status}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${doc.filename}"?`)) deleteMut.mutate(); }}
            className="text-white/50 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          {open ? <ChevronUp size={16} className="text-white" /> : <ChevronDown size={16} className="text-white/50" />}
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 px-6 py-6 bg-black">
          {active ? (
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-2">CHUNKER</p>
                <p className="font-mono text-sm text-white uppercase tracking-widest">{active.chunker}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-2">CHUNK SIZE</p>
                <p className="font-mono text-sm text-white uppercase tracking-widest">{active.chunk_size}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-2">OVERLAP</p>
                <p className="font-mono text-sm text-white uppercase tracking-widest">{active.overlap}</p>
              </div>
              {active.reasoning && (
                <div className="col-span-3 mt-4 pt-4 border-t border-white/10">
                  <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-3">STRATEGY REASONING</p>
                  <p className="font-mono text-sm text-white/70 leading-relaxed tracking-wide">{active.reasoning}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">NO STRATEGY YET — PROCESSING MAY STILL BE RUNNING.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const { data } = useQuery({
    queryKey: ['docs', Number(id)],
    queryFn: () => listDocuments(Number(id)),
    refetchInterval: (query) => {
      const docs = (query.state.data as any)?.documents ?? [];
      return docs.some((d: Document) => d.status === 'processing') ? 4000 : false;
    },
  });
  const docs = data?.documents ?? [];

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const ext = '.' + file.name.split('.').pop()!.toLowerCase();
    if (!ALLOWED.includes(ext)) { toast.error(`File type ${ext} not supported`); return; }

    setUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => setUploadProgress((p) => Math.min(p + 12, 82)), 400);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/ingest?workspace_id=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      clearInterval(interval);
      setUploadProgress(100);
      if (res.ok) {
        toast.success(`"${file.name}" ingestion started`);
        qc.invalidateQueries({ queryKey: ['docs', Number(id)] });
      } else {
        const err = await res.json();
        toast.error(typeof err.detail === 'string' ? err.detail : 'Upload failed');
      }
    } catch {
      clearInterval(interval);
      toast.error('Upload failed — is the backend running?');
    } finally {
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 600);
    }
  }, [id, token, qc]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, multiple: false });

  return (
    <div className="h-screen overflow-y-auto px-8 py-12 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl text-white uppercase tracking-widest mb-12">DOCUMENTS</h1>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-none p-16 text-center cursor-pointer transition-all mb-12',
          isDragActive ? 'border-red-500 bg-red-500/5' : 'border-white/20 hover:border-white/50 hover:bg-white/5',
        )}
      >
        <input {...getInputProps()} />
        <Upload size={32} className={cn('mx-auto mb-6 transition-colors', isDragActive ? 'text-red-500' : 'text-white/50')} />
        <p className={cn('font-display text-2xl uppercase tracking-widest mb-2 transition-colors', isDragActive ? 'text-red-500' : 'text-white')}>
          {isDragActive ? 'DROP TO UPLOAD' : 'DROP FILE OR BROWSE'}
        </p>
        <p className="font-mono text-xs text-white/40 uppercase tracking-widest mt-4">PDF · TXT · DOCX · MD · PY · JS · TS — MAX 50MB</p>
        {uploading && (
          <div className="mt-8 bg-white/10 h-2 max-w-md mx-auto overflow-hidden border border-white/20">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Doc list */}
      <div className="space-y-4">
        {docs.length === 0 ? (
          <div className="border border-white/10 p-12 text-center">
            <p className="font-mono text-sm text-white/40 uppercase tracking-widest">NO DOCUMENTS YET. UPLOAD ONE ABOVE.</p>
          </div>
        ) : (
          docs.map((doc) => <DocRow key={doc.id} doc={doc} workspaceId={Number(id)} />)
        )}
      </div>
    </div>
  );
}
