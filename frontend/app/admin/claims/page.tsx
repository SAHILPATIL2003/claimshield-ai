// ============================================================================
// ClaimShield AI - Admin Insurance Claims Audit Panel
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import {
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Activity,
  Edit,
  Check,
  X,
  ShieldAlert,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClaimsAuditPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Auditing review states
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED' | 'FLAGGED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Verification state mappings
  const [verifyingRecordId, setVerifyingRecordId] = useState<string | null>(null);
  const [recordVerifyResult, setRecordVerifyResult] = useState<any>(null);

  const loadClaimsData = async () => {
    setLoading(true);
    try {
      const res = await api.getClaims();
      if (res.success && res.data) {
        setClaims(res.data);
      }
    } catch (err) {
      setError('Connection failed. Database query error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaimsData();
  }, []);

  const selectClaimForReview = (claim: any) => {
    setActiveClaimId(claim.id);
    setReviewStatus(claim.verificationStatus === 'PENDING' ? 'APPROVED' : claim.verificationStatus);
    setReviewNotes(claim.notes || '');
    setRecordVerifyResult(null);
  };

  const handleVerifyAttachedRecord = async (recordId: string) => {
    setVerifyingRecordId(recordId);
    setRecordVerifyResult(null);
    try {
      const res = await api.verifyRecord(recordId);
      if (res.success && res.data) {
        setRecordVerifyResult(res.data);
      }
    } catch (err) {
      console.error('Failed to run verification on record attached to claim');
    } finally {
      setVerifyingRecordId(null);
    }
  };

  const submitClaimAudit = async (e: React.FormEvent, claimId: string) => {
    e.preventDefault();
    if (!reviewNotes || reviewNotes.trim().length < 5) return;
    
    setSubmittingReview(true);
    try {
      const res = await api.updateClaim(claimId, reviewStatus, reviewNotes.trim());
      if (res.success) {
        setActiveClaimId(null);
        setReviewNotes('');
        loadClaimsData();
      } else {
        setError(res.message || 'Failed to submit claim review decision');
      }
    } catch (err) {
      setError('Network communication failure.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'FLAGGED':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300/20';
    }
  };

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Claims listings table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-teal-400" />
              Insurance Payout Auditor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Review submitted billing claims. Verify records hash matches against immutable ledgers prior to payout release authorization.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 animate-pulse">
              <Loader className="w-8 h-8 animate-spin mb-4 text-teal-500" />
              <p className="text-sm">Querying pending insurance billing ledger...</p>
            </div>
          ) : claims.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-12">No claims filed in current databases.</p>
          ) : (
            <div className="glass-card p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xxs font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3">Policy & Insurer</th>
                    <th className="pb-3">Beneficiary</th>
                    <th className="pb-3">Amount Billed</th>
                    <th className="pb-3">Risk Score</th>
                    <th className="pb-3">Verification</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                  {claims.map((c) => {
                    const isFlagged = c.fraudScore >= 60 || c.verificationStatus === 'FLAGGED';
                    return (
                      <tr key={c.id} className="hover:bg-slate-500/5 transition-colors">
                        
                        {/* Policy */}
                        <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">
                          <span className="block">{c.policyNumber}</span>
                          <span className="text-xxs text-slate-405 mt-0.5 block font-normal">{c.insurerName}</span>
                        </td>

                        {/* Beneficiary */}
                        <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                          {c.patient?.fullName}
                        </td>

                        {/* Amount */}
                        <td className="py-4 font-bold text-slate-800 dark:text-slate-200">
                          ${c.claimAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Risk Score */}
                        <td className="py-4 font-bold">
                          <span className={isFlagged ? 'text-rose-500 animate-pulse' : 'text-teal-400'}>
                            {c.fraudScore}%
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4">
                          <span className={`px-2 py-0.5 text-xxs font-bold border rounded uppercase tracking-wide ${getStatusBadge(c.verificationStatus)}`}>
                            {c.verificationStatus}
                          </span>
                        </td>

                        {/* Review trigger */}
                        <td className="py-4 text-right">
                          <button
                            onClick={() => selectClaimForReview(c)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Auditing review options forms */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {activeClaimId ? (
              claims.map((claim) => {
                if (claim.id !== activeClaimId) return null;
                const recordAttached = claim.record;
                
                return (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass-card p-6 space-y-6 h-fit"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Review Claim: {claim.policyNumber}
                      </h3>
                      <span className="text-xxs text-slate-400 font-mono block mt-1">Claim ID: {claim.id}</span>
                    </div>

                    {/* Check File Integrity controls */}
                    {recordAttached && (
                      <div className="p-4 bg-slate-900/5 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3.5">
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest block">Attached Medical File</span>
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4.5 h-4.5 text-teal-400 shrink-0" />
                          <span className="text-xxs font-bold text-slate-750 dark:text-slate-250 truncate">{recordAttached.fileName}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleVerifyAttachedRecord(claim.recordId)}
                          disabled={verifyingRecordId !== null}
                          className="w-full py-2 bg-slate-250 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-xxs font-bold text-slate-700 dark:text-slate-350 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-300/40 dark:border-slate-800"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${verifyingRecordId !== null ? 'animate-spin' : ''}`} />
                          Verify attached report integrity
                        </button>

                        {/* Output validation details */}
                        {recordVerifyResult && (
                          <div className={`p-3 rounded-lg border font-mono text-xxs leading-normal ${
                            recordVerifyResult.isValid 
                              ? 'bg-teal-500/10 border-teal-500/20 text-teal-500' 
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse'
                          }`}>
                            <div className="font-bold flex items-center gap-1">
                              {recordVerifyResult.isValid ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                              Ledger Result: {recordVerifyResult.isValid ? 'MATCH' : 'MISMATCH WARNING'}
                            </div>
                            <div className="mt-1 truncate select-all">Blockchain Hash: {recordVerifyResult.blockchainHash}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audit Form */}
                    <form onSubmit={(e) => submitClaimAudit(e, claim.id)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Decision Status
                        </label>
                        <select
                          value={reviewStatus}
                          onChange={(e) => setReviewStatus(e.target.value as any)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-300 font-semibold text-xs"
                        >
                          <option value="APPROVED">APPROVE PAYOUT</option>
                          <option value="REJECTED">REJECT PAYOUT</option>
                          <option value="FLAGGED">FLAG SUSPICIOUS</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Review Remarks (audit trail)
                        </label>
                        <textarea
                          placeholder="Provide detailed justification remarks for this status adjustment decision..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-750 dark:text-slate-200"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveClaimId(null)}
                          className="w-1/3 py-3 bg-slate-250 hover:bg-slate-350 dark:bg-slate-850 text-xxs font-bold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReview || reviewNotes.trim().length < 5}
                          className="w-2/3 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xxs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {submittingReview ? 'Submitting...' : 'Lock Decision'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                );
              })
            ) : (
              <div className="glass-card p-6 text-center text-slate-400 text-xxs italic">
                Select an insurance billing line to trigger the decision auditing panel.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </DashboardLayout>
  );
}
