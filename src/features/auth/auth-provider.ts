import type { User } from '@/types';
import { isFirebaseEnabled, firebaseAuth } from '@/services/firebase/config';

/**
 * AuthProvider abstracts identity (PRD §355). Two implementations:
 * - LocalAuthProvider: offline, no backend (email → identity, no password).
 * - FirebaseAuthProvider: real accounts (email/password + Google), cross-device.
 * The active one is chosen from env (isFirebaseEnabled). The UI branches on `mode`.
 */
export interface AuthProvider {
  readonly mode: 'local' | 'firebase';
  /** Fires immediately with the current session, then on every change. Returns unsubscribe. */
  subscribe(cb: (user: User | null) => void): () => void;
  signOut(): Promise<void>;
  // Mode-specific (presence depends on `mode`):
  signInLocal?(email: string, displayName?: string): Promise<User>;
  signInEmail?(email: string, password: string): Promise<User>;
  signUpEmail?(email: string, password: string, displayName?: string): Promise<User>;
  signInGoogle?(): Promise<User>;
}

const STORAGE_KEY = 'novelryt.auth.user';

/** Local, offline auth (development / no-cloud mode). See docs/TECHNICAL_DEBT.md DEBT-001. */
class LocalAuthProvider implements AuthProvider {
  readonly mode = 'local' as const;

  subscribe(cb: (user: User | null) => void): () => void {
    cb(this.read());
    return () => {};
  }

  private read(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async signInLocal(email: string, displayName?: string): Promise<User> {
    const normalized = email.trim().toLowerCase();
    const user: User = {
      id: `local:${normalized}`,
      email: normalized,
      displayName: displayName?.trim() || normalized.split('@')[0] || 'Writer',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Local subscribe doesn't push; the store updates optimistically on sign-in.
    return user;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Firebase-backed real auth (email/password + Google). */
class FirebaseAuthProvider implements AuthProvider {
  readonly mode = 'firebase' as const;

  subscribe(cb: (user: User | null) => void): () => void {
    // Lazy import keeps firebase/auth out of the local-mode bundle path.
    let unsub = () => {};
    void import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsub = onAuthStateChanged(firebaseAuth!, (fbUser) => {
        cb(
          fbUser
            ? {
                id: fbUser.uid,
                email: fbUser.email ?? '',
                displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Writer',
              }
            : null,
        );
      });
    });
    return () => unsub();
  }

  async signInEmail(email: string, password: string): Promise<User> {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const cred = await signInWithEmailAndPassword(firebaseAuth!, email.trim(), password);
    return this.toUser(cred.user);
  }

  async signUpEmail(email: string, password: string, displayName?: string): Promise<User> {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(firebaseAuth!, email.trim(), password);
    if (displayName?.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    return this.toUser(cred.user);
  }

  async signInGoogle(): Promise<User> {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const cred = await signInWithPopup(firebaseAuth!, new GoogleAuthProvider());
    return this.toUser(cred.user);
  }

  async signOut(): Promise<void> {
    const { signOut } = await import('firebase/auth');
    await signOut(firebaseAuth!);
  }

  private toUser(u: { uid: string; email: string | null; displayName: string | null }): User {
    return {
      id: u.uid,
      email: u.email ?? '',
      displayName: u.displayName || u.email?.split('@')[0] || 'Writer',
    };
  }
}

export const authProvider: AuthProvider = isFirebaseEnabled
  ? new FirebaseAuthProvider()
  : new LocalAuthProvider();
