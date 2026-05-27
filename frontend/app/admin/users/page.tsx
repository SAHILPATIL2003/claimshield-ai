// ============================================================================
// ClaimShield AI - Admin User Management CRUD Panel
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  Users, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  Building,
  Check,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>(Role.PATIENT);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editHospitalId, setEditHospitalId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.getUsers();
      const hospRes = await api.getHospitals();
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (hospRes.success && hospRes.data) {
        setHospitals(hospRes.data);
      }
    } catch (err) {
      setError('Connection failed. Database query error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEdit = (user: any) => {
    setEditingUserId(user.id);
    setEditName(user.fullName);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setEditHospitalId(user.hospitalId || '');
  };

  const handleUpdate = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (!editName || editName.trim().length < 2) return;

    try {
      const res = await api.updateUser(userId, {
        fullName: editName.trim(),
        role: editRole,
        isActive: editIsActive,
        hospitalId: editRole === Role.DOCTOR ? (editHospitalId === '' ? null : editHospitalId) : null,
      });

      if (res.success) {
        setEditingUserId(null);
        loadData();
      } else {
        setError(res.message || 'Failed to update user profile');
      }
    } catch (err) {
      setError('Network communication failure.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        loadData();
      } else {
        setError(res.message || 'Failed to delete user.');
      }
    } catch (err) {
      setError('Network communication failure.');
    }
  };

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          User Access Control Registry
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Configure identities, manage access roles, toggle profile activations, and monitor assigned healthcare provider mappings.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-900/40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="glass-card p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xxs font-bold text-slate-400 uppercase tracking-widest">
                <th className="pb-3">User Profile</th>
                <th className="pb-3">Mobile Contact</th>
                <th className="pb-3">Access Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
              {users.map((u) => {
                const isEditing = editingUserId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-500/5 transition-colors">
                    
                    {/* User Profile Column */}
                    <td className="py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-850 dark:text-slate-200"
                          required
                        />
                      ) : (
                        <div className="flex items-center gap-2.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-teal-500 font-bold text-xxs">
                              {u.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{u.fullName}</span>
                            {u.role === Role.DOCTOR && u.hospital && (
                              <span className="text-xxs text-slate-400 mt-0.5 flex items-center gap-0.5 font-semibold">
                                <Building className="w-3 h-3 text-teal-500" />
                                {u.hospital.name}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Mobile Contact */}
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {u.mobileNumber}
                    </td>

                    {/* Access Role */}
                    <td className="py-4">
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as Role)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-850 dark:text-slate-200"
                        >
                          <option value={Role.PATIENT}>PATIENT</option>
                          <option value={Role.DOCTOR}>DOCTOR</option>
                          <option value={Role.ADMIN}>ADMIN</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 text-xxs font-bold rounded uppercase tracking-wide border ${
                          u.role === Role.ADMIN 
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
                            : u.role === Role.DOCTOR 
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' 
                            : 'bg-teal-500/10 text-teal-650 dark:text-teal-400 border-teal-500/20'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="py-4">
                      {isEditing ? (
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="rounded text-teal-500 border-slate-350 outline-none"
                          />
                          <span className="text-xxs font-bold text-slate-400">ACTIVE</span>
                        </label>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xxs font-bold ${u.isActive ? 'text-teal-500' : 'text-slate-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-teal-500' : 'bg-slate-400'}`} />
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          {/* Inline Doctor Hospital selection */}
                          {editRole === Role.DOCTOR && (
                            <select
                              value={editHospitalId || ''}
                              onChange={(e) => setEditHospitalId(e.target.value)}
                              className="px-2 py-1.5 bg-slate-950 border border-slate-800 text-xxs text-slate-200 rounded-lg outline-none max-w-[120px]"
                            >
                              <option value="">No Hospital</option>
                              {hospitals.map((h) => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={(e) => handleUpdate(e, u.id)}
                            className="p-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-lg cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1.5 bg-slate-250 hover:bg-slate-300 dark:bg-slate-850 text-slate-400 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
