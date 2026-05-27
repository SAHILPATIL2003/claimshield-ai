// ============================================================================
// ClaimShield AI - Public QR Integrity Verification
// ============================================================================

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, QrCode, RefreshCw, FileText, Clock, ExternalLink } from 'lucide-react';

import { api } from '../../../lib/api';

export default function VerifyRecordPublicPage() {
  const params = useParams<{ id: string }>();
  const recordId = params?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const title = useMemo(() => {
    return result?.isValid ? 'Ledger Match Confirmed' : 'LEDGER DISCREPANCY DETECTED';
  }, [result]);

  const runVerification = async () => {
    if (!recordId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.verifyRecordPublic(recordId);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'Public verification failed.');
      }
    } catch (e: any) {
      setError(e?.message || 'Public verification request failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-[-200px] left-[-200px] w-[420px] h-[420px] bg-teal-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="relative max-w-3xl mx-auto px-6 py-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
            <QrCode className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ClaimShield AI Public Verification
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              SHA-256 + permissioned ledger integrity check
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 border border-slate-800/70 bg-slate-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border border-teal-500/30 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Running integrity verification...</p>
                  <p className="text-xs text-slate-400 mt-1">Re-hashing the current file bytes and comparing to ledger anchors.</p>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 border border-rose-500/30 bg-rose-500/5"
            >
              <AlertTriangle className="w-8 h-8 text-rose-400 mb-3" />
              <h2 className="text-xl font-extrabold text-rose-300">Verification unavailable</h2>
              <p className="text-sm text-rose-200/80 mt-2">{error}</p>
            </motion.div>
          )}

          {!loading && !error && !result && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 border border-slate-800/70 bg-slate-900/30"
            >
              <p className="text-sm text-slate-300">
                Scan detected. Verifying record: <span className="font-mono text-teal-300">{recordId}</span>
              </p>
            </motion.div>
          )}

          {!loading && !error && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`glass-card p-8 ${
                result.isValid ? 'border-teal-500/30 bg-teal-500/5' : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-slate-950/30">
                    {result.isValid ? (
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-xxs font-extrabold uppercase tracking-wider text-slate-200">
                      {title}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>
                        Anchored at:{' '}
                        <span className="font-mono text-slate-200">
                          {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>
                        File:{' '}
                        <span className="font-semibold text-slate-200">{result.fileName || 'Medical Report'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {result.fileUrl && (
                    <a
                      href={result.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs font-bold text-teal-300 hover:bg-slate-900/80"
                    >
                      Open File
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={runVerification}
                    className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs font-bold text-slate-200 hover:bg-slate-900/80 active:scale-[0.99] cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 inline-block mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Re-Verify
                  </button>
                </div>
              </div>

              <div className="mt-7 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 font-mono text-xxs text-slate-300 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-xxs">DB / Stored SHA-256</p>
                    <p className="break-all mt-1 text-slate-200">{result.storedHash}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-xxs">Ledger SHA-256</p>
                    <p className="break-all mt-1 text-slate-200">{result.blockchainHash}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-xxs">Block Index</p>
                    <p className="mt-1 text-slate-200">{result.blockIndex ?? -1}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider text-xxs">Tampering Detected</p>
                    <p className={`mt-1 ${result.tamperingDetected ? 'text-rose-300' : 'text-teal-300'}`}>
                      {result.tamperingDetected ? 'YES' : 'NO'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-slate-500 mt-6">
          Note: This QR verification re-hashes the current file bytes and compares them to the SHA-256 anchored on the permissioned ledger.
        </p>
      </div>
    </div>
  );
}

