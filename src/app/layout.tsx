import type { Metadata } from 'next';
import { Anton, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SEMANTIQ — Corrective Intelligence',
  description:
    'CRAG-powered document intelligence. Retrieves, self-corrects, and answers with precision across every knowledge domain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${anton.variable} ${jetbrains.variable} bg-background text-foreground antialiased`}
      >
        {children}
        <Toaster theme="dark" position="bottom-right" toastOptions={{
          style: { background: '#111111', border: '1px solid #222222', color: '#ffffff' },
        }} />
      </body>
    </html>
  );
}
