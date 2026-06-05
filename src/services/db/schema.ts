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
  }
}

export const db = new NovelRytDB();
