// ============================================================================
// ClaimShield AI - About Page
// ============================================================================

'use client';

import Link from 'next/link';
import { 
  Building, 
  ShieldCheck, 
  Cpu, 
  Users, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/30 font-sans relative overflow-x-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Home</span>
          </Link>

          <Link
            href="/auth/login"
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 rounded-xl font-bold text-xs"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xxs font-bold text-teal-400 uppercase tracking-widest">
          <Globe className="w-3.5 h-3.5" />
          Our Mission
        </span>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          Securing Medical Ledger Integrity
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed">
          ClaimShield AI was founded on a simple premise: medical diagnostic history should be immutable. By utilizing a hybrid model combining centralized PostgreSQL storage with decentralized blockchain hash anchors, we guarantee medical files can never be tampered with or retroactively modified.
        </p>
      </section>

      {/* Platform Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-white text-center mb-12">Hybrid Centralized + Ledger Architecture</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-md font-bold text-teal-400 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Centralized Tier (PostgreSQL + Supabase)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Medical document files (PDFs, scans, prescriptions) are stored inside secure Supabase cloud buckets. Corresponding metadata (patient profiles, hospital associations, diagnostic dates, AI-generated NLP extracts) is organized in structured PostgreSQL tables, providing rapid search queries.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-md font-bold text-teal-405 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              Decentralized Tier (Cryptographic Blocks)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every file generates a SHA-256 byte payload checksum when uploaded. This checksum is locked inside a block chain node using custom proof-of-work nonces. Any database modification alters the current file hash, triggering instant mismatches during audits.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 text-slate-500 text-xxs font-semibold mt-20">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center uppercase tracking-wider">
          <span>&copy; 2026 ClaimShield AI.</span>
          <span>Permissioned Cryptographic Ledger.</span>
        </div>
      </footer>

    </div>
  );
}
