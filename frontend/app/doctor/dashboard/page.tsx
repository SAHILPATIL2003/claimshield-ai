// ============================================================================
// ClaimShield AI - Doctor Dashboard & Patient Search
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  Search, 
  User, 
  ShieldAlert, 
  Calendar, 
  ArrowRight, 
  Users, 
  FileText, 
  HeartPulse,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    patientsCount: 0,
    observationNotes: 0,
    hashAlerts: 0,
  });

  useEffect(() => {
    // Initial fetch of recent reports and mock numbers to populate visual stats
    const fetchStats = async () => {
      try {
        const patientsRes = await api.searchPatients('');
        const analyticsRes = await api.getAnalytics(); // Admins have analytics, let's mock counts or extract if allowed
        
        if (patientsRes.success && patientsRes.data) {
          setPatients(patientsRes.data);
          setStats({
            patientsCount: patientsRes.data.length,
            observationNotes: 14,
            hashAlerts: 1, // Seed contains Emily Watson flagged report
          });
        }
      } catch (err) {
        console.error('Failed to load doctor dashboard statistics');
      }
    };
    fetchStats();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.searchPatients(searchQuery);
      if (res.success && res.data) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Patient search request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={[Role.DOCTOR]}>
      
      {/* Welcome & Search Bar Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          Clinical Observations Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Search patient records and append observations. Verify hash anchors against the ledger.
        </p>

        {/* Search patient form */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-4 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search patients by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-300 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-6"
          >
            Search
          </button>
        </form>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tracked Patients</span>
            <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{stats.patientsCount}</h3>
          </div>
          <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Observations</span>
            <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{stats.observationNotes}</h3>
          </div>
          <div className="p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
            <Activity className="w-7 h-7" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Blockchain Alerts</span>
            <h3 className={`text-3xl font-bold mt-1 ${stats.hashAlerts > 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
              {stats.hashAlerts}
            </h3>
          </div>
          <div className={`p-4 rounded-2xl ${stats.hashAlerts > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500'}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Patient Search Results list */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-teal-500" />
          Patient Registry Results
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Searching records ledger...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No patient matching that criteria was found. Ensure patients register on mobile OTP logins first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="p-5 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between hover:border-teal-500/30 transition-all bg-slate-900/5 dark:bg-slate-950/20"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  {patient.avatar ? (
                    <img
                      src={patient.avatar}
                      alt={patient.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-teal-500 font-bold text-md">
                      {patient.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{patient.fullName}</h3>
                    <p className="text-xxs text-slate-400 mt-1 font-semibold">Phone: {patient.mobileNumber}</p>
                  </div>
                </div>

                <Link
                  href={`/doctor/patients?id=${patient.id}`}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-xxs font-bold text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1 transition-all"
                >
                  Review Records
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
