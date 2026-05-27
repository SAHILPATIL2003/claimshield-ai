// ============================================================================
// ClaimShield AI - Landing Page Entrypoint
// ============================================================================

'use client';

import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Activity, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Brain,
  Zap,
  CheckCircle,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/30 font-sans relative overflow-x-hidden">
      
      {/* Background radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />

      {/* Navigation bar Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-md block leading-tight text-white">ClaimShield AI</span>
              <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider block">Ledger Guard</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <Link href="/fraud-prevention" className="hover:text-teal-400 transition-colors">Fraud Prevention</Link>
            <Link href="/about" className="hover:text-teal-400 transition-colors">About US</Link>
            <Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
            <Link href="/auth/login" className="hover:text-teal-400 transition-colors">Portals</Link>
          </nav>
               
          <Link
            href="/auth/login"
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-teal-500/10 hover:shadow-teal-500/20"
          >
            Launch Console
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xxs font-bold text-teal-450 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 animate-pulse text-teal-405" />
            Active Blockchain Anchoring Engine
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Immutable Healthcare Record Validation & Insurance Fraud Prevention
          </h1>

          <p className="text-sm md:text-md text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Protect patients and providers. ClaimShield AI anchors medical reports to a permissioned blockchain ledger, automatically generating SHA-256 validation chains that instantly flag database tampering.
          </p>

          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 active:scale-95 transition-all"
            >
              Sign In To Portal
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <a
              href="#blockchain-expl"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl font-bold text-sm text-slate-350 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Highlights / Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Platform Core Pillars</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Decentralized validation mechanisms engineered for enterprise hospital networks and insurance organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl space-y-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-2xl">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Immutable Timeline</h3>
            <p className="text-xs text-slate-405 leading-relaxed">
              Patients can only append documents. Historical records, diagnoses, and descriptions are locked into cryptographic chains and cannot be altered or removed.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl space-y-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-2xl">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Medical Extracts</h3>
            <p className="text-xs text-slate-405 leading-relaxed">
              Tesseract OCR processing automatically translates report contents. The AI summary engine extracts critical metrics, abnormalities, and follow-ups.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl space-y-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Consensus Hash Audit</h3>
            <p className="text-xs text-slate-405 leading-relaxed">
              Every file computes a unique SHA-256 signature compared against blockchain anchors. Discrepancies prompt instant tampering warnings on doctor consoles.
            </p>
          </div>
        </div>
      </section>

      {/* How it works (Decentralized workflow) */}
      <section id="blockchain-expl" className="bg-slate-900/25 border-y border-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-xxs font-bold text-teal-400 rounded-full uppercase tracking-wider">
                Cryptographic Anchor Chain
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                How Blockchain Integrity Prevention Works
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a patient uploads a document, the server generates a cryptographically secure SHA-256 byte payload checksum. This checksum is packed inside a ledger block with a consensus proof-of-work nonce, referencing the hash code of the previous block in the sequence.
              </p>
              
              <div className="space-y-4 font-semibold text-slate-350 text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-teal-500 shrink-0" />
                  <span>If database entries are altered later, file hashes will mismatch.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-teal-500 shrink-0" />
                  <span>Doctor dashboard screens automatically display flashing red flags.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-teal-500 shrink-0" />
                  <span>Audited history tracks administrators' errata file deletions.</span>
                </div>
              </div>
            </div>

            {/* Visual simulation representation */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl font-mono text-xxs space-y-4 shadow-2xl">
              <span className="text-slate-500 font-bold uppercase tracking-widest block pb-2 border-b border-slate-800 flex items-center gap-1">
                <Cpu className="w-4 h-4 text-teal-400" />
                Ledger Node Trace Monitor
              </span>

              <div className="space-y-3.5">
                {/* Block 0 */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 relative">
                  <span className="text-slate-550 font-bold block">BLOCK #0 (GENESIS)</span>
                  <span className="text-teal-450 block truncate mt-0.5">hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                </div>

                {/* Link symbol */}
                <div className="flex justify-center text-teal-500 py-0.5">
                  <ArrowRight className="w-4.5 h-4.5 transform rotate-90" />
                </div>

                {/* Block 1 */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-teal-500/20 relative">
                  <span className="text-slate-550 font-bold block">BLOCK #1 (BLOOD REPORT)</span>
                  <span className="text-slate-400 block truncate mt-0.5">prevHash: e3b0c44298fc1c149afbf4...</span>
                  <span className="text-teal-400 block truncate mt-0.5">hash: 00f9a2b8e3a2b4b455b8c9d2f3a...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal selections */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-4">Launch ClaimShield Portals</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mb-10">
          Sign in to access secure dashboard modules for patients, medical practitioners, or system administrators.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link
            href="/auth/login"
            className="p-6 bg-slate-900 hover:bg-teal-500/5 border border-slate-800 hover:border-teal-500/30 rounded-2xl transition-all text-center flex flex-col items-center gap-3 cursor-pointer group"
          >
            <Users className="w-8 h-8 text-teal-400" />
            <span className="font-bold text-white group-hover:text-teal-400 transition-colors">PATIENT ACCESS</span>
            <span className="text-xxs text-slate-500 leading-relaxed">Upload records, review clinical observations timelines, scan verifier QR badges.</span>
          </Link>

          <Link
            href="/auth/login"
            className="p-6 bg-slate-900 hover:bg-teal-500/5 border border-slate-800 hover:border-teal-500/30 rounded-2xl transition-all text-center flex flex-col items-center gap-3 cursor-pointer group"
          >
            <Building className="w-8 h-8 text-teal-400" />
            <span className="font-bold text-white group-hover:text-teal-400 transition-colors">DOCTOR ACCESS</span>
            <span className="text-xxs text-slate-500 leading-relaxed">Search patients, review OCR translations and AI summaries, add diagnostic notes.</span>
          </Link>

          <Link
            href="/auth/login"
            className="p-6 bg-slate-900 hover:bg-teal-500/5 border border-slate-800 hover:border-teal-500/30 rounded-2xl transition-all text-center flex flex-col items-center gap-3 cursor-pointer group"
          >
            <ShieldCheck className="w-8 h-8 text-teal-400" />
            <span className="font-bold text-white group-hover:text-teal-400 transition-colors">ADMIN PORTAL</span>
            <span className="text-xxs text-slate-500 leading-relaxed">Monitor ledger block nodes, adjust claim pay statuses, review system audit shell traces.</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 text-slate-500 text-xxs font-semibold">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 uppercase tracking-wider">
          <span>&copy; 2026 ClaimShield AI. All rights reserved.</span>
          <span>Permissioned Cryptographic Ledger.</span>
        </div>
      </footer>

    </div>
  );
}
