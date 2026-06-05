import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  type Firestore,
} from 'firebase/firestore';

/**
 * Env-gated Firebase initialization (ADR 001 — cloud is an optional adapter).
 * If the env vars are absent the app stays fully local-first; none of the
 * Firebase code paths run. See docs/FIREBASE_SETUP.md.
 */
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseEnabled = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

if (isFirebaseEnabled) {
  app = initializeApp(cfg as Required<typeof cfg>);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  // Offline persistence gives offline-first + multi-device sync + conflict
  // handling out of the box (PRD §378–§386). Best-effort; ignore if unsupported.
  enableIndexedDbPersistence(dbInstance).catch(() => {
    /* multiple tabs or unsupported browser — sync still works online */
  });
}

export const firebaseAuth = authInstance;
export const firestore = dbInstance;
