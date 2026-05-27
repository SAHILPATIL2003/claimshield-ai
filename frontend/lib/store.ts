// ============================================================================
// ClaimShield AI - Client Zustand Store (Auth & Theme State Management)
// ============================================================================

import { create } from 'zustand';

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export interface UserProfile {
  id: string;
  role: Role;
  mobileNumber: string;
  fullName: string;
  avatar?: string;
  hospitalId?: string;
  hospitalName?: string | null;
}

interface AppState {
  token: string | null;
  user: UserProfile | null;
  theme: 'light' | 'dark';
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  toggleTheme: () => void;
  initTheme: () => void;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? (() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })() : null,
  theme: 'dark', // default theme

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove(get().theme);
      root.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
    }
    set({ theme: newTheme });
  },

  initTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const activeTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark'); // default dark for wow factor
      
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(activeTheme);
      set({ theme: activeTheme });
    }
  },

  login: (token, user) => {
    get().setToken(token);
    get().setUser(user);
  },

  logout: () => {
    get().setToken(null);
    get().setUser(null);
  },
}));
