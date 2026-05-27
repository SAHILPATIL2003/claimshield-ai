'use client';

import PublicShell from '../../components/layout/PublicShell';
import { Card, CardHeader, CardTitle } from '../../components/ui/card';
import { ShieldCheck, Lock, Brain, Link2, AlertTriangle } from 'lucide-react';

const steps = [
  {
    icon: Lock,
    title: 'Immutable Patient Timeline',
    body: 'Patients append records only. Historical uploads cannot be edited or removed by patients or doctors.',
  },
  {
    icon: Link2,
    title: 'SHA-256 Blockchain Anchoring',
    body: 'Every file hash is mined into a permissioned ledger block with proof-of-work linkage to prior blocks.',
  },
  {
    icon: Brain,
    title: 'AI Fraud Scoring',
    body: 'OCR extraction, duplicate detection, rapid-upload heuristics, and anomaly pattern scans produce risk scores.',
  },
  {
    icon: AlertTriangle,
    title: 'Tamper Alerts',
    body: 'Re-hashing stored files against ledger anchors triggers instant fraud warnings on doctor and admin consoles.',
  },
];

export default function FraudPreventionPage() {
  return (
    <PublicShell
      title="Insurance Fraud Prevention"
      subtitle="Hybrid centralized metadata + permissioned blockchain integrity for healthcare claims."
    >
      <div className="grid gap-6">
        {steps.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center gap-3 mb-0">
              <div className="p-3 bg-teal-500/10 rounded-xl">
                <Icon className="w-6 h-6 text-teal-400" />
              </div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">{body}</p>
          </Card>
        ))}
        <Card className="border-teal-500/30 bg-teal-500/5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
            <p className="text-sm text-slate-300">
              QR verification lets insurers and hospitals validate record integrity without portal access.
            </p>
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
