// ============================================================================
// ClaimShield AI - Patient Report Upload Page
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Brain, 
  Clock, 
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadReportsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<number>(0); // 1: Storage, 2: Hash, 3: OCR, 4: Blockchain, 5: Done
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Maximum file size is 10MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a medical file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    
    // Simulate steps locally for visual UI progress
    try {
      setStep(1); // Storage
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setStep(2); // Hash calculation
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStep(3); // OCR Translation
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setStep(4); // Blockchain Mining
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Trigger actual API request
      const res = await api.uploadRecord(file);

      if (res.success && res.data) {
        setSuccessData(res.data);
        setStep(5); // Complete
      } else {
        setError(res.message || 'File upload failed. Ensure API server is active on Port 5000.');
        setUploading(false);
        setStep(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to authentication or storage nodes.');
      setUploading(false);
      setStep(0);
    }
  };

  return (
    <DashboardLayout allowedRoles={[Role.PATIENT]}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Upload Medical Report
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Upload scans, prescriptions, or blood test files. The document is processed, indexed, and locked to the blockchain.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!uploading && step !== 5 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-8"
            >
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Drag Drop Area */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/30 rounded-2xl p-8 flex flex-col items-center justify-center transition-colors relative cursor-pointer group bg-slate-900/5 dark:bg-slate-950/20">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-teal-400 transition-colors mb-4" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-350">
                    {file ? file.name : 'Select file or drag & drop'}
                  </span>
                  <span className="text-xxs text-slate-400 mt-2 block">
                    Supported: PDF, JPG, PNG, WEBP (Max 10MB)
                  </span>
                </div>

                {file && (
                  <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-teal-500" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[250px]">{file.name}</p>
                        <p className="text-xxs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!file}
                  className={`w-full py-4 px-6 text-sm font-bold rounded-xl text-slate-950 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                    file 
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600' 
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4.5 h-4.5" />
                  Secure and Upload Record
                </button>
              </form>
            </motion.div>
          ) : uploading && step < 5 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 flex flex-col items-center justify-center text-center py-12"
            >
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-teal-500/10 border-t-teal-500 border-r-teal-500 animate-spin" />
                <Cpu className="w-8 h-8 text-teal-400 animate-pulse" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {step === 1 && 'Uploading to Supabase Storage...'}
                {step === 2 && 'Calculating Cryptographic Hash...'}
                {step === 3 && 'Extracting Clinical Data (OCR)...'}
                {step === 4 && 'Mining Ledger Block...'}
              </h3>
              
              <div className="w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-6 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '95%',
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Progress Steps Indicator */}
              <div className="grid grid-cols-4 gap-4 w-full mt-8 max-w-sm text-xxs font-bold text-slate-400">
                <div className={step >= 1 ? 'text-teal-400' : ''}>Storage</div>
                <div className={step >= 2 ? 'text-teal-400' : ''}>SHA-256</div>
                <div className={step >= 3 ? 'text-teal-400' : ''}>OCR AI</div>
                <div className={step >= 4 ? 'text-teal-400' : ''}>Consensus</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 text-center"
            >
              <div className="inline-flex p-4 bg-teal-500/10 dark:bg-teal-500/20 text-teal-500 rounded-full mb-6 ring-4 ring-teal-500/5">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                Document Anchored Successfully!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                Your medical report is successfully registered in the permissioned blockchain ledger and assigned a block block transaction hash.
              </p>

              {successData && (
                <div className="mt-8 p-6 bg-slate-900/60 dark:bg-slate-950/60 border border-slate-800 rounded-2xl text-left font-mono text-xxs space-y-4 max-w-md mx-auto">
                  <div>
                    <span className="text-slate-500 font-bold block uppercase">Record ID</span>
                    <span className="text-slate-350 select-all block mt-1">{successData.record?.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase">Ledger Block Hash</span>
                    <span className="text-teal-400 select-all block mt-1 truncate">{successData.record?.txId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
                    <div>
                      <span className="text-slate-500 font-bold block uppercase">Block Index</span>
                      <span className="text-slate-300 font-bold block mt-1">Block #{successData.blockchain?.blockIndex}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase">SHA-256 Hash</span>
                      <span className="text-slate-300 font-bold block mt-1 truncate select-all">{successData.record?.blockchainHash}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => {
                    setFile(null);
                    setStep(0);
                    setUploading(false);
                    setSuccessData(null);
                  }}
                  className="w-1/2 py-3 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Upload Another
                </button>
                <button
                  onClick={() => router.push('/patient/dashboard')}
                  className="w-1/2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
