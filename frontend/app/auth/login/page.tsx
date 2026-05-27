// ============================================================================
// ClaimShield AI - OTP Authentication Login Page
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { ShieldCheck, Phone, CheckCircle, ArrowRight, HeartPulse, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../../../components/layout/ThemeToggle';
import { isFirebaseConfigured, sendPhoneOtp } from '../../../lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, token, user } = useAppStore();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // Redirect if session exists
  useEffect(() => {
    if (token && user) {
      if (user.role === Role.PATIENT) router.replace('/patient/dashboard');
      else if (user.role === Role.DOCTOR) router.replace('/doctor/dashboard');
      else if (user.role === Role.ADMIN) router.replace('/admin/dashboard');
    }
  }, [token, user, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isFirebaseConfigured && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
        const phone = mobileNumber.startsWith('+') ? mobileNumber : `+${mobileNumber}`;
        const conf = await sendPhoneOtp(phone, 'recaptcha-container');
        setConfirmation(conf);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setOtpSent(true);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the verification OTP');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let firebaseToken = `mock-${mobileNumber}`;
      if (confirmation) {
        const cred = await confirmation.confirm(otp);
        firebaseToken = await cred.user.getIdToken();
      }
      const res = await api.verifyOtp(firebaseToken);

      if (res.success && res.data) {
        const { token: sessionToken, user: userProfile, isNewUser } = res.data;
        login(sessionToken, userProfile);

        if (isNewUser) {
          router.push('/auth/role-select');
        } else {
          // Route matching role
          if (userProfile.role === Role.PATIENT) router.push('/patient/dashboard');
          else if (userProfile.role === Role.DOCTOR) router.push('/doctor/dashboard');
          else if (userProfile.role === Role.ADMIN) router.push('/admin/dashboard');
        }
      } else {
        setError(res.message || 'OTP Verification failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification system error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick seed login for developers and reviewers
  const handleQuickLogin = async (mobile: string, role: Role, name: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.demoLogin(mobile, role, name);
      if (res.success && res.data) {
        const { token: sessionToken, user: userProfile } = res.data;
        login(sessionToken, userProfile);

        if (role === Role.PATIENT) router.push('/patient/dashboard');
        else if (role === Role.DOCTOR) router.push('/doctor/dashboard');
        else if (role === Role.ADMIN) router.push('/admin/dashboard');
      } else {
        setError(res.message || 'Quick login failed');
      }
    } catch (err: any) {
      setError('Connection failure to localhost:5000 API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/30 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Header theme switcher */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md p-6 z-10">
        {/* App Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-xl shadow-teal-500/20 mb-4">
            <HeartPulse className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ClaimShield AI
          </h2>
          <p className="mt-2 text-sm text-slate-400 text-center">
            AI Healthcare Fraud Prevention & Ledger Audit Platform
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl"
        >
          <div id="recaptcha-container" className="hidden" />
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    id="mobile"
                    type="tel"
                    placeholder="+91 9999999991"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-600 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl text-slate-950 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Enter 4-Digit Verification OTP
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    id="otp"
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-600 transition-all tracking-widest font-bold text-center text-lg"
                    required
                  />
                </div>
                <p className="mt-2 text-xxs text-teal-400 text-center">
                  OTP sent successfully. You can enter any 4 numbers to simulate.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 bg-slate-850 hover:bg-slate-800 rounded-xl font-semibold text-slate-300 text-sm active:scale-98 cursor-pointer transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 rounded-xl font-semibold text-sm active:scale-98 cursor-pointer transition-all"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          )}

          {/* Seed accounts bypass */}
          <div className="mt-8 pt-8 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 justify-center mb-4">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">
                Quick Dev Seed Authentication
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('+919999999991', Role.PATIENT, 'John Doe')}
                className="py-2.5 px-2 bg-slate-950 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 rounded-xl text-xxs font-bold text-slate-300 hover:text-teal-400 cursor-pointer transition-all active:scale-95"
              >
                PATIENT
              </button>
              <button
                onClick={() => handleQuickLogin('+919999999981', Role.DOCTOR, 'Dr. Robert Vance')}
                className="py-2.5 px-2 bg-slate-950 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 rounded-xl text-xxs font-bold text-slate-300 hover:text-teal-400 cursor-pointer transition-all active:scale-95"
              >
                DOCTOR
              </button>
              <button
                onClick={() => handleQuickLogin('+919999999900', Role.ADMIN, 'System Administrator')}
                className="py-2.5 px-2 bg-slate-950 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 rounded-xl text-xxs font-bold text-slate-300 hover:text-teal-400 cursor-pointer transition-all active:scale-95"
              >
                ADMIN
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
