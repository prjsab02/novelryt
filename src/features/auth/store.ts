import { create } from 'zustand';
import type { User } from '@/types';
import { authProvider } from './auth-provider';

interface AuthState {
  user: User | null;
  initialized: boolean;
  mode: 'local' | 'firebase';
  init: () => void;
  signInLocal: (email: string, displayName?: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  mode: authProvider.mode,
  init: () => {
    // subscribe fires immediately with the current session, then on changes.
    authProvider.subscribe((user) => set({ user, initialized: true }));
  },
  signInLocal: async (email, displayName) => {
    const user = await authProvider.signInLocal!(email, displayName);
    set({ user, initialized: true });
  },
  signInEmail: async (email, password) => {
    await authProvider.signInEmail!(email, password);
    // onAuthStateChanged updates `user`.
  },
  signUpEmail: async (email, password, displayName) => {
    await authProvider.signUpEmail!(email, password, displayName);
  },
  signInGoogle: async () => {
    await authProvider.signInGoogle!();
  },
  signOut: async () => {
    await authProvider.signOut();
    set({ user: null });
  },
}));
