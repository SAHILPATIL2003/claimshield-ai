// ============================================================================
// ClaimShield AI - Patient Dashboard Overview Page
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/Layout';
import { useAppStore, Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import {
  FileText,
  ShieldCheck,
  Activity,
  Upload,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Link2,
  Calendar,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PatientDashboard() {
  const { user } = useAppStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    flagged: 0,
  });

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const res = await api.getMyRecords();
        if (res.success && res.data) {
          const recordsList = res.data;
          setRecords(recordsList);

          // Calculate stats
          const total = recordsList.length;
          const verified = recordsList.filter((r: any) => r.verificationStatus === 'VERIFIED').length;
          const flagged = recordsList.filter((r: any) => r.verificationStatus === 'FLAGGED').length;
          setStats({ total, verified, flagged });
        }
      } catch (err) {
        console.error('Failed to load patient records', err);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  return (
    <DashboardLayout allowedRoles={[Role.PATIENT]}>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-slate-900/5 border border-teal-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-white">
            Welcome back, {user?.fullName || 'Patient'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl text-sm">
            Your healthcare records are cryptographically secured using SHA-256 hashes anchored to our permissioned ledger block.
          </p>
        </div>
        <Link
          href="/patient/upload"
          className="btn-primary hover:scale-105 active:scale-95 transition-all text-sm shrink-0 whitespace-nowrap"
        >
          <Upload className="w-4.5 h-4.5" />
          Upload New Report
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-900/40 rounded-2xl border border-slate-350 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stat 1 */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Uploads</span>
                <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{stats.total}</h3>
                <span className="text-xxs text-slate-400 mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-500" />
                  All reports are immutable
                </span>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                <FileText className="w-7 h-7" />
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ledger Verified</span>
                <h3 className="text-3xl font-bold mt-1 text-teal-600 dark:text-teal-400">{stats.verified}</h3>
                <span className="text-xxs text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                  100% integrity validation
                </span>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>

            {/* Stat 3 */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Anomalies</span>
                <h3 className={`text-3xl font-bold mt-1 ${stats.flagged > 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
                  {stats.flagged}
                </h3>
                <span className="text-xxs text-slate-400 mt-1 flex items-center gap-1">
                  <AlertCircle className={`w-3.5 h-3.5 ${stats.flagged > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                  Requires manual claim audit
                </span>
              </div>
              <div className={`p-4 rounded-2xl ${stats.flagged > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500'}`}>
                <AlertCircle className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Uploads Table */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-500" />
                  Recent Medical Records
                </h2>
                <Link href="/patient/timeline" className="text-xxs font-bold text-teal-500 hover:underline flex items-center gap-1">
                  View Timeline <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No records uploaded yet. Click upload to protect your first medical document.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xxs font-bold text-slate-400 uppercase tracking-widest">
                        <th className="pb-3">Filename</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Uploaded On</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                      {records.slice(0, 5).map((record) => (
                        <tr key={record.id} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-4 font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                            {record.fileName}
                          </td>
                          <td className="py-4 text-slate-500 dark:text-slate-400">{record.recordType || 'Medical Scan'}</td>
                          <td className="py-4 text-slate-500 dark:text-slate-400">
                            {new Date(record.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-4">
                            {record.verificationStatus === 'VERIFIED' ? (
                              <span className="badge-blockchain">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Secured
                              </span>
                            ) : (
                              <span className="badge-fraud">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Flagged
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Blockchain Node Widget */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="w-5 h-5 text-teal-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    Blockchain Anchoring
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Your record is mapped into a block with its cryptographically secured SHA-256 hash. Once locked inside the ledger, it can never be altered or removed.
                </p>

                {records.length > 0 && records[0].txId ? (
                  <div className="p-4 bg-slate-900/60 dark:bg-slate-950/60 rounded-2xl border border-slate-800 text-xxs font-mono space-y-3.5">
                    <div>
                      <span className="text-slate-500 font-bold block uppercase tracking-wide">Last Transaction ID</span>
                      <span className="text-teal-400 truncate block mt-1 select-all">{records[0].txId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase tracking-wide">Ledger Hash Block</span>
                      <span className="text-slate-300 truncate block mt-1 select-all">{records[0].blockchainHash}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900/40 rounded-2xl text-center text-xs text-slate-500 border border-slate-800">
                    Ledger waiting for record upload...
                  </div>
                )}
              </div>

              <Link
                href="/patient/verification"
                className="mt-6 w-full py-3 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                Launch Integrity Auditor
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
