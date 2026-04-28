'use client';

import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { MessageSquare, FolderOpen, BarChart2, Library, ArrowLeft, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getWorkspaces } from '@/lib/api';
import { cn } from '@/lib/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

const NAV = [
  { label: 'Chat',       href: 'chat',       icon: MessageSquare },
  { label: 'Documents',  href: 'docs',       icon: FolderOpen },
  { label: 'Eval',       href: 'eval',       icon: BarChart2 },
  { label: 'Strategies', href: 'strategies', icon: Library },
];

function SidebarInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = params.id as string;
  const [webSearch, setWebSearch] = useState(false);

  const { data } = useQuery({ queryKey: ['workspaces'], queryFn: getWorkspaces });
  const ws = data?.workspaces.find((w) => w.id === Number(id));

  return (
    <div className="flex min-h-screen bg-black font-sans text-white">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/20 flex flex-col py-8 px-0 gap-2">
        {/* Back + logo */}
        <div className="flex items-center gap-4 mb-8 px-6">
          <button onClick={() => router.push('/dashboard')} className="text-white/50 hover:text-red-500 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <span className="font-display font-bold text-white text-xl tracking-widest uppercase flex items-baseline">
            SEMANTIQ<span className="inline-block w-[0.18em] h-[0.18em] bg-red-500 rounded-full ml-[0.05em]"></span>
          </span>
        </div>

        {/* Workspace name */}
        {ws && (
          <div className="px-6 mb-8">
            <p className="font-display text-white text-lg uppercase tracking-widest truncate">{ws.name}</p>
            <p className="font-mono text-white/50 text-xs mt-1 uppercase tracking-widest border border-white/20 inline-block px-2 py-0.5">{ws.domain}</p>
          </div>
        )}

        {/* Nav links */}
        <div className="flex flex-col gap-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const full = `/workspace/${id}/${href}`;
            const active = pathname.endsWith(`/${href}`);
            return (
              <Link
                key={href}
                href={full}
                className={cn(
                  'flex items-center gap-4 px-6 py-3 font-mono text-sm tracking-widest uppercase transition-all',
                  active
                    ? 'border-l-4 border-red-500 text-white bg-white/5'
                    : 'border-l-4 border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]',
                )}
              >
                <Icon size={16} className={active ? 'text-red-500' : ''} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Bottom controls */}
        <div className="mt-auto flex flex-col gap-4 px-6">
          <div className="flex items-center justify-between border border-white/20 p-4">
            <div className="flex items-center gap-3 font-mono text-white/50 text-xs uppercase tracking-widest">
              <Globe size={14} />
              WEB SEARCH
            </div>
            <button
              onClick={() => setWebSearch(!webSearch)}
              className={cn(
                'w-10 h-5 transition-all relative rounded-none border border-white/20',
                webSearch ? 'bg-red-500 border-red-500' : 'bg-transparent',
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-3 h-3 bg-white transition-all rounded-none',
                webSearch ? 'left-[22px]' : 'left-0.5',
              )} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <SidebarInner>{children}</SidebarInner>
    </QueryClientProvider>
  );
}
