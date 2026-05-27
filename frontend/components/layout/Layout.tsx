// ============================================================================
// ClaimShield AI - Main Dashboard Layout Wrapper
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore, Role } from '../../lib/store';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { Menu, X, Bell, Shield, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function DashboardLayout({ children, allowedRoles }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, initTheme } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    initTheme();
  }, [initTheme]);

  // Route Protection & Authorizations check
  useEffect(() => {
    if (isClient) {
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        // Mismatch role routing helper
        if (user.role === Role.PATIENT) router.replace('/patient/dashboard');
        else if (user.role === Role.DOCTOR) router.replace('/doctor/dashboard');
        else if (user.role === Role.ADMIN) router.replace('/admin/dashboard');
      }
    }
  }, [isClient, token, user, allowedRoles, router]);

  // Return loader while syncing state on client
  if (!isClient || !token || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-slate-100">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 border-r-transparent border-slate-700 animate-spin" />
          <Shield className="w-6 h-6 text-teal-400" />
        </div>
        <p className="text-sm font-medium tracking-wide animate-pulse">Syncing Cryptographic Session...</p>
      </div>
    );
  }

  // Derive dashboard layout titles
  const getHeaderTitle = () => {
    if (pathname.includes('/patient/dashboard')) return 'Patient Overview';
    if (pathname.includes('/patient/upload')) return 'Add Medical Report';
    if (pathname.includes('/patient/timeline')) return 'Medical Record Timeline';
    if (pathname.includes('/patient/verification')) return 'Ledger Integrity Audit';
    if (pathname.includes('/doctor/dashboard')) return 'Clinical Dashboard';
    if (pathname.includes('/doctor/patients')) return 'Patient Lookup Central';
    if (pathname.includes('/doctor/ai-summary')) return 'AI NLP Analysis';
    if (pathname.includes('/admin/dashboard')) return 'Enterprise Admin Console';
    if (pathname.includes('/admin/users')) return 'User Access Management';
    if (pathname.includes('/admin/fraud')) return 'Insurance Fraud Analytics';
    if (pathname.includes('/admin/blockchain')) return 'Blockchain Node Status';
    if (pathname.includes('/admin/claims')) return 'Insurance Claim Auditing';
    if (pathname.includes('/admin/hospitals')) return 'Hospital Providers Registry';
    if (pathname.includes('/admin/logs')) return 'Immutable Audit Logs';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#030712] transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex flex-col w-64 max-w-xs bg-slate-900 z-10"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-35 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {getHeaderTitle()}
              </h1>
            </div>
          </div>

          {/* Quick Actions (Theme, alerts, info) */}
          <div className="flex items-center gap-4">
            {/* Simulation mode indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 animate-pulse" />
              <span className="text-xxs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                Live Node Sync
              </span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile trigger */}
            <div className="flex items-center gap-3 px-1">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-teal-500">
                  <Shield className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page wrapper with motion transitions */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
