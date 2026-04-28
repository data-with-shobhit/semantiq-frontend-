'use client';

import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/">
            <span className="font-display font-bold text-white text-4xl tracking-widest uppercase flex items-baseline justify-center">
              SEMANTIQ<span className="inline-block w-[0.18em] h-[0.18em] bg-red-500 rounded-full ml-[0.05em]"></span>
            </span>
          </Link>
          <p className="font-mono text-white/50 text-xs uppercase tracking-widest mt-4">WELCOME BACK.</p>
        </div>

        {/* Card */}
        <div className="bg-transparent border border-white/20 p-10 flex flex-col gap-8">
          <a
            href={`${API}/auth/google`}
            className="flex items-center justify-center gap-4 w-full py-4 bg-white text-black text-sm font-mono font-bold uppercase tracking-widest border border-transparent hover:bg-red-500 hover:text-white transition-all"
          >
            <GoogleIcon />
            SIGN IN WITH GOOGLE
          </a>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-mono uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-white/50 text-xs font-mono uppercase tracking-widest">
            NEW TO SEMANTIQ?{' '}
            <Link href="/signup" className="text-white hover:text-red-500 underline transition-colors">
              SIGN UP
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8 font-mono uppercase tracking-widest">
          BY SIGNING IN YOU AGREE TO OUR TERMS OF SERVICE.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
