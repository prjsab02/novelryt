import {
  projectsRepo,
  booksRepo,
  chaptersRepo,
  charactersRepo,
  locationsRepo,
  notesRepo,
} from '@/services/db/repositories';

export type ExportFormat = 'txt' | 'md' | 'json' | 'docx' | 'pdf';

/** Trigger a browser download for a string or Blob. */
function download(filename: string, content: string | Blob, mime: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
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

/** Build a .docx Blob from the manuscript (PRD §129). Lazy-loads `docx`. */
async function docxBlob(projectId: string): Promise<Blob> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import('docx');
  const project = await projectsRepo.get(projectId);
  const chapters = await orderedChapters(projectId);

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ text: project?.title ?? 'Untitled', heading: HeadingLevel.TITLE }),
  ];
  for (const c of chapters) {
    children.push(new Paragraph({ text: c.title, heading: HeadingLevel.HEADING_1 }));
    for (const para of c.content.split(/\n{2,}/)) {
      const text = para.replace(/\n/g, ' ').trim();
      children.push(new Paragraph({ children: [new TextRun(text)] }));
    }
  }
  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}

/** Open a print-friendly window so the user can "Save as PDF" (PRD §129). */
async function printPdf(projectId: string): Promise<void> {
  const project = await projectsRepo.get(projectId);
  const chapters = await orderedChapters(projectId);
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = chapters
    .map(
      (c) =>
        `<h2>${esc(c.title)}</h2>` +
        c.content
          .split(/\n{2,}/)
          .map((p) => `<p>${esc(p.replace(/\n/g, ' ').trim())}</p>`)
          .join(''),
    )
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(
    project?.title ?? 'Manuscript',
  )}</title><style>body{font-family:Georgia,serif;line-height:1.6;max-width:42rem;margin:2rem auto;padding:0 1rem}h1{text-align:center}h2{margin-top:2rem;page-break-before:always}h2:first-of-type{page-break-before:avoid}</style></head><body><h1>${esc(
    project?.title ?? 'Manuscript',
  )}</h1>${body}</body></html>`;
  const w = window.open('', '_blank');
  if (!w) throw new Error('Pop-up blocked. Allow pop-ups to export PDF.');
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export async function exportProject(projectId: string, format: ExportFormat): Promise<void> {
  const project = await projectsRepo.get(projectId);
  const base = slug(project?.title ?? 'project');
  if (format === 'json') {
    download(`${base}-backup.json`, await backup(projectId), 'application/json');
  } else if (format === 'md') {
    download(`${base}.md`, await manuscript(projectId, 'md'), 'text/markdown');
  } else if (format === 'docx') {
    download(
      `${base}.docx`,
      await docxBlob(projectId),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  } else if (format === 'pdf') {
    await printPdf(projectId);
  } else {
    download(`${base}.txt`, await manuscript(projectId, 'txt'), 'text/plain');
  }
}
