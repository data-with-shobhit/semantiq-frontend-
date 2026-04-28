'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Suspense } from 'react';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    if (token) {
      setToken(token);
      router.replace('/dashboard');
    } else {
      router.replace(`/signin?error=${error ?? 'unknown'}`);
    }
  }, [params, router, setToken]);

  return (
    <div className="flex h-screen items-center justify-center bg-bg-base flex-col gap-4">
      <span className="font-display font-bold text-gold text-3xl tracking-widest animate-pulse">SEMANTIQ</span>
      <p className="text-zinc-500 text-sm">Signing you in…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-bg-base" />}>
      <CallbackInner />
    </Suspense>
  );
}
