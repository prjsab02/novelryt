// Shared domain types for NovelRyt.
// Mirrors docs/DATA_MODEL.md and PRD Part 2 / Part 9. All entities carry id +
// timestamps; persistence details live in src/services/db.

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export type ProjectStatus =
  | 'Planning'
  | 'Drafting'
  | 'Revising'
  | 'Editing'
  | 'Completed'
  | 'Archived';

export interface Project extends BaseEntity {
  title: string;
  description: string;
  genre: string;
  status: ProjectStatus;
  ownerId: string;
  tags: string[];
}

export interface Book extends BaseEntity {
  projectId: string;
  title: string;
  synopsis: string;
  order: number;
}

export interface Chapter extends BaseEntity {
  projectId: string;
  bookId: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  order: number;
}

export interface Scene extends BaseEntity {
  projectId: string;
  chapterId: string;
  title: string;
  content: string;
  povCharacterId?: string;
  locationId?: string;
  order: number;
}

export type CharacterStatus = 'Active' | 'Deceased' | 'Missing' | 'Retired';

export interface Character extends BaseEntity {
  projectId: string;
  name: string;
  aliases: string[];
  description: string;
  traits: string;
  goals: string;
  status: CharacterStatus;
  tags: string[];
}

export interface Location extends BaseEntity {
  projectId: string;
  name: string;
  type: string;
  description: string;
  parentLocationId?: string;
}

export type NoteType =
  | 'General'
  | 'Plot'
  | 'Character'
  | 'Worldbuilding'
  | 'Research'
  | 'Reminder';

export interface Note extends BaseEntity {
  projectId: string;
  type: NoteType;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
}

export type ChatMode = 'story' | 'research' | 'hybrid' | 'writing';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

export interface ChatSession extends BaseEntity {
  projectId: string;
  mode: ChatMode;
  title: string;
  messages: ChatMessage[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
}
