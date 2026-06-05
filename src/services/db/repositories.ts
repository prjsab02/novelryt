import type { Table } from 'dexie';
import { db } from './schema';
import { DexieAdapter } from './dexie-adapter';
import { FirestoreAdapter } from './firestore-adapter';
import type { StorageAdapter } from './storage-adapter';
import { isFirebaseEnabled } from '@/services/firebase/config';
import { newId, now } from '@/lib/utils';
import type {
  BaseEntity,
  Project,
  Book,
  Chapter,
  Scene,
  Character,
  Location,
  Note,
  ChatSession,
  StoryEvent,
  Organization,
  Lore,
} from '@/types';

/**
 * Repository layer — the only code that touches persistence. Features call
 * these; they never import Dexie directly (CODING_RULES). `create`/`update`
 * own id + timestamp bookkeeping so callers pass plain data.
 */
/**
 * Choose the storage backend per collection: Firestore when Firebase is
 * configured (cloud sync + offline), otherwise IndexedDB (local-first). The
 * decision is made once at load from env; the Firestore adapter resolves the
 * signed-in user lazily at call time (ADR 001).
 */
function makeAdapter<T extends BaseEntity & { projectId?: string }>(
  collectionName: string,
  table: Table<T, string>,
): StorageAdapter<T> {
  return isFirebaseEnabled
    ? new FirestoreAdapter<T>(collectionName)
    : new DexieAdapter<T>(table);
}

class Repository<T extends BaseEntity & { projectId?: string }> {
  constructor(private readonly adapter: StorageAdapter<T>) {}

  list(): Promise<T[]> {
    return this.adapter.getAll();
  }

  get(id: string): Promise<T | undefined> {
    return this.adapter.getById(id);
  }

  byProject(projectId: string): Promise<T[]> {
    return this.adapter.getByProject(projectId);
  }

  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    const ts = now();
    const entity = { ...data, id: newId(), createdAt: ts, updatedAt: ts } as T;
    await this.adapter.put(entity);
    return entity;
  }

  async update(id: string, patch: Partial<Omit<T, keyof BaseEntity>>): Promise<T> {
    const existing = await this.adapter.getById(id);
    if (!existing) throw new Error(`Entity not found: ${id}`);
    const updated = { ...existing, ...patch, updatedAt: now() } as T;
    await this.adapter.put(updated);
    return updated;
  }

  async save(entity: T): Promise<void> {
    await this.adapter.put({ ...entity, updatedAt: now() });
  }

  remove(id: string): Promise<void> {
    return this.adapter.delete(id);
  }

  removeByProject(projectId: string): Promise<void> {
    return this.adapter.deleteByProject(projectId);
  }
}

export const projectsRepo = new Repository<Project>(makeAdapter('projects', db.projects));
export const booksRepo = new Repository<Book>(makeAdapter('books', db.books));
export const chaptersRepo = new Repository<Chapter>(makeAdapter('chapters', db.chapters));
export const scenesRepo = new Repository<Scene>(makeAdapter('scenes', db.scenes));
export const charactersRepo = new Repository<Character>(makeAdapter('characters', db.characters));
export const locationsRepo = new Repository<Location>(makeAdapter('locations', db.locations));
export const notesRepo = new Repository<Note>(makeAdapter('notes', db.notes));
export const chatRepo = new Repository<ChatSession>(makeAdapter('chatSessions', db.chatSessions));
export const eventsRepo = new Repository<StoryEvent>(makeAdapter('events', db.events));
export const organizationsRepo = new Repository<Organization>(
  makeAdapter('organizations', db.organizations),
);
export const loreRepo = new Repository<Lore>(makeAdapter('lore', db.lore));

/** Cascade-delete a project and all entities scoped to it. */
export async function deleteProjectCascade(projectId: string): Promise<void> {
  await Promise.all([
    booksRepo.removeByProject(projectId),
    chaptersRepo.removeByProject(projectId),
    scenesRepo.removeByProject(projectId),
    charactersRepo.removeByProject(projectId),
    locationsRepo.removeByProject(projectId),
    notesRepo.removeByProject(projectId),
    chatRepo.removeByProject(projectId),
    eventsRepo.removeByProject(projectId),
    organizationsRepo.removeByProject(projectId),
    loreRepo.removeByProject(projectId),
  ]);
  await projectsRepo.remove(projectId);
}
