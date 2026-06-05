import { create } from 'zustand';
import type { Project, ProjectStatus } from '@/types';
import { projectsRepo, deleteProjectCascade } from '@/services/db/repositories';

interface NewProjectInput {
  title: string;
  description: string;
  genre: string;
  status: ProjectStatus;
  ownerId: string;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  load: () => Promise<void>;
  create: (input: NewProjectInput) => Promise<Project>;
  update: (id: string, patch: Partial<NewProjectInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    const projects = await projectsRepo.list();
    projects.sort((a, b) => b.updatedAt - a.updatedAt);
    set({ projects, loading: false });
  },
  create: async (input) => {
    const project = await projectsRepo.create({ ...input, tags: [] });
    await get().load();
    return project;
  },
  update: async (id, patch) => {
    await projectsRepo.update(id, patch);
    await get().load();
  },
  remove: async (id) => {
    await deleteProjectCascade(id);
    await get().load();
  },
}));
