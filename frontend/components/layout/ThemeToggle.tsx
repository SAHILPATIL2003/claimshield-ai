// ============================================================================
// ClaimShield AI - Theme Toggler UI Component
// ============================================================================

'use client';

import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export default function ThemeToggle() {
  const { theme, toggleTheme, initTheme } = useAppStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95 duration-200 cursor-pointer"
      aria-label="Toggle dark/light theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 transition-transform hover:rotate-12" />
      ) : (
        <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
      )}
    </button>
  );
}
