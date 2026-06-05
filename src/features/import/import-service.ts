import {
  projectsRepo,
  booksRepo,
  chaptersRepo,
  charactersRepo,
  locationsRepo,
  notesRepo,
} from '@/services/db/repositories';
import { countWords } from '@/lib/utils';
import type { Project } from '@/types';

/**
 * Import pipeline (PRD §128, §214–§217, Phase 14). Supports plain-text/Markdown
 * manuscripts (with chapter detection) and NovelRyt JSON backups (restore).
 * Always creates a NEW project so imports never overwrite existing work.
 */

interface ParsedChapter {
  title: string;
  content: string;
}

/** Split manuscript text into chapters by Markdown headings or "Chapter N" lines. */
export function detectChapters(text: string): ParsedChapter[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const chapters: ParsedChapter[] = [];
  let current: ParsedChapter | null = null;

  const headingRe = /^(#{1,2}\s+|chapter\b.*)/i;

  for (const line of lines) {
    const isHeading = headingRe.test(line.trim()) && line.trim().length < 120;
    if (isHeading) {
      if (current) chapters.push(current);
      current = { title: line.replace(/^#{1,2}\s+/, '').trim() || 'Untitled', content: '' };
    } else {
      if (!current) current = { title: 'Chapter 1', content: '' };
      current.content += line + '\n';
    }
  }
  if (current) chapters.push(current);

  // Trim trailing whitespace; drop fully-empty leading chapter if title-less.
  return chapters
    .map((c) => ({ title: c.title, content: c.content.trim() }))
    .filter((c) => c.title || c.content);
}

export async function importManuscript(
  ownerId: string,
  filename: string,
  text: string,
): Promise<Project> {
  const title = filename.replace(/\.(txt|md|markdown)$/i, '') || 'Imported manuscript';
  const project = await projectsRepo.create({
    title,
    description: 'Imported manuscript',
    genre: '',
    status: 'Drafting',
    ownerId,
    tags: [],
  });
  const book = await booksRepo.create({ projectId: project.id, title: 'Book 1', synopsis: '', order: 0 });

  const parsed = detectChapters(text);
  let order = 0;
  for (const ch of parsed) {
    await chaptersRepo.create({
      projectId: project.id,
      bookId: book.id,
      title: ch.title,
      content: ch.content,
      summary: '',
      wordCount: countWords(ch.content),
      order: order++,
    });
  }
  return project;
}

interface BackupShape {
  format?: string;
  project?: Partial<Project> & { title?: string };
  books?: { title?: string; synopsis?: string; order?: number }[];
  chapters?: { title?: string; content?: string; summary?: string; order?: number }[];
  characters?: Record<string, unknown>[];
  locations?: Record<string, unknown>[];
  notes?: Record<string, unknown>[];
}

/** Restore a NovelRyt JSON backup into a fresh project (ids regenerated). */
export async function importBackup(ownerId: string, json: string): Promise<Project> {
  const data = JSON.parse(json) as BackupShape;
  if (data.format !== 'novelryt-backup') {
    throw new Error('Not a NovelRyt backup file.');
  }

  const project = await projectsRepo.create({
    title: data.project?.title ?? 'Restored project',
    description: data.project?.description ?? '',
    genre: data.project?.genre ?? '',
    status: data.project?.status ?? 'Drafting',
    ownerId,
    tags: data.project?.tags ?? [],
  });
  const book = await booksRepo.create({
    projectId: project.id,
    title: data.books?.[0]?.title ?? 'Book 1',
    synopsis: data.books?.[0]?.synopsis ?? '',
    order: 0,
  });

  let order = 0;
  for (const c of data.chapters ?? []) {
    const content = c.content ?? '';
    await chaptersRepo.create({
      projectId: project.id,
      bookId: book.id,
      title: c.title ?? `Chapter ${order + 1}`,
      content,
      summary: c.summary ?? '',
      wordCount: countWords(content),
      order: c.order ?? order++,
    });
  }
  for (const c of data.characters ?? []) {
    await charactersRepo.create({
      projectId: project.id,
      name: String((c as { name?: string }).name ?? 'Character'),
      aliases: [],
      description: String((c as { description?: string }).description ?? ''),
      traits: String((c as { traits?: string }).traits ?? ''),
      goals: String((c as { goals?: string }).goals ?? ''),
      status: 'Active',
      tags: [],
    });
  }
  for (const l of data.locations ?? []) {
    await locationsRepo.create({
      projectId: project.id,
      name: String((l as { name?: string }).name ?? 'Location'),
      type: String((l as { type?: string }).type ?? ''),
      description: String((l as { description?: string }).description ?? ''),
    });
  }
  for (const n of data.notes ?? []) {
    await notesRepo.create({
      projectId: project.id,
      type: 'General',
      title: String((n as { title?: string }).title ?? 'Note'),
      content: String((n as { content?: string }).content ?? ''),
      tags: [],
      pinned: false,
    });
  }
  return project;
}

/** Route a picked file to the right importer based on extension. */
export async function importFile(ownerId: string, file: File): Promise<Project> {
  const text = await file.text();
  if (/\.json$/i.test(file.name)) return importBackup(ownerId, text);
  return importManuscript(ownerId, file.name, text);
}
