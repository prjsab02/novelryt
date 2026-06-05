import { runAI } from '@/features/ai/client';
import {
  projectsRepo,
  chaptersRepo,
  charactersRepo,
  locationsRepo,
  eventsRepo,
} from '@/services/db/repositories';

/** Analysis depth (PRD §104–§107). */
export type DiagnosticsMode = 'quick' | 'standard' | 'deep';

export const MODE_LABELS: Record<DiagnosticsMode, string> = {
  quick: 'Quick',
  standard: 'Standard',
  deep: 'Deep',
};

export const MODE_HINTS: Record<DiagnosticsMode, string> = {
  quick: 'Grammar, readability, chapter structure.',
  standard: 'Character consistency, pacing, continuity, scene effectiveness.',
  deep: 'Plot architecture, character arcs, theme, foreshadowing, structure.',
};

const SYSTEM =
  'You are NovelRyt Story Doctor, an intelligent developmental editor. You ' +
  'analyze and advise; you NEVER rewrite the manuscript. Be specific and cite ' +
  'chapter titles. For each finding give: Issue, Why it matters, Severity ' +
  '(low/medium/high), Confidence (low/medium/high), and a Suggestion. Group ' +
  'findings by category. If the story looks consistent, say so plainly. Output ' +
  'concise Markdown.';

const FOCUS: Record<DiagnosticsMode, string> = {
  quick: 'Focus on grammar, readability, and chapter-level structure only.',
  standard:
    'Focus on character consistency, pacing, continuity errors, and scene effectiveness.',
  deep:
    'Perform a deep analysis: plot architecture, character arcs, thematic cohesion, ' +
    'foreshadowing/payoff, unresolved threads, and overall narrative structure.',
};

/** Token-conscious context: titles + summaries + truncated bodies + bible. */
async function gatherContext(projectId: string): Promise<string> {
  const [project, chapters, characters, locations, events] = await Promise.all([
    projectsRepo.get(projectId),
    chaptersRepo.byProject(projectId),
    charactersRepo.byProject(projectId),
    locationsRepo.byProject(projectId),
    eventsRepo.byProject(projectId),
  ]);

  chapters.sort((a, b) => a.order - b.order);
  events.sort((a, b) => a.sequence - b.sequence);

  const parts: string[] = [`# Project: ${project?.title ?? 'Untitled'} (${project?.genre || 'n/a'})`];

  if (characters.length) {
    parts.push(
      '## Characters\n' +
        characters
          .map((c) => `- ${c.name} [${c.status}]${c.traits ? ` — ${c.traits}` : ''}${c.goals ? ` Goals: ${c.goals}` : ''}`)
          .join('\n'),
    );
  }
  if (locations.length) {
    parts.push('## Locations\n' + locations.map((l) => `- ${l.name}${l.type ? ` (${l.type})` : ''}`).join('\n'));
  }
  if (events.length) {
    parts.push(
      '## Timeline\n' +
        events.map((e) => `- [${e.dateLabel || `#${e.sequence}`}] ${e.title}${e.participants ? ` — ${e.participants}` : ''}`).join('\n'),
    );
  }

  // Per-chapter: title, word count, summary if present, otherwise a body excerpt.
  const perChapterBudget = Math.floor(8000 / Math.max(chapters.length, 1));
  parts.push(
    '## Chapters\n' +
      chapters
        .map((c) => {
          const body = c.summary?.trim() || c.content.slice(0, perChapterBudget);
          return `### ${c.title} (${c.wordCount} words)\n${body}`;
        })
        .join('\n\n'),
  );

  return parts.join('\n\n').slice(0, 14000);
}

export async function runDiagnostics(
  projectId: string,
  mode: DiagnosticsMode,
): Promise<string> {
  const context = await gatherContext(projectId);
  const prompt =
    `${FOCUS[mode]}\n\nAnalyze the following story material and report findings.\n\n${context}`;
  return runAI({ system: SYSTEM, prompt, temperature: 0.4 });
}
