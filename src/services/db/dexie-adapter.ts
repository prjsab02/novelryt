import type { Table } from 'dexie';
import type { BaseEntity } from '@/types';
import type { StorageAdapter } from './storage-adapter';

/**
 * IndexedDB-backed StorageAdapter (the default). Wraps a Dexie table. Assumes
 * the table has a `projectId` index for `getByProject`; tables without one
 * (e.g. projects themselves) should not call that method.
 */
export class DexieAdapter<T extends BaseEntity & { projectId?: string }>
  implements StorageAdapter<T>
{
  constructor(private readonly table: Table<T, string>) {}

  getAll(): Promise<T[]> {
    return this.table.toArray();
  }

  getById(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }

  getByProject(projectId: string): Promise<T[]> {
    return this.table.where('projectId').equals(projectId).toArray();
  }

  async put(entity: T): Promise<void> {
    await this.table.put(entity);
  }

  async bulkPut(entities: T[]): Promise<void> {
    await this.table.bulkPut(entities);
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  async deleteByProject(projectId: string): Promise<void> {
    await this.table.where('projectId').equals(projectId).delete();
  }
}
