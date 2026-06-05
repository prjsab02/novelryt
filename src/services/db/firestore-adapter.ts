import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore, firebaseAuth } from '@/services/firebase/config';
import type { BaseEntity } from '@/types';
import type { StorageAdapter } from './storage-adapter';

/**
 * Firestore-backed StorageAdapter (ADR 001). Data is scoped per signed-in user:
 * `users/{uid}/{collection}/{id}`. Firestore's IndexedDB persistence (enabled in
 * config.ts) provides offline support and cross-device sync automatically.
 */
export class FirestoreAdapter<T extends BaseEntity & { projectId?: string }>
  implements StorageAdapter<T>
{
  constructor(private readonly collectionName: string) {}

  private col() {
    const uid = firebaseAuth?.currentUser?.uid;
    if (!firestore || !uid) {
      throw new Error('Firestore unavailable or user not signed in.');
    }
    return collection(firestore, 'users', uid, this.collectionName);
  }

  async getAll(): Promise<T[]> {
    const snap = await getDocs(this.col());
    return snap.docs.map((d) => d.data() as T);
  }

  async getById(id: string): Promise<T | undefined> {
    const snap = await getDoc(doc(this.col(), id));
    return snap.exists() ? (snap.data() as T) : undefined;
  }

  async getByProject(projectId: string): Promise<T[]> {
    const snap = await getDocs(query(this.col(), where('projectId', '==', projectId)));
    return snap.docs.map((d) => d.data() as T);
  }

  async put(entity: T): Promise<void> {
    await setDoc(doc(this.col(), entity.id), entity);
  }

  async bulkPut(entities: T[]): Promise<void> {
    const batch = writeBatch(firestore!);
    for (const e of entities) batch.set(doc(this.col(), e.id), e);
    await batch.commit();
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col(), id));
  }

  async deleteByProject(projectId: string): Promise<void> {
    const snap = await getDocs(query(this.col(), where('projectId', '==', projectId)));
    const batch = writeBatch(firestore!);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
