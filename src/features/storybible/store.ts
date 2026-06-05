import { create } from 'zustand';
import type { Character, Location, Note, Organization, Lore } from '@/types';
import {
  charactersRepo,
  locationsRepo,
  notesRepo,
  organizationsRepo,
  loreRepo,
} from '@/services/db/repositories';

interface StoryBibleState {
  projectId: string | null;
  characters: Character[];
  locations: Location[];
  notes: Note[];
  organizations: Organization[];
  lore: Lore[];
  load: (projectId: string) => Promise<void>;

  addCharacter: (name: string) => Promise<void>;
  updateCharacter: (id: string, patch: Partial<Character>) => Promise<void>;
  removeCharacter: (id: string) => Promise<void>;

  addLocation: (name: string) => Promise<void>;
  updateLocation: (id: string, patch: Partial<Location>) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;

  addNote: (title: string) => Promise<void>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;

  addOrganization: (name: string) => Promise<void>;
  updateOrganization: (id: string, patch: Partial<Organization>) => Promise<void>;
  removeOrganization: (id: string) => Promise<void>;

  addLore: (title: string) => Promise<void>;
  updateLore: (id: string, patch: Partial<Lore>) => Promise<void>;
  removeLore: (id: string) => Promise<void>;
}

export const useStoryBibleStore = create<StoryBibleState>((set, get) => ({
  projectId: null,
  characters: [],
  locations: [],
  notes: [],
  organizations: [],
  lore: [],
  load: async (projectId) => {
    const [characters, locations, notes, organizations, lore] = await Promise.all([
      charactersRepo.byProject(projectId),
      locationsRepo.byProject(projectId),
      notesRepo.byProject(projectId),
      organizationsRepo.byProject(projectId),
      loreRepo.byProject(projectId),
    ]);
    set({ projectId, characters, locations, notes, organizations, lore });
  },

  addCharacter: async (name) => {
    const c = await charactersRepo.create({
      projectId: get().projectId!,
      name: name.trim() || 'New character',
      aliases: [],
      description: '',
      traits: '',
      goals: '',
      status: 'Active',
      tags: [],
    });
    set({ characters: [...get().characters, c] });
  },
  updateCharacter: async (id, patch) => {
    const u = await charactersRepo.update(id, patch);
    set({ characters: get().characters.map((c) => (c.id === id ? u : c)) });
  },
  removeCharacter: async (id) => {
    await charactersRepo.remove(id);
    set({ characters: get().characters.filter((c) => c.id !== id) });
  },

  addLocation: async (name) => {
    const l = await locationsRepo.create({
      projectId: get().projectId!,
      name: name.trim() || 'New location',
      type: '',
      description: '',
    });
    set({ locations: [...get().locations, l] });
  },
  updateLocation: async (id, patch) => {
    const u = await locationsRepo.update(id, patch);
    set({ locations: get().locations.map((l) => (l.id === id ? u : l)) });
  },
  removeLocation: async (id) => {
    await locationsRepo.remove(id);
    set({ locations: get().locations.filter((l) => l.id !== id) });
  },

  addNote: async (title) => {
    const n = await notesRepo.create({
      projectId: get().projectId!,
      type: 'General',
      title: title.trim() || 'New note',
      content: '',
      tags: [],
      pinned: false,
    });
    set({ notes: [...get().notes, n] });
  },
  updateNote: async (id, patch) => {
    const u = await notesRepo.update(id, patch);
    set({ notes: get().notes.map((n) => (n.id === id ? u : n)) });
  },
  removeNote: async (id) => {
    await notesRepo.remove(id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },

  addOrganization: async (name) => {
    const o = await organizationsRepo.create({
      projectId: get().projectId!,
      name: name.trim() || 'New organization',
      kind: '',
      description: '',
      leader: '',
      ideology: '',
    });
    set({ organizations: [...get().organizations, o] });
  },
  updateOrganization: async (id, patch) => {
    const u = await organizationsRepo.update(id, patch);
    set({ organizations: get().organizations.map((o) => (o.id === id ? u : o)) });
  },
  removeOrganization: async (id) => {
    await organizationsRepo.remove(id);
    set({ organizations: get().organizations.filter((o) => o.id !== id) });
  },

  addLore: async (title) => {
    const l = await loreRepo.create({
      projectId: get().projectId!,
      title: title.trim() || 'New lore entry',
      category: 'History',
      content: '',
    });
    set({ lore: [...get().lore, l] });
  },
  updateLore: async (id, patch) => {
    const u = await loreRepo.update(id, patch);
    set({ lore: get().lore.map((l) => (l.id === id ? u : l)) });
  },
  removeLore: async (id) => {
    await loreRepo.remove(id);
    set({ lore: get().lore.filter((l) => l.id !== id) });
  },
}));
