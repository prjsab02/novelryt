import {
  projectsRepo,
  booksRepo,
  chaptersRepo,
  charactersRepo,
  locationsRepo,
  notesRepo,
} from '@/services/db/repositories';

export type ExportFormat = 'txt' | 'md' | 'json';

/** Trigger a browser download for the given content. */
function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
}

async function orderedChapters(projectId: string) {
  const chapters = await chaptersRepo.byProject(projectId);
  return chapters.sort((a, b) => a.order - b.order);
}

/** Manuscript as plain text or Markdown (PRD §129, Phase 14). */
async function manuscript(projectId: string, format: 'txt' | 'md'): Promise<string> {
  const project = await projectsRepo.get(projectId);
  const chapters = await orderedChapters(projectId);
  const title = project?.title ?? 'Untitled';
  const lines: string[] = [];

  if (format === 'md') lines.push(`# ${title}`, '');
  else lines.push(title.toUpperCase(), '');

  for (const c of chapters) {
    if (format === 'md') lines.push(`## ${c.title}`, '', c.content, '');
    else lines.push(c.title, '', c.content, '', '');
  }
  return lines.join('\n');
}

/** Full project backup as JSON (PRD §131, §389 — portable, restorable). */
async function backup(projectId: string): Promise<string> {
  const [project, books, chapters, characters, locations, notes] = await Promise.all([
    projectsRepo.get(projectId),
    booksRepo.byProject(projectId),
    chaptersRepo.byProject(projectId),
    charactersRepo.byProject(projectId),
    locationsRepo.byProject(projectId),
    notesRepo.byProject(projectId),
  ]);
  return JSON.stringify(
    {
      format: 'novelryt-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      project,
      books,
      chapters,
      characters,
      locations,
      notes,
    },
    null,
    2,
  );
}

export async function exportProject(projectId: string, format: ExportFormat): Promise<void> {
  const project = await projectsRepo.get(projectId);
  const base = slug(project?.title ?? 'project');
  if (format === 'json') {
    download(`${base}-backup.json`, await backup(projectId), 'application/json');
  } else if (format === 'md') {
    download(`${base}.md`, await manuscript(projectId, 'md'), 'text/markdown');
  } else {
    download(`${base}.txt`, await manuscript(projectId, 'txt'), 'text/plain');
  }
}
