'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, LogOut } from 'lucide-react';
import { getProfile } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-white/10">
      <p className="font-mono text-xs text-white/40 uppercase tracking-widest">{label}</p>
      <p className="font-mono text-sm text-white uppercase tracking-widest">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clearToken);
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const signOut = () => { clearToken(); router.push('/signin'); };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="border-b border-white/10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-mono text-xs uppercase tracking-widest">Dashboard</span>
        </button>
        <span className="font-display font-bold text-white text-xl tracking-widest uppercase flex items-baseline">
          SEMANTIQ<span className="inline-block w-[0.14em] h-[0.14em] bg-red-500 rounded-full ml-[0.05em]"></span>
        </span>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-white/50 hover:text-red-500 text-sm font-mono uppercase tracking-widest transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl text-white uppercase tracking-widest mb-16">PROFILE</h1>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-6 border-b border-white/10">
                <div className="h-3 w-24 bg-white/10 animate-pulse" />
                <div className="h-3 w-40 bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
        ) : data ? (
          <div>
            <Row label="Email" value={data.email} />
            <Row label="Tenant ID" value={data.tenant_id} />
            <Row label="Plan" value={data.plan.toUpperCase()} />
            <Row label="Domain" value={data.domain.toUpperCase()} />
            <Row label="Doc Quota" value={`${data.quota_docs} DOCS`} />
            <Row label="Token Quota" value={`${data.quota_tokens.toLocaleString()} TOKENS`} />
            {data.created_at && (
              <Row label="Member Since" value={new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
            )}
          </div>
        ) : (
          <p className="font-mono text-sm text-white/40 uppercase tracking-widest">Failed to load profile.</p>
        )}

        <div className="mt-16 pt-8 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full py-4 border border-red-500/50 text-red-500 font-display uppercase tracking-widest text-sm hover:bg-red-500 hover:text-white transition-all"
          >
            SIGN OUT
          </button>
        </div>
      </main>
    </div>
  );
}
