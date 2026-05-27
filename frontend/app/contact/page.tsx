// ============================================================================
// ClaimShield AI - Contact Page
// ============================================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSuccess(true);
    setSubmitting(false);
  };

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
        </div>
      </header>

      {/* Contact Form Section */}
      <section className="max-w-md mx-auto px-6 py-20 z-10 relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Contact Our Team</h1>
          <p className="text-xs text-slate-400 mt-2">
            Have questions regarding blockchain integrations, provider registries, or claim audit setups? Contact us.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl"
        >
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-3 bg-teal-500/10 text-teal-400 rounded-full">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Message Received!</h3>
              <p className="text-xxs text-slate-400 leading-relaxed">
                Thank you for contacting ClaimShield AI. Our developer relations or integration support team will email you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-400">
              <div>
                <label className="block text-xxs uppercase tracking-wider mb-2 font-bold">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs uppercase tracking-wider mb-2 font-bold">Your Email</label>
                <input
                  type="email"
                  placeholder="john@doe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs uppercase tracking-wider mb-2 font-bold">Message</label>
                <textarea
                  placeholder="Describe your inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-700"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
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
