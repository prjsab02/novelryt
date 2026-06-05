import { db } from './schema';
import { DexieAdapter } from './dexie-adapter';
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
} from '@/types';

/**
 * Repository layer — the only code that touches persistence. Features call
 * these; they never import Dexie directly (CODING_RULES). `create`/`update`
 * own id + timestamp bookkeeping so callers pass plain data.
 */
class Repository<T extends BaseEntity & { projectId?: string }> {
  constructor(private readonly adapter: DexieAdapter<T>) {}

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

export const projectsRepo = new Repository<Project>(new DexieAdapter(db.projects));
export const booksRepo = new Repository<Book>(new DexieAdapter(db.books));
export const chaptersRepo = new Repository<Chapter>(new DexieAdapter(db.chapters));
export const scenesRepo = new Repository<Scene>(new DexieAdapter(db.scenes));
export const charactersRepo = new Repository<Character>(new DexieAdapter(db.characters));
export const locationsRepo = new Repository<Location>(new DexieAdapter(db.locations));
export const notesRepo = new Repository<Note>(new DexieAdapter(db.notes));
export const chatRepo = new Repository<ChatSession>(new DexieAdapter(db.chatSessions));
export const eventsRepo = new Repository<StoryEvent>(new DexieAdapter(db.events));

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
  ]);
  await projectsRepo.remove(projectId);
}
