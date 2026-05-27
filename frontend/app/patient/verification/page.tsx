// ============================================================================
// ClaimShield AI - Ledger Hash Audit & QR Verification Page
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  ShieldCheck, 
  AlertCircle, 
  Cpu, 
  RefreshCw, 
  QrCode,
  FileText,
  Clock,
  ExternalLink,
  Lock,
  ListRestart
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerificationPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<{ qrCodeUrl: string; verifyUrl: string } | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const res = await api.getMyRecords();
        if (res.success && res.data && res.data.length > 0) {
          setRecords(res.data);
          setSelectedRecordId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load verification selector records');
      }
    };
    loadRecords();
  }, []);

  const triggerAudit = async () => {
    if (!selectedRecordId) return;
    setVerifying(true);
    setResult(null);
    setQrCodeData(null);
    setAuditLogs([]);

    const log = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setAuditLogs((prev) => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    try {
      await log('Connecting to decentralized permissioned blockchain network...', 400);
      await log('Locating cryptographic anchor node block indexes...', 300);
      await log('Querying ledgers for document transaction block hashes...', 500);
      await log('Recalculating local file SHA-256 byte payload checksum...', 400);
      
      const verifyRes = await api.verifyRecord(selectedRecordId);
      
      await log('Comparing local file SHA-256 database checksum with blockchain block hashes...', 500);

      if (verifyRes.success && verifyRes.data) {
        setResult(verifyRes.data);
        if (verifyRes.data.isValid) {
          await log('CRITICAL MATCH: Cryptographic integrity confirmed. Document is untampered.', 300);
        } else {
          await log('WARNING MISMATCH: Blockchain ledger SHA-256 hash does not match current file data! Tampering detected!', 300);
        }
        
        // Fetch verification QR Code
        const qrRes = await api.getQRCode(selectedRecordId);
        if (qrRes.success && qrRes.data) {
          setQrCodeData(qrRes.data);
        }
      } else {
        await log('API ERROR: Connection timed out or node signature verification rejected.', 100);
      }
    } catch (err) {
      console.error(err);
      setAuditLogs((prev) => [...prev, 'ERROR: Chain communication breakdown. Check backend server logs.']);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={[Role.PATIENT]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Audit Form Controls Panel */}
        <div className="glass-card p-6 flex flex-col justify-between h-fit lg:col-span-1">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-teal-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Auditor Configuration
              </h2>
            </div>

            {records.length === 0 ? (
              <p className="text-xs text-slate-400">
                Please upload medical files first to configure ledger auditor checks.
              </p>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Select Record to Audit
                  </label>
                  <select
                    value={selectedRecordId}
                    onChange={(e) => {
                      setSelectedRecordId(e.target.value);
                      setResult(null);
                      setQrCodeData(null);
                      setAuditLogs([]);
                    }}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-350 transition-all font-semibold text-xs"
                  >
                    {records.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                        {r.fileName} ({r.recordType || 'File'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={triggerAudit}
                  disabled={verifying}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                  {verifying ? 'Auditing Hash Chain...' : 'Trigger Integrity Check'}
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest block mb-2">Ledger Mode</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xxs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/25 rounded-md">
              SHA-256 Anchored Proof-Of-Work
            </span>
          </div>
        </div>

        {/* Audit Monitor Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Console Output */}
          <div className="glass-card p-6 bg-slate-900 border-slate-800 dark:bg-slate-950/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2 font-sans">
              <Cpu className="w-4 h-4 text-teal-400" />
              Auditor Node Shell Console
            </h2>

            <div className="h-48 overflow-y-auto font-mono text-xxs text-slate-400 bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-teal-500 shrink-0">&gt;</span>
                  <span className={log.includes('CRITICAL') ? 'text-teal-400 font-bold' : log.includes('WARNING') ? 'text-rose-400 font-bold animate-pulse' : ''}>
                    {log}
                  </span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-slate-600 italic">Select a medical file and press trigger to run hash audits...</div>
              )}
            </div>
          </div>

          {/* Verification Results Panel */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`glass-card p-6 relative overflow-hidden ${
                  result.isValid ? 'border-teal-500/30' : 'border-rose-500/30'
                }`}
              >
                {/* Result header banner */}
                <div className="flex items-center gap-3.5 mb-6">
                  {result.isValid ? (
                    <div className="p-3 bg-teal-500/10 dark:bg-teal-500/20 text-teal-500 rounded-full">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 rounded-full animate-bounce">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-lg font-bold ${result.isValid ? 'text-teal-500' : 'text-rose-500'}`}>
                      {result.isValid ? 'Ledger Match Confirmed' : 'LEDGER DISCREPANCY DETECTED'}
                    </h3>
                    <p className="text-xxs text-slate-400 uppercase tracking-widest mt-1">
                      Audit block index: #{result.blockIndex} • Date: {new Date(result.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Audit details grid hashes comparison */}
                <div className="space-y-4 font-mono text-xxs p-5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wide">Calculated DB Hash</span>
                    <span className="text-slate-350 select-all break-all block mt-1">{result.storedHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wide">Blockchain Immutable Block Hash</span>
                    <span className={`break-all block mt-1 ${result.isValid ? 'text-teal-400 select-all' : 'text-rose-400 font-bold select-all'}`}>
                      {result.blockchainHash}
                    </span>
                  </div>
                </div>

                {/* QR Code and verification links */}
                {qrCodeData && (
                  <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-3 max-w-sm text-center md:text-left">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <QrCode className="w-4 h-4 text-teal-500" />
                        Dynamic QR Verification Badge
                      </h4>
                      <p className="text-xxs text-slate-500 leading-relaxed">
                        Healthcare providers can scan this QR code using a camera device to immediately run a live cryptographic integrity validation on their own browser nodes.
                      </p>
                      <a
                        href={qrCodeData.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xxs font-bold text-teal-500 hover:underline pt-2"
                      >
                        Launch Direct Public Auditor Node
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    {/* SVG QR code drawing */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-900/5 shrink-0">
                      <QRCodeSVG value={qrCodeData.verifyUrl} size={110} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
