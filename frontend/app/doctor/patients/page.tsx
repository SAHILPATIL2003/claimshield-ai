// ============================================================================
// ClaimShield AI - Patient Lookup & Medical Report Reviewer (Doctor view)
// ============================================================================

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Brain,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Plus,
  Lock,
  ExternalLink,
  ShieldAlert,
  User,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function PatientLookupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('id');

  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Note Form
  const [newNote, setNewNote] = useState('');
  const [activeRecordIdForNote, setActiveRecordIdForNote] = useState<string | null>(null);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Verification state mapping
  const [verifyingMap, setVerifyingMap] = useState<Record<string, boolean>>({});
  const [verificationResultMap, setVerificationResultMap] = useState<Record<string, any>>({});
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      router.push('/doctor/dashboard');
      return;
    }

    const loadPatientData = async () => {
      try {
        const res = await api.getPatientRecords(patientId);
        if (res.success && res.data) {
          setPatient(res.data.patient);
          setRecords(res.data.records);
          if (res.data.records.length > 0) {
            setExpandedRecordId(res.data.records[0].id);
          }
        } else {
          setError(res.message || 'Failed to fetch patient records');
        }
      } catch (err) {
        setError('Error establishing connection with patient databases.');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId, router]);

  const verifyRecordIntegrity = async (recordId: string) => {
    setVerifyingMap((prev) => ({ ...prev, [recordId]: true }));
    try {
      const res = await api.verifyRecord(recordId);
      if (res.success && res.data) {
        setVerificationResultMap((prev) => ({ ...prev, [recordId]: res.data }));
      }
    } catch (err) {
      console.error('Integrity audit check failed', err);
    } finally {
      setVerifyingMap((prev) => ({ ...prev, [recordId]: false }));
    }
  };

  const handleAddNote = async (e: React.FormEvent, recordId: string) => {
    e.preventDefault();
    if (!newNote || newNote.trim().length < 5) return;
    
    setSubmittingNote(true);
    try {
      const res = await api.addDoctorNote(recordId, newNote.trim());
      if (res.success && res.data) {
        // Append note directly to record in local UI state
        setRecords((prevRecords) =>
          prevRecords.map((r) => {
            if (r.id === recordId) {
              return {
                ...r,
                doctorNotes: [...(r.doctorNotes || []), res.data],
              };
            }
            return r;
          })
        );
        setNewNote('');
        setActiveRecordIdForNote(null);
      } else {
        alert(res.message || 'Note submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network failure saving notes.');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-teal-500" />
        <p className="text-sm">Fetching patient clinical history...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-center">
        {error || 'Patient files could not be located.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button and profile overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/doctor/dashboard')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xxs font-bold text-teal-500 uppercase tracking-widest block mb-1">Patient Profile</span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <User className="w-6 h-6 text-slate-400" />
              {patient.fullName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xxs bg-slate-900/5 dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl">
          <div>
            <span className="text-slate-400 block">Mobile Number</span>
            <span className="text-slate-700 dark:text-slate-250 font-bold block mt-1">{patient.mobileNumber}</span>
          </div>
          <div className="border-l border-slate-350 dark:border-slate-800 pl-6">
            <span className="text-slate-400 block">Total Records Ledger</span>
            <span className="text-slate-700 dark:text-slate-250 font-bold block mt-1">{records.length} Documents</span>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          This patient has not uploaded any medical documentation yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of files panel */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Report Explorer</h2>
            <div className="space-y-3">
              {records.map((r) => {
                const isActive = expandedRecordId === r.id;
                const isFlagged = r.verificationStatus === 'FLAGGED' || r.fraudScore >= 60;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setExpandedRecordId(r.id);
                      setNewNote('');
                      setActiveRecordIdForNote(null);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-teal-500 text-teal-400 ring-2 ring-teal-500/5'
                        : 'bg-white/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                      <div className="truncate flex-1">
                        <span className="text-xs font-bold block truncate">{r.fileName}</span>
                        <span className="text-xxs text-slate-400 font-semibold block mt-1 truncate">
                          {r.recordType || 'Diagnostic file'}
                        </span>
                      </div>
                      {isFlagged && (
                        <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0 animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Document Reviewer Panel */}
          <div className="lg:col-span-2">
            {records.map((record) => {
              if (record.id !== expandedRecordId) return null;
              
              const verification = verificationResultMap[record.id];
              const isVerifying = verifyingMap[record.id];
              const isFlagged = record.verificationStatus === 'FLAGGED' || record.fraudScore >= 60;

              return (
                <div key={record.id} className="space-y-6">
                  {/* Ledger & Fraud Header warning indicators */}
                  <div className="glass-card p-6 border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="truncate">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm md:max-w-md">
                          {record.fileName}
                        </h2>
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest block mt-1">
                          Record Hash: {record.blockchainHash.substring(0, 24)}...
                        </span>
                      </div>

                      <div className="flex gap-3 shrink-0">
                        {/* Blockchain Verify Trigger */}
                        <button
                          onClick={() => verifyRecordIntegrity(record.id)}
                          disabled={isVerifying}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-350 dark:bg-slate-850 dark:hover:bg-slate-800 text-xxs font-bold text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-slate-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                          {isVerifying ? 'Verifying...' : 'Audit Blockchain'}
                        </button>
                      </div>
                    </div>

                    {/* Fraud Alerts warnings displays */}
                    {isFlagged && (
                      <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
                        <div>
                          <p className="text-xs font-bold">POSSIBLE RECORD TAMPERING FLAGGED</p>
                          <p className="text-xxs opacity-90 mt-0.5">
                            This report has triggered high fraud probability ({record.fraudScore}% score). Perform ledger audits to check for hash integrity.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Audit Results Overlay panel */}
                    <AnimatePresence>
                      {verification && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0 }}
                          className={`mt-4 p-4 rounded-xl border font-mono text-xxs ${
                            verification.isValid 
                              ? 'bg-teal-500/5 dark:bg-teal-500/10 border-teal-500/25 text-teal-600 dark:text-teal-400' 
                              : 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <div className="flex justify-between font-bold mb-2">
                            <span>Blockchain Link Integrity Audit</span>
                            <span>{verification.isValid ? 'MATCH: AUTHENTIC' : 'WARNING: TAMPERED'}</span>
                          </div>
                          <div className="space-y-1 select-all break-all leading-normal">
                            <div>Chain Anchor Index: Block #{verification.blockIndex}</div>
                            <div>File Hash: {verification.storedHash}</div>
                            <div>Ledger Hash: {verification.blockchainHash}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* AI Summary and OCR columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Structured summary */}
                    <div className="glass-card p-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                        <Sparkles className="w-4.5 h-4.5 text-teal-400 animate-pulse" />
                        AI Summary Extracts
                      </h3>
                      {record.aiSummary ? (
                        <div className="text-xs space-y-3.5">
                          <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-semibold italic">
                            “{record.aiSummary.summary}”
                          </p>
                          {record.aiSummary.abnormalities?.length > 0 && (
                            <div>
                              <span className="text-xxs font-bold text-rose-500 uppercase tracking-wider block mb-1">Key Abnormalities</span>
                              <ul className="list-disc pl-4 text-xxs text-slate-650 dark:text-slate-400 space-y-1">
                                {record.aiSummary.abnormalities.map((ab: string, i: number) => (
                                  <li key={i}>{ab}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {record.aiSummary.recommendations?.length > 0 && (
                            <div>
                              <span className="text-xxs font-bold text-teal-500 uppercase tracking-wider block mb-1">Clinical Actions</span>
                              <ul className="list-disc pl-4 text-xxs text-slate-650 dark:text-slate-400 space-y-1">
                                {record.aiSummary.recommendations.map((rc: string, i: number) => (
                                  <li key={i}>{rc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xxs text-slate-500 italic">No summary data found.</p>
                      )}
                    </div>

                    {/* OCR Text block viewer */}
                    <div className="glass-card p-6 flex flex-col h-full">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-800/50 pb-3 mb-4">
                        <Cpu className="w-4.5 h-4.5 text-teal-500" />
                        OCR Raw Text
                      </h3>
                      <div className="flex-1 overflow-y-auto max-h-56 p-4 bg-slate-900 border border-slate-850 dark:bg-slate-950 font-mono text-xxs text-slate-400 rounded-xl leading-relaxed whitespace-pre-wrap select-text">
                        {record.ocrText || 'No OCR extracted text.'}
                      </div>
                    </div>
                  </div>

                  {/* Doctor notes history */}
                  <div className="glass-card p-6">
                    <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4.5 h-4.5 text-teal-500" />
                        Observation Records
                      </h3>
                      {!activeRecordIdForNote && (
                        <button
                          onClick={() => setActiveRecordIdForNote(record.id)}
                          className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-xxs font-bold text-teal-500 dark:text-teal-400 border border-teal-500/20 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Note
                        </button>
                      )}
                    </div>

                    {/* Add note inline editor */}
                    {activeRecordIdForNote === record.id && (
                      <form onSubmit={(e) => handleAddNote(e, record.id)} className="space-y-4 mb-6 p-4 border border-teal-500/20 bg-teal-500/5 dark:bg-teal-500/10 rounded-2xl">
                        <textarea
                          placeholder="Type clinical observations, follow-up instructions, or diagnostic warnings..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-700 dark:text-slate-200"
                          rows={3}
                          required
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRecordIdForNote(null);
                              setNewNote('');
                            }}
                            className="px-3 py-1.5 bg-slate-250 hover:bg-slate-300 dark:bg-slate-850 text-xxs font-semibold rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingNote || newNote.trim().length < 5}
                            className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xxs rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {submittingNote ? 'Saving...' : 'Save Note'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Notes List */}
                    <div className="space-y-4">
                      {record.doctorNotes && record.doctorNotes.length > 0 ? (
                        record.doctorNotes.map((note: any) => (
                          <div key={note.id} className="p-4 bg-slate-900/5 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl flex items-start gap-3">
                            <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                {note.content}
                              </p>
                              <span className="text-xxs font-bold text-slate-400 block mt-2">
                                By: {note.doctor?.fullName || 'Dr. Specialist'} • {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xxs text-slate-400 italic">No notes recorded on this document. Press add observation note above to lock observations.</p>
                      )}
                    </div>
                  </div>

                  {/* Public link preview */}
                  <div className="flex gap-4">
                    <a
                      href={record.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary text-xxs py-2.5 px-4 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      View Patient File
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

export default function PatientLookupPage() {
  return (
    <DashboardLayout allowedRoles={[Role.DOCTOR, Role.ADMIN]}>
      <Suspense fallback={<div>Loading queries...</div>}>
        <PatientLookupContent />
      </Suspense>
    </DashboardLayout>
  );
}
