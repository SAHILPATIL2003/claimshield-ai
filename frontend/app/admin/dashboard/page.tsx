// ============================================================================
// ClaimShield AI - Admin Analytics Dashboard
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import {
  Users,
  FileText,
  DollarSign,
  Link as ChainIcon,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  Building,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.getAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics data');
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-900/40 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-80 bg-slate-200 dark:bg-slate-900/40 rounded-2xl lg:col-span-2" />
            <div className="h-80 bg-slate-200 dark:bg-slate-900/40 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{data.stats.totalUsers}</h3>
                <span className="text-xxs text-teal-500 font-semibold block mt-1">Registry Active</span>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                <Users className="w-7 h-7" />
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Medical Reports</span>
                <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{data.stats.totalRecords}</h3>
                <span className="text-xxs text-teal-500 font-semibold block mt-1">Immutable Files</span>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                <FileText className="w-7 h-7" />
              </div>
            </div>

            {/* Stat 3 */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Claims Audits</span>
                <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{data.stats.totalClaims}</h3>
                <span className="text-xxs text-teal-500 font-semibold block mt-1">{data.stats.pendingClaims} Pending Reviews</span>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>

            {/* Stat 4 */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Blockchain Blocks</span>
                <h3 className="text-3xl font-bold mt-1 text-teal-600 dark:text-teal-400">{data.stats.totalBlockchainBlocks}</h3>
                <span className="text-xxs text-rose-500 font-semibold block mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-500" />
                  {data.stats.fraudAlerts} High-Risk Flags
                </span>
              </div>
              <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                <ChainIcon className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart 1: Monthly records */}
            <div className="glass-card p-6 lg:col-span-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-teal-500" />
                Ledger Registration Frequency (Monthly)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.recordsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="url(#colorTeal)" radius={[4, 4, 0, 0]}>
                      <defs>
                        <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0891b2" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Fraud distribution */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                  Claim Risk Distribution
                </h3>
                <div className="h-52 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.fraudScoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {data.fraudScoreDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex justify-around text-xxs font-semibold text-slate-400 mt-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-500 rounded" />Low</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded" />Medium</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded" />High</span>
              </div>
            </div>
          </div>

          {/* Recent Activity logs */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-teal-500" />
                Immutable System Audit Logs
              </h3>
              <Link href="/admin/logs" className="text-xxs font-bold text-teal-500 hover:underline flex items-center gap-1">
                View Full Audit Trails <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {data.recentActivity.slice(0, 5).map((log: any) => (
                <div key={log.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div className="flex items-start gap-3 truncate">
                    <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</p>
                      <p className="text-xxs text-slate-500 truncate max-w-lg mt-0.5">{log.details}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3 font-mono text-xxs text-slate-400">
                    <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-teal-400 rounded-md uppercase font-bold tracking-wide">
                      {log.user?.fullName || 'SYSTEM'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
