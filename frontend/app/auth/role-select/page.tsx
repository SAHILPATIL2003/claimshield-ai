// ============================================================================
// ClaimShield AI - First-time Login Role Configuration Page
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { ShieldAlert, HeartPulse, User, Stethoscope, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleSelectPage() {
  const router = useRouter();
  const { user, token, setUser } = useAppStore();

  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role.PATIENT | Role.DOCTOR>(Role.PATIENT);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if they aren't authenticated
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    // Fetch hospitals for doctor options
    const fetchHospitals = async () => {
      try {
        const res = await api.getPublicHospitals();
        if (res.success && res.data) {
          setHospitals(res.data);
          if (res.data.length > 0) {
            setSelectedHospital(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load hospitals list');
      }
    };
    fetchHospitals();
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || fullName.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.setRole(
        selectedRole,
        fullName,
        selectedRole === Role.DOCTOR ? selectedHospital : undefined
      );

      if (res.success && res.data) {
        const { user: updatedUser } = res.data;
        setUser(updatedUser);

        // Send to respective dashboard
        if (updatedUser.role === Role.PATIENT) router.push('/patient/dashboard');
        else if (updatedUser.role === Role.DOCTOR) router.push('/doctor/dashboard');
      } else {
        setError(res.message || 'Configuration setup failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md p-6 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl mb-4">
            <ShieldAlert className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Configure Your Account
          </h2>
          <p className="mt-2 text-sm text-slate-400 text-center">
            Define your name and system role to establish cryptographic identity.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl"
        >
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-600 transition-all font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Select System Access Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.PATIENT)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                    selectedRole === Role.PATIENT
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <User className="w-8 h-8" />
                  <span className="text-xs font-bold">PATIENT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.DOCTOR)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                    selectedRole === Role.DOCTOR
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Stethoscope className="w-8 h-8" />
                  <span className="text-xs font-bold">DOCTOR</span>
                </button>
              </div>
            </div>

            {selectedRole === Role.DOCTOR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 overflow-hidden"
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Hospital Provider Registry
                </label>
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 transition-all font-semibold"
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id} className="bg-slate-900 text-slate-100">
                      {h.name}
                    </option>
                  ))}
                  {hospitals.length === 0 && (
                    <option value="">No hospitals registered. Contact Admin.</option>
                  )}
                </select>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl text-slate-950 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              {loading ? 'Configuring Account...' : 'Finalize Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
