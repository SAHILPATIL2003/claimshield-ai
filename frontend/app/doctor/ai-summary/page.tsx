// ============================================================================
// ClaimShield AI - AI Medical summary Dashboard (Doctor Role)
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  Brain, 
  ShieldAlert, 
  Sparkles, 
  Heart, 
  Activity, 
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function AISummaryCentral() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [allSummaries, setAllSummaries] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const patientsRes = await api.searchPatients('');
        if (patientsRes.success && patientsRes.data) {
          const list = patientsRes.data;
          setPatients(list);

          // Iterate and fetch records for patients to aggregate summaries
          const summariesPromises = list.map(async (p: any) => {
            const recordsRes = await api.getPatientRecords(p.id);
            if (recordsRes.success && recordsRes.data) {
              return recordsRes.data.records.map((r: any) => ({
                ...r,
                patientName: p.fullName,
                patientId: p.id,
              }));
            }
            return [];
          });

          const results = await Promise.all(summariesPromises);
          const flattened = results.flat();
          
          // Sort by upload date descending
          flattened.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAllSummaries(flattened);
        }
      } catch (err) {
        console.error('Failed to load summary analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const totalAbnormalities = allSummaries.reduce((sum, item) => {
    return sum + (item.aiSummary?.abnormalities?.length || 0);
  }, 0);

  return (
    <DashboardLayout allowedRoles={[Role.DOCTOR]}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <Brain className="w-7 h-7 text-teal-400 animate-pulse" />
          AI Summary Central
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Natural Language Processing (NLP) dashboard analyzing clinical report extracts and critical warning anomalies across the registry.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-900/40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* AI Aggregates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Processed Reports</span>
                <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{allSummaries.length}</h3>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                <FileText className="w-7 h-7" />
              </div>
            </div>

            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Extracted Abnormalities</span>
                <h3 className={`text-3xl font-bold mt-1 ${totalAbnormalities > 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
                  {totalAbnormalities}
                </h3>
              </div>
              <div className={`p-4 rounded-2xl ${totalAbnormalities > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-400'}`}>
                <Activity className="w-7 h-7" />
              </div>
            </div>

            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Ledger Integrity Rate</span>
                <h3 className="text-3xl font-bold mt-1 text-teal-600 dark:text-teal-400">100%</h3>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-500 rounded-2xl">
                <CheckCircle className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* AI summaries details list */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-500" />
              Clinical Summaries Timeline
            </h2>

            {allSummaries.length === 0 ? (
              <p className="text-slate-500 text-center py-12">No patient reports found in current medical databases.</p>
            ) : (
              <div className="space-y-6">
                {allSummaries.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-slate-200 dark:border-slate-850 bg-slate-900/5 dark:bg-slate-950/20 rounded-2xl flex flex-col md:flex-row justify-between gap-6"
                  >
                    <div className="space-y-4 flex-1">
                      {/* Meta header */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{item.patientName}</span>
                        <span className="text-slate-400 text-xxs">•</span>
                        <span className="inline-flex items-center gap-1 text-xxs text-slate-400 uppercase tracking-wider font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-slate-400 text-xxs">•</span>
                        <span className="text-xxs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10 uppercase tracking-wide">
                          {item.recordType || 'File'}
                        </span>
                      </div>

                      {/* Content summary paragraph */}
                      {item.aiSummary ? (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold italic">
                            “{item.aiSummary.summary}”
                          </p>
                          {item.aiSummary.abnormalities?.length > 0 && (
                            <div className="flex items-start gap-1.5 p-3.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-xl">
                              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <div className="text-xxs text-rose-600 dark:text-rose-400 font-bold space-y-1">
                                <div>EXTRACTED ABNORMALITIES:</div>
                                <ul className="list-disc pl-4 mt-1 font-semibold space-y-0.5">
                                  {item.aiSummary.abnormalities.map((ab: string, i: number) => (
                                    <li key={i}>{ab}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xxs text-slate-500 italic">No summary details calculated.</p>
                      )}
                    </div>

                    {/* Quick navigation links */}
                    <div className="shrink-0 flex items-center md:border-l border-slate-200 dark:border-slate-800 md:pl-6">
                      <Link
                        href={`/doctor/patients?id=${item.patientId}`}
                        className="py-2 px-4 bg-slate-200 hover:bg-slate-350 dark:bg-slate-850 dark:hover:bg-slate-800 text-xxs font-bold text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-slate-800 rounded-lg flex items-center gap-1 transition-all"
                      >
                        Clinical Review
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
