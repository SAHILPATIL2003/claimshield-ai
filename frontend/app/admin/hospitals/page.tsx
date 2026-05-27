// ============================================================================
// ClaimShield AI - Admin Hospital Provider Registry Panel
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  Building, 
  Plus, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HospitalManagementPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [adminId, setAdminId] = useState('');
  const [creating, setCreating] = useState(false);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.getHospitals();
      if (res.success && res.data) {
        setHospitals(res.data);
      }
    } catch (err) {
      setError('Connection failed. Database query error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length === 0) return;
    
    setCreating(true);
    setError('');
    try {
      const res = await api.createHospital({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        adminId: adminId.trim() || undefined,
      });

      if (res.success) {
        setName('');
        setAddress('');
        setPhone('');
        setEmail('');
        setAdminId('');
        loadHospitals();
      } else {
        setError(res.message || 'Hospital registration failed.');
      }
    } catch (err) {
      setError('Network communication failure.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Hospital listings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Building className="w-7 h-7 text-teal-400" />
              Hospital Providers Registry
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Manage profiles and assign system administrations for registered clinics and hospital providers.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-slate-200 dark:bg-slate-900/40 rounded-2xl" />
              ))}
            </div>
          ) : hospitals.length === 0 ? (
            <p className="text-slate-450 text-sm italic text-center py-12">No hospitals registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hospitals.map((h) => (
                <div key={h.id} className="glass-card p-5 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                    <div className="p-2 bg-teal-500/10 text-teal-555 dark:text-teal-400 rounded-xl">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">{h.name}</h3>
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                        Admin: {h.admin?.fullName || 'Not assigned'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xxs font-semibold text-slate-650 dark:text-slate-405">
                    {h.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-500" />
                        <span className="truncate">{h.address}</span>
                      </div>
                    )}
                    {h.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-teal-500" />
                        <span>{h.phone}</span>
                      </div>
                    )}
                    {h.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-teal-500" />
                        <span className="truncate">{h.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add hospital form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-teal-500" />
              Register New Hospital
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold text-slate-400">
              <div>
                <label className="block text-xxs uppercase tracking-wider mb-2 font-bold">Hospital Name</label>
                <input
                  type="text"
                  placeholder="Sacred Heart Multispecialty"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-350"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs uppercase tracking-wider mb-2 font-bold">Street Address</label>
                <input
                  type="text"
                  placeholder="104 Park Avenue, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs uppercase tracking-wider mb-2 font-bold">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 012"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-350"
                  />
                </div>
                <div>
                  <label className="block text-xxs uppercase tracking-wider mb-2 font-bold">Official Email</label>
                  <input
                    type="email"
                    placeholder="admin@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating || !name}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              >
                Create Profile
              </button>
            </form>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
