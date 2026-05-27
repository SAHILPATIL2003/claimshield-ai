// ============================================================================
// ClaimShield AI - Admin Immutable Audit Logs Timeline
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  FileCode, 
  Clock, 
  Cpu, 
  Activity, 
  Terminal,
  User,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getAuditLogs();
        if (res.success && res.data) {
          setLogs(res.data);
          setFilteredLogs(res.data);
        }
      } catch (err) {
        console.error('Failed to load system logs data');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = logs;

    // Filter by search terms
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          (log.action && log.action.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.user?.fullName && log.user.fullName.toLowerCase().includes(q))
      );
    }

    // Filter by action
    if (actionFilter !== 'ALL') {
      result = result.filter((log) => log.action === actionFilter);
    }

    setFilteredLogs(result);
  }, [searchQuery, actionFilter, logs]);

  // Derive unique actions for filters
  const uniqueActions = ['ALL', ...Array.from(new Set(logs.map((l) => l.action)))];

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FileCode className="w-7 h-7 text-teal-400" />
              Immutable Audit Trails
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Review history log actions triggered across our servers. Every action maps back to user sessions.
            </p>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xxs font-bold text-teal-605 dark:text-teal-400 bg-teal-500/10 border border-teal-500/25 rounded-lg select-none">
            <ShieldCheck className="w-3.5 h-3.5" />
            Auditing Compliant Mode
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions or logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-xs text-slate-700 dark:text-slate-350"
            />
          </div>

          {/* Action Filter dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-455" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-350"
            >
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline block logs */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-900/40 rounded-xl" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="text-slate-500 text-center py-12">No matching logs found in current audit records.</p>
        ) : (
          <div className="glass-card p-6 bg-slate-900 border-slate-850 dark:bg-slate-950/80">
            <h2 className="text-xxs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              Security Shell Trace Console
            </h2>

            <div className="divide-y divide-slate-850 space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="pt-4 flex flex-col md:flex-row justify-between md:items-center gap-4 text-xxs font-mono">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-400 font-bold">&gt;</span>
                      <span className="text-slate-200 font-extrabold uppercase tracking-wide bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {log.action}
                      </span>
                      <span className="text-slate-550">•</span>
                      <span className="text-slate-400 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-350 leading-relaxed pl-4 font-sans text-xs">
                      {log.details}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-4 pl-4 md:pl-0 text-slate-500 font-bold">
                    <span className="flex items-center gap-1 select-all">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {log.user?.fullName || 'SYSTEM'}
                    </span>
                    <span className="border-l border-slate-800 pl-4 block select-all">IP: {log.ipAddress || '127.0.0.1'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
