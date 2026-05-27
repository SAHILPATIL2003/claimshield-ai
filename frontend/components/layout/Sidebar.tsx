// ============================================================================
// ClaimShield AI - Dashboard Sidebar UI Component (Role-Based Menu)
// ============================================================================

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, Role } from '../../lib/store';
import {
  ShieldAlert,
  LayoutDashboard,
  UploadCloud,
  Clock,
  CheckCircle,
  Search,
  Brain,
  Users,
  AlertTriangle,
  Link as ChainIcon,
  FileCode,
  Building,
  DollarSign,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push('/');
    if (onCloseMobile) onCloseMobile();
  };

  // Configure navigation blocks by roles
  const patientNavigation = [
    { name: 'Overview', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Upload Reports', href: '/patient/upload', icon: UploadCloud },
    { name: 'Medical Timeline', href: '/patient/timeline', icon: Clock },
    { name: 'Verify Ledger', href: '/patient/verification', icon: CheckCircle },
  ];

  const doctorNavigation = [
    { name: 'Overview', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Patient Lookup', href: '/doctor/patients', icon: Search },
    { name: 'AI Summary Central', href: '/doctor/ai-summary', icon: Brain },
  ];

  const adminNavigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users CRUD', href: '/admin/users', icon: Users },
    { name: 'Fraud Analytics', href: '/admin/fraud', icon: AlertTriangle },
    { name: 'Blockchain Ledger', href: '/admin/blockchain', icon: ChainIcon },
    { name: 'Claims Verification', href: '/admin/claims', icon: DollarSign },
    { name: 'Hospital Profiles', href: '/admin/hospitals', icon: Building },
    { name: 'Audit Logs', href: '/admin/logs', icon: FileCode },
  ];

  // Select navigation set matching current role
  let navigation = patientNavigation;
  if (user?.role === Role.DOCTOR) navigation = doctorNavigation;
  if (user?.role === Role.ADMIN) navigation = adminNavigation;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-850 flex items-center gap-3">
        <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ClaimShield AI
          </h1>
          <span className="text-xxs text-teal-400 font-bold uppercase tracking-wider">
            Ledger Protection
          </span>
        </div>
      </div>

      {/* Navigation menu list */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">
        <span className="px-3 text-xxs font-bold uppercase tracking-widest text-slate-500">
          Main Menu ({user?.role})
        </span>
        <nav className="mt-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-400 border-l-4 border-teal-500 pl-2'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 pl-3'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/40"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 ring-2 ring-teal-500/40">
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="truncate">
            <h2 className="text-sm font-semibold truncate text-slate-200">
              {user?.fullName || 'User Profile'}
            </h2>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-xxs font-bold text-teal-400 uppercase tracking-wide">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-xl cursor-pointer transition-all active:scale-95 duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
