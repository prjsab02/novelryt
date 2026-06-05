import { create } from 'zustand';
import type { User } from '@/types';
import { authProvider } from './auth-provider';

interface AuthState {
  user: User | null;
  initialized: boolean;
  mode: 'local' | 'firebase';
  init: () => void;
  signInLocal: (displayName?: string) => Promise<void>;
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
  signInLocal: async (displayName) => {
    const user = await authProvider.signInLocal!(displayName);
    set({ user, initialized: true });
  },
  signInGoogle: async () => {
    await authProvider.signInGoogle!();
    // onAuthStateChanged updates `user`.
  },
  signOut: async () => {
    await authProvider.signOut();
    set({ user: null });
  },
}));
