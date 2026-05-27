import * as React from 'react';
import { cn } from '../../lib/utils';

type Tone = 'success' | 'danger' | 'neutral';

const tones: Record<Tone, string> = {
  success: 'badge-blockchain',
  danger: 'badge-fraud',
  neutral:
    'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-500 bg-slate-500/10 border border-slate-500/20 rounded-full',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn(tones[tone], className)} {...props} />;
}
