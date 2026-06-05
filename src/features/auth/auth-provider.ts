import type { User } from '@/types';

/**
 * AuthProvider abstracts identity (PRD §355). The MVP ships a local provider
 * (offline, no backend). A Firebase Auth adapter implements the same interface
 * later (DEBT-001) so the app and route guard never change.
 */
export interface AuthProvider {
  getCurrentUser(): User | null;
  signIn(email: string, displayName?: string): Promise<User>;
  signOut(): Promise<void>;
}

const STORAGE_KEY = 'novelryt.auth.user';

/**
 * Local, offline auth. Treats an email as identity and persists the session in
 * localStorage. No password verification — this is a development stub until the
 * Firebase adapter lands. See docs/TECHNICAL_DEBT.md DEBT-001.
 */
export class LocalAuthProvider implements AuthProvider {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async signIn(email: string, displayName?: string): Promise<User> {
    const normalized = email.trim().toLowerCase();
    const user: User = {
      id: `local:${normalized}`,
      email: normalized,
      displayName: displayName?.trim() || normalized.split('@')[0] || 'Writer',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const authProvider: AuthProvider = new LocalAuthProvider();
