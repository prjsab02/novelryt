import { create } from 'zustand';
import type { Chapter } from '@/types';
import { chaptersRepo, booksRepo } from '@/services/db/repositories';
import { countWords } from '@/lib/utils';

interface EditorState {
  projectId: string | null;
  chapters: Chapter[];
  loading: boolean;
  load: (projectId: string) => Promise<void>;
  createChapter: (title: string) => Promise<Chapter>;
  renameChapter: (id: string, title: string) => Promise<void>;
  saveContent: (id: string, content: string) => Promise<void>;
  removeChapter: (id: string) => Promise<void>;
  reorder: (id: string, direction: -1 | 1) => Promise<void>;
}

/** Ensure a project has a default book to hold chapters (PRD §86 alt structure). */
async function ensureDefaultBook(projectId: string): Promise<string> {
  const books = await booksRepo.byProject(projectId);
  if (books.length) return books[0].id;
  const book = await booksRepo.create({
    projectId,
    title: 'Book 1',
    synopsis: '',
    order: 0,
  });
  return book.id;
}

function sortByOrder(chapters: Chapter[]): Chapter[] {
  return [...chapters].sort((a, b) => a.order - b.order);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  chapters: [],
  loading: false,
  load: async (projectId) => {
    set({ loading: true, projectId });
    const chapters = await chaptersRepo.byProject(projectId);
    set({ chapters: sortByOrder(chapters), loading: false });
  },
  createChapter: async (title) => {
    const projectId = get().projectId!;
    const bookId = await ensureDefaultBook(projectId);
    const order = get().chapters.length;
    const chapter = await chaptersRepo.create({
      projectId,
      bookId,
      title: title.trim() || `Chapter ${order + 1}`,
      content: '',
      summary: '',
      wordCount: 0,
      order,
    });
    set({ chapters: sortByOrder([...get().chapters, chapter]) });
    return chapter;
  },
  renameChapter: async (id, title) => {
    const updated = await chaptersRepo.update(id, { title });
    set({ chapters: get().chapters.map((c) => (c.id === id ? updated : c)) });
  },
  saveContent: async (id, content) => {
    const updated = await chaptersRepo.update(id, {
      content,
      wordCount: countWords(content),
    });
    set({ chapters: get().chapters.map((c) => (c.id === id ? updated : c)) });
  },
  removeChapter: async (id) => {
    await chaptersRepo.remove(id);
    set({ chapters: get().chapters.filter((c) => c.id !== id) });
  },
  reorder: async (id, direction) => {
    const chapters = sortByOrder(get().chapters);
    const idx = chapters.findIndex((c) => c.id === id);
    const swap = idx + direction;
    if (idx < 0 || swap < 0 || swap >= chapters.length) return;
    const a = chapters[idx];
    const b = chapters[swap];
    await chaptersRepo.update(a.id, { order: b.order });
    await chaptersRepo.update(b.id, { order: a.order });
    await get().load(get().projectId!);
  },
}));
