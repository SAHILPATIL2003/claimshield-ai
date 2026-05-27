// ============================================================================
// ClaimShield AI - Patient Medical Timeline Page
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import {
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  Eye,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedicalTimelinePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const res = await api.getMyRecords();
        if (res.success && res.data) {
          // Sort by date descending
          setRecords(res.data);
        }
      } catch (err) {
        console.error('Failed to load timeline records', err);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout allowedRoles={[Role.PATIENT]}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Medical History Timeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Chronological overview of all uploaded medical records and clinical doctor notes anchored to the ledger.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-900/40 rounded-2xl border border-slate-350 dark:border-slate-800" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-sm">
            No medical documents recorded on your timeline. Upload a file to populate your clinical history.
          </div>
        ) : (
          <div className="relative border-l border-slate-350 dark:border-slate-850 ml-4 md:ml-6 space-y-8 py-4">
            {records.map((record, index) => {
              const isExpanded = expandedId === record.id;
              const isVerified = record.verificationStatus === 'VERIFIED';
              const recordDate = new Date(record.createdAt);

              return (
                <div key={record.id} className="relative pl-8 md:pl-10">
                  {/* Timeline Dot Indicator */}
                  <div className={`absolute left-0 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                    isVerified 
                      ? 'bg-slate-50 dark:bg-slate-950 border-teal-500/30 dark:border-teal-500/20 text-teal-500' 
                      : 'bg-rose-500/10 border-rose-500 text-rose-500'
                  }`}>
                    {isVerified ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4 animate-pulse" />}
                  </div>

                  {/* Date Badge */}
                  <span className="inline-flex items-center gap-1 text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                    <Calendar className="w-3 h-3" />
                    {recordDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  {/* Record Node Card */}
                  <motion.div
                    layout="position"
                    className={`glass-card p-5 cursor-pointer hover:border-teal-500/20 dark:hover:border-teal-500/10 ${
                      isExpanded ? 'border-teal-500/35 dark:border-teal-500/25 ring-2 ring-teal-500/5' : ''
                    }`}
                    onClick={() => toggleExpand(record.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="w-6 h-6 text-teal-500 shrink-0" />
                        <div className="truncate">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[250px] md:max-w-md">
                            {record.fileName}
                          </h3>
                          <p className="text-xxs text-slate-400 font-semibold mt-1">
                            Type: {record.recordType || 'Diagnostic Scan'} • Size: {(record.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Desktop Verification Badge */}
                        <span className="hidden sm:inline-flex">
                          {isVerified ? (
                            <span className="badge-blockchain">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Ledger Locked
                            </span>
                          ) : (
                            <span className="badge-fraud">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Flagged
                            </span>
                          )}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Collapsible expanded information details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-6"
                          onClick={(e) => e.stopPropagation()} // Prevent clicking parent expand toggle
                        >
                          {/* AI Generated Medical Summary */}
                          {record.aiSummary ? (
                            <div className="p-4 bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/10 rounded-2xl">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wide">
                                <Sparkles className="w-4.5 h-4.5" />
                                AI Clinical Summary
                              </div>
                              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                {record.aiSummary.summary}
                              </p>
                              {record.aiSummary.abnormalities?.length > 0 && (
                                <div className="mt-3.5">
                                  <span className="text-xxs font-bold text-rose-500 uppercase tracking-wide block mb-1">Extracted Abnormalities</span>
                                  <ul className="list-disc pl-4 text-xxs text-rose-600 dark:text-rose-400 space-y-1">
                                    {record.aiSummary.abnormalities.map((ab: string, i: number) => (
                                      <li key={i}>{ab}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xxs text-slate-500 italic">No AI medical summary available for this file format.</div>
                          )}

                          {/* Doctor Clinical Notes */}
                          {record.doctorNotes && record.doctorNotes.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-teal-500" />
                                Doctor Observations
                              </h4>
                              {record.doctorNotes.map((dn: any) => (
                                <div key={dn.id} className="p-4 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                                  <p className="text-xs text-slate-600 dark:text-slate-350 italic">
                                    “{dn.content}”
                                  </p>
                                  <span className="text-xxs font-bold text-slate-400 block mt-2">
                                    — {dn.doctor?.fullName || 'Medical Specialist'} • {new Date(dn.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 rounded-xl text-xxs text-slate-400 italic">
                              No medical professional notes appended to this file. Doctors can append observations under lookup views.
                            </div>
                          )}

                          {/* Blockchain verification metadata */}
                          <div className="p-4 bg-slate-900/60 dark:bg-slate-950/60 border border-slate-850 rounded-2xl font-mono text-xxs space-y-3">
                            <h4 className="font-bold text-teal-400 uppercase tracking-wider text-xxs pb-1 border-b border-slate-800 flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4" />
                              Blockchain Ledger Block
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              <div>
                                <span className="text-slate-500 block uppercase tracking-wide">SHA-256 Checksum</span>
                                <span className="text-slate-300 truncate select-all block mt-0.5">{record.blockchainHash}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block uppercase tracking-wide">Transaction ID (TxId)</span>
                                <span className="text-teal-400 truncate select-all block mt-0.5">{record.txId || 'PENDING_COMMIT'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Links */}
                          <div className="flex gap-4">
                            <a
                              href={record.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary text-xxs py-2.5 px-4 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              View Original File
                            </a>
                            <a
                              href={record.fileUrl}
                              download
                              className="btn-secondary text-xxs py-2.5 px-4 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              Download Copy
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
