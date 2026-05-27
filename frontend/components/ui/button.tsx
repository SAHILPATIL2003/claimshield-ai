import * as React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-600 hover:to-cyan-600 shadow-md shadow-teal-500/10',
  secondary:
    'bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/40 text-slate-800 dark:text-slate-200',
  ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300',
  danger: 'bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
