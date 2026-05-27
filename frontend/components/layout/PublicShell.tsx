'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

export default function PublicShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-white">ClaimShield AI</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Link href="/about" className="hover:text-teal-400">About</Link>
            <Link href="/fraud-prevention" className="hover:text-teal-400">Fraud Prevention</Link>
            <Link href="/contact" className="hover:text-teal-400">Contact</Link>
          </nav>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1"
          >
            Launch <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>
      <main className="relative max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mb-10">{subtitle}</p>}
        {children}
      </main>
    </div>
  );
}
