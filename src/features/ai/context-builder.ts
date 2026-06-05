import { charactersRepo, locationsRepo } from '@/services/db/repositories';

/**
 * Builds retrieval context for AI requests (PRD §52, §92, §274). NEVER returns
 * the whole manuscript — only the current chapter slice plus relevant
 * story-bible entries, trimmed to a token-ish character budget.
 */
const CHAR_BUDGET = 6000;

export interface ContextInput {
  projectId: string;
  projectTitle: string;
  chapterTitle?: string;
  chapterContent?: string;
  selectedText?: string;
}

export async function buildStoryContext(input: ContextInput): Promise<string> {
  const [characters, locations] = await Promise.all([
    charactersRepo.byProject(input.projectId),
    locationsRepo.byProject(input.projectId),
  ]);

  const parts: string[] = [];
  parts.push(`# Project: ${input.projectTitle}`);

  if (characters.length) {
    const list = characters
      .slice(0, 20)
      .map((c) => `- ${c.name}${c.traits ? ` — ${c.traits}` : ''} (${c.status})`)
      .join('\n');
    parts.push(`## Characters\n${list}`);
  }
  if (locations.length) {
    const list = locations
      .slice(0, 20)
      .map((l) => `- ${l.name}${l.type ? ` (${l.type})` : ''}`)
      .join('\n');
    parts.push(`## Locations\n${list}`);
  }
  if (input.chapterTitle || input.chapterContent) {
    const body = (input.chapterContent ?? '').slice(0, 3000);
    parts.push(`## Current chapter: ${input.chapterTitle ?? ''}\n${body}`);
  }
  if (input.selectedText) {
    parts.push(`## Selected text\n${input.selectedText.slice(0, 1500)}`);
  }

  return parts.join('\n\n').slice(0, CHAR_BUDGET);
}
