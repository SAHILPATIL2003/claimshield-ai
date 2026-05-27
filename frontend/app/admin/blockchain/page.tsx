// ============================================================================
// ClaimShield AI - Admin Blockchain Ledger Explorer
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/Layout';
import { Role } from '../../../lib/store';
import { api } from '../../../lib/api';
import { 
  Link as ChainIcon, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  RefreshCw,
  Clock,
  Lock,
  ArrowRight,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BlockchainLedgerPage() {
  const [chain, setChain] = useState<any[]>([]);
  const [integrity, setIntegrity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingChain, setVerifyingChain] = useState(false);

  const loadChainData = async () => {
    setLoading(true);
    try {
      const res = await api.getBlockchainLedger();
      if (res.success && res.data) {
        setChain(res.data.chain);
        setIntegrity(res.data.integrity);
      }
    } catch (err) {
      console.error('Failed to load blockchain ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChainData();
  }, []);

  const runReverification = async () => {
    setVerifyingChain(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await loadChainData();
    setVerifyingChain(false);
  };

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      
      {/* Welcome & Integrity Card Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <ChainIcon className="w-6 h-6 text-teal-400" />
            Blockchain Ledger Explorer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Review ledger mining blocks, verify consensus nonces, and validate cryptographic back-linkages.
          </p>
        </div>

        <button
          onClick={runReverification}
          disabled={verifyingChain}
          className="btn-primary text-xs shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${verifyingChain ? 'animate-spin' : ''}`} />
          Verify Chain Integrity
        </button>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-900/40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Integrity status alert banner */}
          {integrity && (
            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              integrity.isValid 
                ? 'bg-teal-500/10 border-teal-500/20 text-teal-605 dark:text-teal-450' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-605 dark:text-rose-450 animate-pulse'
            }`}>
              {integrity.isValid ? (
                <ShieldCheck className="w-10 h-10 shrink-0 text-teal-500" />
              ) : (
                <AlertTriangle className="w-10 h-10 shrink-0 text-rose-500 animate-bounce" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {integrity.isValid ? 'Ledger Chain Authentic' : 'LEDGER LINK TAMPERED'}
                </h3>
                <p className="text-xxs opacity-90 mt-0.5 leading-relaxed font-semibold">
                  {integrity.isValid 
                    ? 'All blocks passed hashing checksum audits and proof-of-work compliance. Cryptographic sequence validated.'
                    : `Discrepancy located at Block #${integrity.errorBlockIndex}. Links broke due to altered previousHash calculations.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Block flow timeline list */}
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mined Ledger Blocks</h2>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
              {chain.map((block) => {
                const isGenesis = block.index === 0;
                
                return (
                  <div key={block.id || block.index} className="relative">
                    
                    {/* Node indicator badge */}
                    <div className="absolute top-1 -left-[35px] w-6.5 h-6.5 rounded-full bg-slate-900 border-2 border-teal-500 flex items-center justify-center text-teal-400 font-bold text-xxs shadow shadow-teal-500/20">
                      {block.index}
                    </div>

                    <div className="glass-card p-5 space-y-4">
                      {/* Meta header info */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isGenesis ? 'Genesis Block' : `Block #${block.index}`}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xxs text-slate-400 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(block.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 text-xxs font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded uppercase font-mono">
                            Nonce: {block.nonce}
                          </span>
                          <span className="px-2 py-0.5 text-xxs font-bold text-teal-405 dark:text-teal-400 bg-teal-500/10 border border-teal-500/15 rounded uppercase tracking-wide">
                            {block.action}
                          </span>
                        </div>
                      </div>

                      {/* Cryptographic hashes details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xxs bg-slate-100 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-850 rounded-xl leading-normal">
                        <div>
                          <span className="text-slate-500 block uppercase">Previous Block Link (previousHash)</span>
                          <span className="text-slate-350 select-all truncate block mt-0.5">{block.previousHash}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase">Block Hash (SHA-256)</span>
                          <span className="text-teal-400 select-all truncate block mt-0.5">{block.hash}</span>
                        </div>
                      </div>

                      {/* Block payload details */}
                      {!isGenesis && (
                        <div className="text-xxs space-y-2 border-t border-slate-200/40 dark:border-slate-850 pt-3">
                          <span className="text-slate-500 font-bold uppercase tracking-wider block">Block Payload Metadata</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-650 dark:text-slate-400 font-semibold">
                            <div>
                              <span>Associated Record ID:</span>
                              <span className="text-slate-700 dark:text-slate-200 block truncate mt-0.5 font-mono select-all">{block.recordId}</span>
                            </div>
                            <div>
                              <span>File Hash Checksum:</span>
                              <span className="text-slate-750 dark:text-slate-200 block truncate mt-0.5 font-mono select-all">{block.fileHash}</span>
                            </div>
                            <div>
                              <span>Committed By UID:</span>
                              <span className="text-slate-700 dark:text-slate-200 block truncate mt-0.5 font-mono select-all">{block.uploadedBy}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
