import { create } from 'zustand';
import type { User } from '@/types';
import { authProvider } from './auth-provider';

interface AuthState {
  user: User | null;
  initialized: boolean;
  init: () => void;
  signIn: (email: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  init: () => set({ user: authProvider.getCurrentUser(), initialized: true }),
  signIn: async (email, displayName) => {
    const user = await authProvider.signIn(email, displayName);
    set({ user });
  },
  signOut: async () => {
    await authProvider.signOut();
    set({ user: null });
  },
}));
