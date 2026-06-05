import type { BaseEntity } from '@/types';

/**
 * StorageAdapter abstracts *where* a collection of entities lives (ADR 001).
 * The default implementation is IndexedDB (Dexie). A future Firebase adapter
 * implements the same contract to add cloud sync without changing features.
 */
export interface StorageAdapter<T extends BaseEntity> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  /** Entities indexed by projectId (the common scoped query). */
  getByProject(projectId: string): Promise<T[]>;
  put(entity: T): Promise<void>;
  bulkPut(entities: T[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByProject(projectId: string): Promise<void>;
}
