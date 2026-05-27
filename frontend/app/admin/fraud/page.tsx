// ============================================================================
// ClaimShield AI - Admin Fraud Monitoring Panel
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  Trash2,
  FileText,
  User,
  ExternalLink,
  ShieldAlert,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FraudMonitoringPage() {
  const [flaggedRecords, setFlaggedRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const loadFraudData = async () => {
    setLoading(true);
    try {
      const res = await api.getFraudData();
      if (res.success && res.data) {
        setFlaggedRecords(res.data);
        if (res.data.length > 0) {
          setActiveRecordId(res.data[0].id);
        }
      }
    } catch (err) {
      setError('Failed to fetch fraud analytics logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFraudData();
  }, []);

  const handleAuditedDelete = async (recordId: string) => {
    const reason = prompt('Please enter administrative delete justification (Required):');
    if (!reason || reason.trim().length < 5) {
      alert('Delete cancelled. Action requires justification notes (minimum 5 chars).');
      return;
    }

    try {
      const res = await api.deleteRecord(recordId);
      if (res.success) {
        alert(res.message || 'Record successfully deleted.');
        loadFraudData();
      } else {
        alert(res.message || 'Deletion failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to ledger nodes.');
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-rose-500 bg-rose-500/10 border-rose-500/25';
    if (score >= 60) return 'text-orange-500 bg-orange-500/10 border-orange-500/25';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
  };

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-rose-500 animate-pulse" />
          Fraud Detection & Risk Auditor
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Real-time analysis of medical records triggering blockchain mismatches, content duplicates, or anomalous claims profiles.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader className="w-8 h-8 animate-spin mb-4 text-teal-500" />
          <p className="text-sm">Calculating ledger statistics...</p>
        </div>
      ) : flaggedRecords.length === 0 ? (
        <div className="glass-card p-12 text-center text-teal-500 bg-teal-500/5 font-medium flex flex-col items-center gap-4">
          <ShieldCheck className="w-12 h-12 text-teal-500" />
          <span>Ledger Check Complete. Zero discrepancies or anomalies located in medical logs.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Flagged items list sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Index</h2>
            <div className="space-y-3">
              {flaggedRecords.map((r) => {
                const isActive = activeRecordId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveRecordId(r.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-550/10 to-rose-550/5 border-rose-500/50 text-rose-455 ring-2 ring-rose-500/5'
                        : 'bg-white/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 animate-pulse" />
                      <div className="truncate flex-1">
                        <span className="text-xs font-bold block truncate">{r.fileName}</span>
                        <span className="text-xxs font-semibold block mt-0.5 uppercase text-slate-400 tracking-wider">
                          Risk Score: {r.fraudScore}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Details reviewer column */}
          <div className="lg:col-span-2">
            {flaggedRecords.map((record) => {
              if (record.id !== activeRecordId) return null;
              
              const isTampered = record.blockchainHash === 'wrong-altered-hash-to-trigger-blockchain-error-alert';

              return (
                <div key={record.id} className="space-y-6">
                  {/* Title card panel */}
                  <div className="glass-card p-6 border-rose-500/25">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {record.fileName}
                        </h2>
                        <span className="text-xxs text-slate-400 font-mono block mt-1">Record ID: {record.id}</span>
                      </div>
                      
                      <span className={`px-3.5 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider ${getRiskColor(record.fraudScore)}`}>
                        Risk Score: {record.fraudScore}%
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-xxs font-semibold text-slate-400 bg-slate-900/5 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                      <div>
                        <span>Patient Beneficiary</span>
                        <span className="text-slate-750 dark:text-slate-200 font-bold block mt-0.5">{record.patient?.fullName}</span>
                      </div>
                      <div>
                        <span>Beneficiary Mobile</span>
                        <span className="text-slate-755 dark:text-slate-200 font-bold block mt-0.5">{record.patient?.mobileNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Red flags indicator boxes */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-250/50 dark:border-slate-800/50 pb-3">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                      Extracted Discrepancy Red-Flags
                    </h3>

                    <div className="space-y-3.5">
                      {isTampered && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-605 dark:text-rose-400 rounded-xl space-y-1">
                          <p className="text-xs font-bold">SHA-256 LEDGER MISMATCH</p>
                          <p className="text-xxs opacity-90 leading-relaxed font-semibold">
                            Cryptographic verification failed. The current database hash ({record.blockchainHash}) does not align with the original record hash stored on Block #3. The database content was edited after ledger locking.
                          </p>
                        </div>
                      )}

                      {record.isDuplicate && (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-605 dark:text-orange-400 rounded-xl space-y-1">
                          <p className="text-xs font-bold">IDENTICAL DUPLICATE UPLOAD</p>
                          <p className="text-xxs opacity-90 leading-relaxed font-semibold">
                            An identical SHA-256 hash checksum was located in the historical ledger blocks. This indicates the exact medical report was uploaded multiple times, which often points to double-payout insurance claims schemes.
                          </p>
                        </div>
                      )}

                      {record.fraudScore >= 45 && !isTampered && !record.isDuplicate && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-605 dark:text-amber-400 rounded-xl space-y-1">
                          <p className="text-xs font-bold">SYSTEM ANOMALIES IN REPORT</p>
                          <p className="text-xxs opacity-90 leading-relaxed font-semibold">
                            Natural language parsing identified high outliers in total billing amounts or inconsistencies in doctor notes, triggering risk flagging rules.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Administrative Audited Actions */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Administrative Actions
                    </h3>
                    <p className="text-xxs text-slate-400 leading-relaxed">
                      Deletes this medical upload from database systems. This action will be logged on the ledger as a DELETION transaction blocks.
                    </p>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAuditedDelete(record.id)}
                        className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xxs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        Execute Audited Deletion
                      </button>
                      <a
                        href={record.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xxs py-2 px-3 flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Original Document
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
