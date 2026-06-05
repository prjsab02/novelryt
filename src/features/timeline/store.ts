import { create } from 'zustand';
import type { StoryEvent } from '@/types';
import { eventsRepo } from '@/services/db/repositories';

interface TimelineState {
  projectId: string | null;
  events: StoryEvent[];
  load: (projectId: string) => Promise<void>;
  addEvent: (title: string) => Promise<void>;
  updateEvent: (id: string, patch: Partial<StoryEvent>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
}

const sortBySequence = (events: StoryEvent[]) =>
  [...events].sort((a, b) => a.sequence - b.sequence);

export const useTimelineStore = create<TimelineState>((set, get) => ({
  projectId: null,
  events: [],
  load: async (projectId) => {
    const events = await eventsRepo.byProject(projectId);
    set({ projectId, events: sortBySequence(events) });
  },
  addEvent: async (title) => {
    const nextSeq = get().events.reduce((max, e) => Math.max(max, e.sequence), 0) + 10;
    const event = await eventsRepo.create({
      projectId: get().projectId!,
      title: title.trim() || 'New event',
      description: '',
      dateLabel: '',
      sequence: nextSeq,
      participants: '',
    });
    set({ events: sortBySequence([...get().events, event]) });
  },
  updateEvent: async (id, patch) => {
    const u = await eventsRepo.update(id, patch);
    set({ events: sortBySequence(get().events.map((e) => (e.id === id ? u : e))) });
  },
  removeEvent: async (id) => {
    await eventsRepo.remove(id);
    set({ events: get().events.filter((e) => e.id !== id) });
  },
}));
