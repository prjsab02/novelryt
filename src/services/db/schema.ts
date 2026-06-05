import Dexie, { type Table } from 'dexie';
import type {
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
 * NovelRyt local database (IndexedDB via Dexie). This is the primary store
 * (ADR 001). Indexes are chosen for project-scoped queries and ordered lists.
 * Only repositories (src/services/db/repositories.ts) should touch this.
 */
export class NovelRytDB extends Dexie {
  projects!: Table<Project, string>;
  books!: Table<Book, string>;
  chapters!: Table<Chapter, string>;
  scenes!: Table<Scene, string>;
  characters!: Table<Character, string>;
  locations!: Table<Location, string>;
  notes!: Table<Note, string>;
  chatSessions!: Table<ChatSession, string>;
  events!: Table<StoryEvent, string>;
  organizations!: Table<Organization, string>;
  lore!: Table<Lore, string>;

  constructor() {
    super('novelryt');
    this.version(1).stores({
      projects: 'id, ownerId, status, updatedAt',
      books: 'id, projectId, order',
      chapters: 'id, projectId, bookId, order',
      scenes: 'id, projectId, chapterId, order',
      characters: 'id, projectId, name, status',
      locations: 'id, projectId, name',
      notes: 'id, projectId, type, pinned',
      chatSessions: 'id, projectId, mode, updatedAt',
    });
    // v2: add timeline events (Phase 5). Additive — no migration of existing data.
    this.version(2).stores({
      events: 'id, projectId, sequence',
    });
    // v3: expand Story Bible with organizations and lore. Additive.
    this.version(3).stores({
      organizations: 'id, projectId, name',
      lore: 'id, projectId, category',
    });
  }
}

export const db = new NovelRytDB();
